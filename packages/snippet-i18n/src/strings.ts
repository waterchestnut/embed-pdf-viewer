/**
 * The fork's Simplified-Chinese wording, over the viewer's own zh-CN pack.
 *
 * Keys mirror the chrome's locale corpus (`packages/viewer/chrome/src/locales/zh-cn.ts`),
 * so an entry replaces exactly one built-in string; the user's own `strings`
 * merge over these. Migrated from the v2 snippet's `translations.ts`: only
 * what the fork changed from upstream v2 is here — upstream 3.x already
 * absorbed the rest (波浪线, 不透明度, 起点/终点, 箭头, 加粗/斜体-style labels,
 * and the whole zh-TW corpus).
 */
import type { LanguageStrings } from '@embedpdf/viewer/snippet';

/**
 * The v2 `dd61f444c` 优化中文翻译 + `d5572dc66` 样式按钮标题, mapped to 3.x keys.
 * v2 entries with no 3.x counterpart are noted in the README, not guessed.
 */
export const forkZhCn: LanguageStrings = {
  commands: {
    zoom: {
      // v2 缩放菜单 → 缩放选项 (3.x shipped 缩放).
      menu: '缩放选项',
    },
    annotate: {
      // v2 任意文本 → 自由文本; 自由绘制 → 随意画.
      text: '自由文本',
      ink: '随意画',
    },
  },
  annotation: {
    // The kinds' names, as the style panel words them.
    freeText: '自由文本',
    ink: '随意画',
    style: {
      // v2 线条宽度 → 线宽; 线条样式 → 线型; Bold → 加粗.
      strokeWidth: '线宽',
      borderStyle: '线型',
      bold: '加粗',
    },
    alignments: {
      // v2 textAlignCenter: 左右居中 (3.x shipped 居中).
      center: '左右居中',
    },
  },
  stylePanel: {
    // v2 {type} 默认值 → {type}的默认属性.
    toolDefaults: '{tool}的默认属性',
  },
};

export const forkZhTw: LanguageStrings = {};

/** The `strings` config the init merges under the user's own. */
export const FORK_STRINGS: Readonly<Record<string, LanguageStrings>> = {
  'zh-CN': forkZhCn,
  'zh-TW': forkZhTw,
};
