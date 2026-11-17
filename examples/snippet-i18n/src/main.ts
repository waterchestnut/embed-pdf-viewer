import {
  buildFontFallbackConfig,
  charsetUrlsFromBase,
  composeLayout,
  FORK_ICONS,
  init,
  saveAnnotationsCommand,
  selectionActions,
  snapshotActions,
} from 'embedpdf-snippet-i18n';

const params = new URLSearchParams(window.location.search);
const DEBUG = params.has('debug');
if (DEBUG) document.body.dataset.debug = '';

const log = (text: string): void => {
  console.log(text);
  if (!DEBUG) return;
  const el = document.getElementById('log');
  if (el) el.textContent = `${text}\n${el.textContent ?? ''}`.slice(0, 1000);
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const sel = selectionActions([
  {
    id: 'review:ai',
    label: 'AI解读',
    icon: 'custom_ai',
    onText: (text, documentId) => {
      log(`AI解读 [${documentId}]：${text.slice(0, 48)}${text.length > 48 ? '…' : ''}`);
    },
  },
  {
    id: 'review:trans',
    label: '翻译',
    icon: 'custom_trans',
    onText: (text, documentId) => {
      log(`翻译 [${documentId}]：${text.slice(0, 48)}${text.length > 48 ? '…' : ''}`);
    },
  },
]);

const snap = snapshotActions([
  {
    id: 'review:snapshot-ai',
    label: '截图AI',
    icon: 'custom_ai',
    onSnapshot: async (data, documentId) => {
      log(`截图AI [${documentId}] p${data.pageIndex + 1} ${Math.round(data.blob.size / 1024)}KB`);
    },
  },
]);

const save = saveAnnotationsCommand((buffer, name) => {
  log(`保存批注 ${name} (${Math.round(buffer.byteLength / 1024)}KB)`);
});

const back = {
  id: 'custom:back',
  label: '返回',
  icon: 'custom_back',
  run: () => log('返回（history.back 在宿主应用里）'),
};

const viewer = init({
  target: '#viewer',
  documents: [
    { src: `${base}/ebook.pdf`, name: '测试的文件.pdf', active: true },
    { src: `${base}/form.pdf`, name: '表单示例.pdf' },
  ],  identity: { displayName: '匿名用户' },
  theme: { accent: '#2D8A65' },
  icons: { ...FORK_ICONS },
  // 自托管 CJK 回退字体：相对路径，dev 与子目录部署（GitHub Pages /embed-pdf-viewer/）都成立。
  engine: { fallbackFonts: buildFontFallbackConfig(charsetUrlsFromBase(base)) },
  commands: [...sel.commands, ...snap.commands, save, back],
  layout: composeLayout(sel.layout, snap.layout, (l) =>
    l
      .add(back.id, { to: 'main', before: 'menu:document' })
      .add(save.id, { to: 'main', section: 'end' })
      // v2 的“截图AI解析”开关按钮：3.x 直接把快照工具放上主工具栏。
      .add('tool:snapshot', { to: 'main', section: 'end' }),
  ),
  onFileSelected: (file) => log(`本地文件已选择：${file.name} (${Math.round(file.size / 1024)}KB)`),
  maxDocuments: 5,
});

viewer.viewer.then(() => log('查看器就绪'));

// 测试钩子：控制台可用 window.__pdf.viewer 拿 Viewer handle 直接 execute 命令。
(window as unknown as { __pdf: typeof viewer }).__pdf = viewer;
