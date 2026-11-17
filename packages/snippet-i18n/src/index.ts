/**
 * embedpdf-snippet-i18n — the 3.x viewer snippet for the xxzx consoles.
 *
 * A thin layer over the official `@embedpdf/viewer` snippet door: the whole
 * door (viewer, chrome, engine, Preact, CSS) ships through its one entry, and
 * this package adds what the v2 fork carried on top of upstream:
 *
 * - Simplified-Chinese wording overrides (`strings`, default locale `zh-CN`);
 * - the snapshot feature on by default (v2's capture);
 * - `onFileSelected`: the host learns which local file was picked, through a
 *   same-id override of the chrome's `document:open` command;
 * - `maxDocuments`: a cap on simultaneously open documents (no kernel
 *   equivalent of the v2 setting exists, so the oldest inactive one closes);
 * - the inline engine worker by default, since a console app bundles this
 *   package and the worker files are its own URLs to serve — point
 *   `engine.wasmUrl` at your host, like v2's `wasmUrl`;
 * - factories for the fork's commands: selection actions (AI 解读 / 翻译 /
 *   引用), snapshot actions (v2's `captureExtActions`), save-annotations.
 *
 * ```ts
 * import { init, selectionActions } from 'embedpdf-snippet-i18n';
 * const { commands, layout } = selectionActions([
 *   { id: 'review:ai', label: 'AI解读', icon: 'custom_ai', onText: askAI },
 * ]);
 * const viewer = init({
 *   target: '#pdf-viewer',
 *   documents: [{ src: pdfUrl, name: '文献.pdf' }],
 *   commands, layout,
 *   engine: { wasmUrl: `${base}/embedpdf.wasm` },
 *   identity: { displayName: '匿名用户' },
 * });
 * ```
 */
import EmbedPDF, {
  createLayout,
  type CommandDefinition,
  type Features,
  type InitOptions,
  type LanguageStrings,
  type LayoutData,
  type LayoutFunction,
  type Layout,
  type LocalEngineConfig,
  type Viewer,
} from '@embedpdf/viewer/snippet';

import { FORK_STRINGS } from './strings';
import { fileOpenEventCommand } from './open-file';

export * from '@embedpdf/viewer/snippet';
export { default as EmbedPDF } from '@embedpdf/viewer/snippet';
export * from './actions';
export * from './fonts';
export * from './icons';
export { fileOpenEventCommand } from './open-file';

/** The engine options, with this layer's own defaults documented on `init`. */
export type SnippetEngineConfig = LocalEngineConfig;

/** `InitOptions` plus the fork's extras; every other key is the door's own. */
export interface SnippetConfig extends Omit<InitOptions, 'engine' | 'features' | 'strings'> {
  /** The built-in local engine's options. `worker` defaults to `'inline'`. */
  engine?: SnippetEngineConfig;
  /** Over the door's defaults, which here are `{ snapshots: true }`. */
  features?: Features;
  /** Over the fork's zh-CN wording, which merges over the viewer's own. */
  strings?: Readonly<Record<string, LanguageStrings>>;
  /**
   * The v2 `onFileSelected`: fires when the user picks a local PDF (the Open
   * row, Mod+O, or a drop) with the chosen file, before its bytes are read.
   */
  onFileSelected?: (file: File) => void;
  /**
   * The v2 `maxDocuments`: at most this many documents stay open; when a new
   * one passes the cap, the oldest non-active one closes. Unset: no cap.
   */
  maxDocuments?: number;
}

/** What `init` hands back: the live element, its viewer, and a teardown. */
export interface SnippetHandle {
  /** The mounted `<embedpdf-viewer>`; its own config surface stays usable. */
  element: ReturnType<typeof EmbedPDF.init>;
  /** Resolves with the viewer handle when the element first reports ready. */
  viewer: Promise<Viewer>;
  /** Unmounts the viewer (the engine and workers retire with it). */
  destroy(): void;
}

/**
 * Mount the viewer with the fork's defaults. A plain pass-through of every
 * door setting; the five keys above are this layer's own.
 */
