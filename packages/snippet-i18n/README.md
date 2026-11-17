# embedpdf-snippet-i18n

EmbedPDF 3.x 查看器的中文定制发行层，供 `pdfviewer.console` / `xxzx.callin.console`
等宿主应用使用。它是官方 [`@embedpdf/viewer`](../viewer/main) snippet 门之上的薄封装：
完整的查看器（工具栏、标注、表单、签名、Preact、CSS、PDFium wasm 引擎）都由
`@embedpdf/viewer` 一个包交付，本包只补上 fork 在 v2 时代积累的几件事：

- **简中措辞覆盖**（`strings`，默认 `locale: 'zh-CN'`）：自由文本、随意画、线宽、
  线型、缩放选项、`{tool}的默认属性` 等，见 `src/strings.ts`；
- **`onFileSelected`**：用户通过“打开”菜单 / `Mod+O` / 拖放选择本地 PDF 时，先于读取
  把 `File` 报给宿主（v2 `documentManager.onFileSelected` 的等价物，经覆盖
  `document:open` 命令实现，不修改上游包）；
- **`maxDocuments`**：v2 的同名设置；3.x 内核没有上限，超限时关闭最旧的非活动文档；
- **快照默认开启**（`features.snapshots`，即 v2 的截图能力）；
- **worker 默认 `'inline'`**：宿主打包本包时不必再落 `embedpdf-worker.js` 文件，
  wasm 仍按 v2 习惯用 `engine.wasmUrl` 指向同源目录；
- **命令工厂**：`selectionActions`（选中文本 → AI 解读/翻译/引用）、
  `snapshotActions`（v2 `captureExtActions` 的截图扩展按钮）、
  `saveAnnotationsCommand`（批注另存为 buffer，v2 `saveAsCopyAndGetBufferAndName`）、
  `composeLayout`；
- **字体（3.x 原生方案）**：arabic/hebrew 由引擎内置 `defaultFallbackFonts`（默认开）随应用
  懒加载；CJK+Latin 一个 `DroidSansFallbackFull.ttf` 放宿主根目录，
  `fallbackFonts: nativeFallbackFonts(url)`（官方示例同款资产）；
- **`buildFontFallbackConfig`（兼容层）**：v2 `buildCdnFontConfig` 的 3.x 形态，按
  `<base>/fonts/<charset>/<file>` 加载旧部署的思源/Noto 文件集，供沿用 v2 静态站的环境。

## 用法

```ts
import { init, selectionActions, snapshotActions, saveAnnotationsCommand, composeLayout, nativeFallbackFonts, FORK_ICONS } from 'embedpdf-snippet-i18n';

const sel = selectionActions([
  { id: 'review:ai', label: 'AI解读', icon: 'custom_ai', onText: (text) => askAI(text) },
]);
const snap = snapshotActions([
  { id: 'review:capture-ai', label: 'AI解读', onSnapshot: (data) => askVision(data.blob) },
]);
const save = saveAnnotationsCommand((buffer, name) => upload(buffer, name));

const handle = init({
  target: container,
  documents: [{ src: pdfUrl, name: '文献.pdf' }],
  engine: { wasmUrl: `${viewerBaseUrl}/embedpdf.wasm`, fallbackFonts: nativeFallbackFonts(`${viewerBaseUrl}/DroidSansFallbackFull.ttf`) },
  identity: { displayName: '匿名用户' },
  theme: { accent: '#2D8A65' },
  icons: { ...FORK_ICONS },
  commands: [...sel.commands, ...snap.commands, save],
  layout: composeLayout(sel.layout, snap.layout, (base) => base.tabs('never')),
  onFileSelected: (file) => noteLocalOpen(file),
  maxDocuments: 5,
});

await handle.viewer; // Viewer：documents / commands / get('selection') …
handle.destroy();    // 卸载
```

## v2 → v3 迁移速查

| v2 配置 | 本包 / 3.x |
|---|---|
| `wasmUrl` | `engine.wasmUrl`（文件名 `pdfium.wasm` → **`embedpdf.wasm`**） |
| `worker: true` | `engine.worker: 'inline'`（默认） |
| `documentManager.initialDocuments` | `documents: [{ src, name }]` |
| `documentManager.maxDocuments` | `maxDocuments` |
| `annotations.annotationAuthor` | `identity: { displayName }` |
| `i18n.defaultLocale` | `locale`（默认 `'zh-CN'`） |
| `fontFallback.fonts`（`buildCdnFontConfig`） | `engine.fallbackFonts`（原生：`nativeFallbackFonts(url)`；兼容旧部署：`buildFontFallbackConfig(charsetUrls)`） |
| `tabBar: 'never'` | `layout: (base) => base.tabs('never')` |
| `theme.light.accent.primary` | `theme: { accent }`（3.x 单一主色） |
| `captureExtActions` | `snapshotActions([...])` |
| `registry.getPlugin('commands')…registerCommand` + `ui.mergeSchema` | `commands: CommandDefinition[]` + `layout`（本包工厂或裸写） |
| `docManager.onFileSelected` | `onFileSelected` |
| `export.saveAsCopyAndGetBufferAndName` | `documents.download(id)`（`saveAnnotationsCommand` 已封装） |
| `selection.forDocument().getSelectedText()` | `selectionActions` 的 `onText`（内部 `selection.readText()`） |
| `registry` / `EmbedPdfContainer` | `handle.viewer`（`Promise<Viewer>`）；`viewer.get('selection' | 'documents' | …)` |

## 静态资源部署（pdfviewer 站点）

- `embedpdf.wasm`：取自 `@embedpdf/viewer/dist/embedpdf.js` 同目录产物
  （构建本仓库后在 `packages/viewer/main/dist/embedpdf.wasm`），替换旧的 `pdfium.wasm`；
- `DroidSansFallbackFull.ttf`：取自 `examples/snippet-react/public/`（官方 3.x 示例资产），
  部署到宿主根目录；旧的 `fonts/<charset>/` Noto 目录在原生方案下不再被引用（保留无害）；
- arabic/hebrew 无需部署：引擎 `defaultFallbackFonts` 默认开启，随应用 bundle 加载；
- 示例 PDF、favicon（`website/public/favicon.ico`）、Matomo 嵌入等属于宿主页面自身，不再由本包发布。

## 开发

本包在 fork 分支 `feature/v3-snippet` 上维护，位于 `packages/snippet-i18n`，
随 workspace 一起构建（`pnpm --filter embedpdf-snippet-i18n build`）。
发布版本号 = 上游 viewer 版本 + `-N` 后缀（如 `3.3.0-1`）。
