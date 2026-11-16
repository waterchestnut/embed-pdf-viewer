/**
 * Command + layout factories for the console apps' custom actions: the v2
 * `registerCommand`/`mergeSchema` dance becomes data the viewer merges at
 * init, and one layout placement per action.
 */
import {
  DocumentsToken,
  RenderToken,
  SelectionToken,
  type CommandDefinition,
  type Layout,
  type LayoutFunction,
  type ViewerPlugins,
} from '@embedpdf/viewer/snippet';

// ── selected text ───────────────────────────────────────────────────────────

/** One button on the selection strip that receives the selected text. */
export interface SelectionAction {
  /** `area:action`, e.g. `review:ai`. Shown through `label`, or `labelKey`. */
  readonly id: string;
  readonly label: string;
  readonly labelKey?: string;
  /** An icon name from the `icons` config. Without one the button shows text. */
  readonly icon?: string;
  /** Called with the selection read, after the selection is cleared. */
  readonly onText: (text: string, documentId: string) => void | Promise<void>;
}

/**
 * The v2 `custom.selection.*` commands: each reads the selection, clears it
 * and hands the text over. The buttons land before the built-in selection
 * items — where the fork's snippet put them.
 */
export function selectionActions(
  actions: readonly SelectionAction[],
): { commands: readonly CommandDefinition[]; layout: LayoutFunction } {
  const commands = actions.map<CommandDefinition>((action) => ({
    id: action.id,
    label: action.label,
    ...(action.labelKey !== undefined ? { labelKey: action.labelKey } : {}),
    ...(action.icon !== undefined ? { icon: action.icon } : {}),
    run: async (ctx) => {
      const selection = ctx.tryGet(SelectionToken);
      if (!selection) return;
      const text = await selection.readText();
      selection.clear();
      if (text) await action.onText(text, ctx.documentId ?? '');
    },
  }));
  const layout: LayoutFunction = (base) =>
    actions.reduce<Layout>(
      (l, action) => l.add(action.id, { to: 'selection', before: 'selection:copy' }),
      base,
    );
  return { commands, layout };
}

// ── snapshots ───────────────────────────────────────────────────────────────

type Snapshot = NonNullable<ReturnType<ViewerPlugins['render']['getSnapshot']>>;

/** The picture of a snapshot: a PNG, as the render plugin hands it over. */
export type SnapshotImage = Awaited<Snapshot['image']>;

/** What a snapshot action receives — the v2 `CaptureData` in 3.x clothes. */
export interface SnapshotData {
  /** Zero-based, exactly like v2: the filename convention stays `pageIndex + 1`. */
  readonly pageIndex: number;
  /** The PNG blob, already read: `formData.append('file', blob, …)` as before. */
  readonly blob: Blob;
}

/** One button under the snapshot box that receives its picture. */
export interface SnapshotAction {
  readonly id: string;
  readonly label: string;
  readonly labelKey?: string;
  readonly icon?: string;
  /**
   * Called with the snapshot's picture. A box let go while the picture was
   * being made calls nothing, like the built-in copy/save drop it too.
   */
  readonly onSnapshot: (data: SnapshotData, documentId: string) => void | Promise<void>;
}

/**
 * The v2 `captureExtActions`: buttons on the snapshot strip (feature
 * `snapshots` on) that receive the marquee's picture.
 */
export function snapshotActions(
  actions: readonly SnapshotAction[],
): { commands: readonly CommandDefinition[]; layout: LayoutFunction } {
  const commands = actions.map<CommandDefinition>((action) => ({
    id: action.id,
    label: action.label,
    ...(action.labelKey !== undefined ? { labelKey: action.labelKey } : {}),
    ...(action.icon !== undefined ? { icon: action.icon } : {}),
    run: async (ctx) => {
      const render = ctx.tryGet(RenderToken);
      const snapshot = render?.getSnapshot();
      if (!snapshot) return;
      let image: SnapshotImage;
      try {
        image = await snapshot.image;
      } catch {
        return; // the snapshot was let go first: nothing to act on
      }
      // The display index, the way the chrome names a snapshot's own file.
      const documents = ctx.tryGet(DocumentsToken);
      const pageIndex =
        documents
          ?.listPages(ctx.documentId ?? undefined)
          .findIndex((info) => info.ref.objectNumber === snapshot.page.objectNumber) ?? -1;
      const data: SnapshotData = { pageIndex, blob: await image.blob() };
      await action.onSnapshot(data, ctx.documentId ?? '');
    },
  }));
  const layout: LayoutFunction = (base) =>
    actions.reduce<Layout>(
      (l, action) => l.add(action.id, { to: 'snapshot', after: 'snapshot:save' }),
      base,
    );
  return { commands, layout };
}

// ── saving annotations ──────────────────────────────────────────────────────

/**
 * The v2 `custom.toolbar.save` command: the document with its pending changes
 * written out, in memory, for the host to upload. `download()` flushes the
 * unsaved changes first — the same copy the browser's Save would give.
 */
export function saveAnnotationsCommand(
  onSave: (buffer: Uint8Array, name: string) => void | Promise<void>,
  id = 'custom:save-annotations',
): CommandDefinition {
  return {
    id,
    label: '保存批注',
    icon: 'save',
    run: async (ctx) => {
      if (!ctx.documentId) return;
      const documents = ctx.tryGet(DocumentsToken);
      if (!documents) return;
      const buffer = await documents.download(ctx.documentId);
      const raw = documents.get(ctx.documentId)?.name ?? 'document';
      const name = /\.pdf$/i.test(raw) ? raw : `${raw}.pdf`;
      await onSave(buffer, name);
    },
  };
}
