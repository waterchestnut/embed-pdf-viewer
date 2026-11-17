/**
 * The v2 icon shape, scaled for 3.x.
 *
 * The chrome paints every icon in a fixed `viewBox="0 0 24 24"`, while the
 * console apps' brand glyphs (AI, 翻译, 引用, 返回) are 1024-grid filled paths
 * with `fill: 'currentColor'`. A 1024 path drawn in a 24 box is a speck in the
 * corner, so `legacyIcon` rewrites the path data onto the 24 grid itself: every
 * coordinate scales by 24/viewBoxWidth, arc radii scale, arc rotation and the
 * two 0/1 arc flags do not, and `H`/`V` scale their one axis. The bytes then
 * render at the same shape, filled with the text color like before.
 */
import type { IconDef } from '@embedpdf/viewer/snippet';

/** What v2's `icons` config took: a viewBox and paths with color strings. */
export interface LegacyIcon {
  readonly viewBox?: string;
  readonly paths: readonly { readonly d: string; readonly fill?: string; readonly stroke?: string }[];
}

const GRID = 24;

/** The scale a `0 0 W W` viewBox asks for (1 when unset). */
function scaleOf(viewBox: string | undefined): number {
  const parts = (viewBox ?? '').trim().split(/[\s,]+/).map(Number);
  const width = parts[2];
  return width && Number.isFinite(width) ? GRID / width : 1;
}

const round = (value: number): number => Math.round(value * 1e4) / 1e4;

/** Numbers per parameter group and which of them are arc flags, by command. */
const PARAMS: Readonly<Record<string, readonly number[]>> = {
  M: [2],
  L: [2],
  T: [2],
  H: [1],
  V: [1],
  C: [6],
  S: [4],
  Q: [4],
  A: [7],
  Z: [0],
};

/**
 * One `d` scaled: split into a command letter + its numbers, repeat the group
 * for implicit poly-arguments, scale the coordinates only. `keep` lists the
 * zero-based number slots a command must not scale (arcs: rotation, flags).
 */
