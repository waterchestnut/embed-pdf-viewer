<div align="center">
  <a href="https://www.embedpdf.com">
    <img alt="EmbedPDF logo" src="https://www.embedpdf.com/logo-192.png" height="96">
  </a>

  <h1>EmbedPDF Snippet</h1>
  <p>The easiest way to embed PDF files in your website with a complete, ready‑to‑use interface.</p>

  <a href="https://www.embedpdf.com/docs/snippet/introduction"><img alt="Documentation" src="https://img.shields.io/badge/View%20Docs-0af?style=for-the-badge&labelColor=000000"></a>
  <a href="https://snippet.embedpdf.com/"><img alt="Live Demo" src="https://img.shields.io/badge/Try%20Live%20Demo-ff1493.svg?style=for-the-badge&labelColor=000000"></a>
</div>

---

## snippet模式扩展功能

- 支持多语言，在原库的基础上添加i18next支持，已添加英语和简体中文的语言包。
- 文本选中后的菜单支持通过参数的方式传递自定义按钮。
- 支持通过参数的方式传递样式表重置默认的主题色。

---

## react调用示例

```typescript jsx
import React, {useMemo, useState, useEffect, useRef, useCallback} from 'react'

import EmbedPDF from 'embedpdf-snippet-i18n'

interface PDFViewerProps {
  style?: React.CSSProperties
  className?: string
}

export default function PDFViewer({style, className}: PDFViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)

  const styles = `:host {
  --color-blue-50: oklch(96.9% 0.015 12.422);
  --color-blue-100: oklch(94.1% 0.03 12.58);
  --color-blue-200: oklch(89.2% 0.058 10.001);
  --color-blue-300: oklch(81% 0.117 11.638);
  --color-blue-400: oklch(71.2% 0.194 13.428);
  --color-blue-500: oklch(64.5% 0.246 16.439);
  --color-blue-600: oklch(58.6% 0.253 17.585);
  --color-blue-700: oklch(51.4% 0.222 16.935);
  --color-blue-800: oklch(45.5% 0.188 13.697);
  --color-blue-900: oklch(41% 0.159 10.272);
  --color-blue-950: oklch(27.1% 0.105 12.094);
}`

  useEffect(() => {
    if (!viewerRef.current) return

    const loadEmbedPDF = async () => {
      try {

        EmbedPDF.init({
          type: 'container',
          target: viewerRef.current!,
          src: 'https://domain.com/demo/368653411.pdf',
          worker: true,
          plugins: {
            annotation: {annotationAuthor: '匿名用户'}
          },
          wasmUrl: 'https://domain.com/pdfium.wasm',
          textSelectionMenuExtActions: [{
            id: 'action-ai',
            img: '/AI.svg',
            onClick: (text, selection) => {
              console.log(text, selection)
            },
            label: 'AI解读'
          }],
          styles
        })
      } catch (error) {
        console.error('Failed to load EmbedPDF:', error)
      }
    }

    loadEmbedPDF()
  }, [])

  return (
    <div
      id='pdf-viewer'
      className={className}
      style={{
        height: 'calc(100vh - 240px)',
        ...style,
      }}
      ref={viewerRef}
    />
  )
}

```

---

## 📚 Documentation

The full walkthrough, advanced examples, and API reference live in our docs site:

👉 **[https://www.embedpdf.com/docs/snippet/introduction](https://www.embedpdf.com/docs/snippet/introduction)**

---

## 🚀 Introduction

**EmbedPDF Snippet** is a *“batteries‑included”* drop‑in that turns any `<div>` into a professional PDF reader. No build step, no framework lock‑in—just copy, paste, and you’re done.

### Why choose the Snippet?

* **Complete UI out‑of‑the‑box** – toolbar, thumbnails, search, zoom & more
* **Zero build tooling** – works in plain HTML pages or alongside any JS framework
* **30‑second setup** – a single `<script type="module">` is all you need
* **Fully configurable** – tweak behavior with a lightweight options object
* **Runs everywhere** – modern browsers, frameworks, static sites & CMSes

---

## ⚡️ Quick Install

Add the CDN module and point it at a container:

```html filename="index.html" copy
<div id="pdf-viewer" style="height: 500px"></div>
<script async type="module">
  import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js';

  EmbedPDF.init({
    type: 'container',           // mount strategy
    target: document.getElementById('pdf-viewer'),
    src: 'https://snippet.embedpdf.com/ebook.pdf' // your PDF URL
  });
</script>
```

That’s it—refresh and enjoy a full‑featured viewer.

---

## 🛠 Basic Usage Pattern

1. **Container** – create a DOM element where the viewer will render.
2. **Import** – load `embedpdf.js` from the CDN with `type="module"`.
3. **Initialize** – call `EmbedPDF.init()` with your configuration.

### Minimal Example

```html filename="basic-example.html" copy
<!DOCTYPE html>
<html>
  <head><title>My PDF Viewer</title></head>
  <body>
    <div id="pdf-viewer" style="height: 100vh"></div>
    <script async type="module">
      import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js';

      EmbedPDF.init({
        type: 'container',
        target: document.getElementById('pdf-viewer'),
        src: 'https://snippet.embedpdf.com/ebook.pdf'
      });
    </script>
  </body>
</html>
```

## 📄 License

EmbedPDF Snippet is [MIT licensed](https://github.com/embedpdf/embed-pdf-viewer/blob/main/LICENSE). Commercial use is welcome—just keep the copyright headers intact.