export function init(config: SnippetConfig): SnippetHandle {
  const {
    onFileSelected,
    maxDocuments,
    engine,
    features,
    strings,
    commands,
    locale = 'zh-CN',
    onReady,
    ...rest
  } = config;

  let becomeReady: (viewer: Viewer) => void = () => {};
  const viewer = new Promise<Viewer>((resolve) => {
    becomeReady = resolve;
  });

  const element = EmbedPDF.init({
    ...rest,
    locale,
    // Bundlers of the console apps never copy the door's worker files to a
    // known URL, and under a sandbox like wujie those URLs become
    // cross-origin `new Worker` failures; `'inline'` starts both workers from
    // the bundled bytes (blob:), the way the portable door does. The page's
    // own `wasmUrl` (like v2's) still locates the wasm.
    engine: { worker: 'inline', encoderWorker: 'inline', ...engine },
    // v2 shipped the capture dialog and every mode tab; 3.x gates
    // `snapshots`, `measurement`, `redaction` and `forms.building` (the form
    // designer, and with it the 表单 mode tab) off by default, so the fork
    // turns the full v2 surface back on (a user's `features` still wins).
    features: { snapshots: true, measurement: true, redaction: true, 'forms.building': true, ...features },
    strings: mergeStrings(FORK_STRINGS, strings),
    commands: [
      ...(onFileSelected ? [fileOpenEventCommand(onFileSelected)] : []),
      ...(commands ?? []),
    ] satisfies readonly CommandDefinition[],
    onReady: (live: Viewer) => {
      becomeReady(live);
      if (maxDocuments) capDocuments(live, maxDocuments);
      onReady?.(live);
    },
  });

  return { element, viewer, destroy: () => element.remove() };
}

/**
 * Run layout edits in order, the way v2 code applied several `mergeSchema`
 * passes: `composeLayout(selection.layout, (base) => base.tabs('never'))`.
 */
export function composeLayout(...fns: readonly LayoutFunction[]): LayoutFunction {
  return (base, env) => {
    let layout: Layout = base;
    for (const fn of fns) {
      const given = fn(layout, env);
      // A function may answer with plain data: take it back as a layout.
      layout =
        typeof (given as Layout).add === 'function' ? (given as Layout) : createLayout(given as LayoutData);
    }
    return layout;
  };
}

// ── internals ───────────────────────────────────────────────────────────────

/**
 * Language by language, word by word: the fork's dict yields to the user's,
 * a namespace only one of them has survives, and a loader on either side
 * replaces whatever was under it (merged dicts must stay literals).
 */
function mergeStrings(
  base: Readonly<Record<string, LanguageStrings>>,
  over: Readonly<Record<string, LanguageStrings>> | undefined,
): Readonly<Record<string, LanguageStrings>> {
  if (!over) return base;
  const merged: Record<string, LanguageStrings> = { ...base };
  for (const [code, dict] of Object.entries(over)) {
    const under = merged[code];
    merged[code] =
      isPlainDict(under) && isPlainDict(dict) ? deepMerge(under, dict) : (dict as LanguageStrings);
  }
  return merged;
}

type Dict = Record<string, unknown>;

function isPlainDict(value: LanguageStrings | undefined): value is Dict & LanguageStrings {
  return typeof value === 'object' && value !== null;
}

function deepMerge(base: Dict, over: Dict): LanguageStrings {
  const out: Dict = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const under = out[key];
    out[key] =
      typeof value === 'object' && value !== null && typeof under === 'object' && under !== null
        ? deepMerge(under as Dict, value as Dict)
        : value;
  }
  return out as LanguageStrings;
}

/** The oldest non-active document closes whenever the open list passes the cap. */
function capDocuments(viewer: Viewer, max: number): void {
  const documents = viewer.documents;
  let order: string[] = [];
  const enforce = (): void => {
    const alive = new Set(documents.list().map((info) => info.id));
    order = order.filter((id) => alive.has(id));
    while (order.length > max) {
      const active = documents.getActiveId();
      const victim = order.find((id) => id !== active);
      if (victim === undefined) return;
      documents.close(victim);
      order = order.filter((id) => id !== victim);
    }
  };
  documents.onOpened(({ documentId }) => {
    order.push(documentId);
    enforce();
  });
  documents.onClosed(({ documentId }) => {
    order = order.filter((id) => id !== documentId);
  });
  // Documents opened before this ran (the initial ones) are already listed.
  enforce();
}