function scalePath(d: string, scale: number): string {
  // A number with an optional leading sign / dot, the SVG token.
  const token = /[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/y;
  const letter = /[MmLlHhVvCcSsQqTtAaZz]/;
  let out = '';
  let i = 0;
  let command = '';
  while (i < d.length) {
    const ch = d[i]!;
    if (letter.test(ch)) {
      command = ch.toUpperCase();
      out += `${command === d[i] ? '' : ' '}${ch}`;
      i++;
      continue;
    }
    const group = PARAMS[command] ?? [2];
    const size = group[0]!;
    if (size === 0) {
      i++; // Z with no numbers: stray separator, skip.
      continue;
    }
    // Read one full parameter group.
    const numbers: string[] = [];
    while (numbers.length < size && i < d.length) {
      while (i < d.length && /[\s,]/.test(d[i]!)) i++;
      if (i >= d.length || letter.test(d[i]!)) break;
      // Arc flags are a single 0/1 digit, sometimes written tight against the
      // next number (`.5.5 01 1`): when a slot wants a flag, take one digit.
      if (command === 'A' && (numbers.length === 3 || numbers.length === 4)) {
        out += ` ${d[i]!}`;
        numbers.push(d[i]!);
        i++;
        continue;
      }
      token.lastIndex = i;
      const match = token.exec(d);
      if (!match) break;
      i = token.lastIndex;
      const raw = match[0];
      // Arc slot 2 is the x-axis rotation (degrees): not a coordinate.
      const keep = command === 'A' && numbers.length === 2;
      out += ` ${keep ? raw : String(round(Number(raw) * scale))}`;
      numbers.push(raw);
    }
    // An arc's group of 7 can repeat (implicit next arc) without a new letter.
    if (command === 'A' && numbers.length === size) {
      while (i < d.length && !letter.test(d[i]!) && hasNumberAhead(d, i, token)) {
        const before = i;
        i = repeatArc(d, i, scale, token, (text) => {
          out += text;
        });
        if (i === before) break;
      }
    }
  }
  return out.trim();
}

/** Whether a number token starts at `i` (used to keep implicit repeats bounded). */
function hasNumberAhead(d: string, i: number, token: RegExp): boolean {
  token.lastIndex = i;
  return token.test(d.slice(i));
}

/** Read one repeated `rx ry rot laf sf x y` group, appending the scaled text. */
function repeatArc(
  d: string,
  start: number,
  scale: number,
  token: RegExp,
  emit: (text: string) => void,
): number {
  let i = start;
  const parts: string[] = [];
  for (let n = 0; n < 7 && i < d.length; n++) {
    while (i < d.length && /[\s,]/.test(d[i]!)) i++;
    if (n === 3 || n === 4) {
      emit(` ${d[i]!}`);
      parts.push(d[i]!);
      i++;
      continue;
    }
    token.lastIndex = i;
    const m = token.exec(d.slice(i));
    if (!m) return i;
    i += m[0].length;
    const scaled = n === 2 ? m[0] : String(round(Number(m[0]) * scale));
    emit(` ${scaled}`);
    parts.push(m[0]);
  }
  return i;
}

/**
 * One old icon def as a 3.x `IconDef`: paths on the 24 grid, filled — the v2
 * color string meant "paint with the text color", what `fill: true` says now.
 * A path that only stroked keeps `fill: false` so it stays an outline.
 */
export function legacyIcon(icon: LegacyIcon): IconDef {
  const scale = scaleOf(icon.viewBox);
  const paths = icon.paths.map((path) => ({ d: scalePath(path.d, scale) }));
  const strokeOnly = icon.paths.some((path) => path.stroke && !path.fill);
  return { paths, fill: !strokeOnly };
}

/**
 * The fork's own button icons, drawn the way the chrome draws its set:
 * stroked outlines on the 24 grid (Tabler/Lucide geometry), so they sit in
 * the strip and on the toolbar like they belong there. v2 shipped filled
 * 1024-grid glyphs for these, which scale down to smudges.
 *
 * `custom_ai` sparkle (AI 解读), `custom_trans` languages (翻译),
 * `custom_back` arrow-left (返回), `custom_quote` double commas (引用).
 * Pass as the `icons` config and name them from your commands.
 */
export const FORK_ICONS: Readonly<Record<string, IconDef>> = {
  custom_ai: {
    paths: [
      { d: 'M12 3l1.9 5.7a2 2 0 0 0 1.3 1.3l5.8 1.9l-5.8 1.9a2 2 0 0 0-1.3 1.3l-1.9 5.8l-1.9-5.8a2 2 0 0 0-1.3-1.3l-5.8-1.9l5.8-1.9a2 2 0 0 0 1.3-1.3z' },
      { d: 'M5 3v4' },
      { d: 'M3 5h4' },
      { d: 'M19 17v4' },
      { d: 'M17 19h4' },
    ],
    fill: false,
  },
  custom_trans: {
    paths: [
      { d: 'm5 8l6 6' },
      { d: 'm4 14l6-6l2-3' },
      { d: 'M2 5h12' },
      { d: 'M7 2h1' },
      { d: 'm22 22l-5-10l-5 10' },
      { d: 'M14 18h4' },
    ],
    fill: false,
  },
  custom_back: {
    paths: [
      { d: 'M5 12h14' },
      { d: 'm8 9l-3 3l3 3' },
    ],
    fill: false,
  },
  custom_quote: {
    paths: [
      // 一对逗号形引号 ❝：圆头 + 下拖尾，16px 下仍读得出“引用”。
      { d: 'M10 10.5A2.5 2.5 0 1 0 7.5 13c0 2.5-1 4-3 5' },
      { d: 'M18 10.5A2.5 2.5 0 1 0 15.5 13c0 2.5-1 4-3 5' },
    ],
    fill: false,
  },
};
