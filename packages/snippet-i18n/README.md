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
发布版本号 = 上游 viewer 版本 + `-N` 后缀（如 `3.3.0-5`）。

## 发布清单

1. **同步上游**：`main` 快进到 `original-viewer/main`（wasm payload 哈希若变化，按
   `packages/engine/runtime` 的 `fetch-payload.sh` 重新拉取，需 `core.autocrlf=input` 保持 LF），
   然后 `feature/v3-snippet rebase main`。
2. **升版本**：`package.json` 的 `version` 改为 `上游号-N`，提交。
3. **构建**：`pnpm --filter embedpdf-snippet-i18n build`（含 publint/attw 审计）。
4. **发布**——必须用 **pnpm**，且在设置 `NPM_TOKEN` 后执行：
   ```powershell
   $env:NPM_TOKEN = '<npm token>'   # 仓库 .npmrc 的 _authToken=${NPM_TOKEN} 需要它；
                                    # 不设时 pnpm 会用空 token 覆盖用户级配置，registry 伪装成 404
   pnpm --filter embedpdf-snippet-i18n publish --no-git-checks
   ```
   不要用 `npm publish`：它**不重写 publishConfig 与 `workspace:*`**，发出去的 manifest
   `exports` 指向未发布的 `src/`、依赖带着 `workspace:*` 协议，消费者直接损坏（3.3.0-1/-2/-3 的教训）。
   发布后 npm 有几分钟 "processing" 窗口，期间对该包的写入会返回 404，属正常。
5. **npmmirror 同步**（CI/国内安装走镜像，新包与升级版本首次都要触发；幂等。以下命令在仓库根执行）：
   ```powershell
   # 根包
   curl.exe -X PUT "https://registry.npmmirror.com/-/package/embedpdf-snippet-i18n/syncs"
   # @embedpdf 全闭包（上游发新版后同样需要，逐个触发同步任务）
   Get-ChildItem .\packages -Recurse -Filter package.json -File |
     Where-Object { $_.FullName -notmatch 'node_modules|dist|runtime-src' } |
     ForEach-Object { (Get-Content $_.FullName -Raw | ConvertFrom-Json).name } |
     Sort-Object -Unique | Where-Object { $_ -like '@embedpdf/*' } |
     ForEach-Object { curl.exe -s -X PUT "https://registry.npmmirror.com/-/package/$($_ -replace '/','%2f')/syncs" | Out-Null; Write-Output "synced: $_" }
   # 验证：302/200 = 就绪（302 是跳 CDN，不是失败）；404 = 仍在队列，稍后再查
   curl.exe -s -o NUL -w "%{http_code}" https://registry.npmmirror.com/embedpdf-snippet-i18n/-/embedpdf-snippet-i18n-<版本>.tgz
   ```
6. **消费方**：三个调用方升到 `^<新版本>`（`pnpm install` + tsc + 部署）；Pages 站点
   需要重建时，`examples/snippet-i18n` 构建后铺进 `3.x` 分支 `docs/` 并 force push。
