# 验证 harness：embedpdf-snippet-i18n

用 `init` 的完整配置面演练 fork 功能：选中浮动条 AI/翻译、快照条按钮、
保存批注 / 返回工具栏命令、`onFileSelected`、`maxDocuments`、`fallbackFonts`、
zh-CN 措辞覆盖（缩放选项等）。

```bash
pnpm --filter @embedpdf/example-snippet-i18n dev   # http://localhost:5173
```

控制台钩子：`window.__pdf.viewer.then(v => v.commands.execute('review:ai'))`。

## 静态资源（未入库）

`public/ebook.pdf` 与 `public/fonts/**` 不提交，本地跑一次即可再生：

```bash
cp ../../packages/viewer/main/public/ebook.pdf public/
# CJK 字体集沿用 v2 部署清单（48 个文件，7 个语系目录）：
git archive v2-custom viewers/snippet/public/fonts | tar -x -C public --strip-components=3
```
