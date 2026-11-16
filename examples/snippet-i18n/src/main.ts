import {
  buildFontFallbackConfig,
  charsetUrlsFromBase,
  composeLayout,
  init,
  saveAnnotationsCommand,
  selectionActions,
  snapshotActions,
  type IconDef,
} from 'embedpdf-snippet-i18n';

const log = (text: string): void => {
  const el = document.getElementById('log');
  if (el) el.textContent = `${text}\n${el.textContent ?? ''}`.slice(0, 1000);
};

const AI_ICON: IconDef = {
  viewBox: '0 0 1024 1024',
  paths: [
    {
      d: 'M512 96 594 394 892 476 594 558 512 856 430 558 132 476 430 394Z M790 640 838 786 984 834 838 882 790 1028 742 882 596 834 742 786Z',
      fill: 'currentColor',
    },
  ],
};
const TRANS_ICON: IconDef = {
  viewBox: '0 0 1024 1024',
  paths: [
    { d: 'M128 192h352v64H296v64h160v64H296v72h-64V192zM896 832 768 576H704l128 256H704v64h192Z', fill: 'currentColor' },
    { d: 'M544 832 416 576h-96l-32-64h64l192 384h-64zM96 576l128-320h64L160 576h-64z', fill: 'currentColor' },
  ],
};
const BACK_ICON: IconDef = {
  viewBox: '0 0 1024 1024',
  paths: [{ d: 'M320 512 704 128l-64-64-448 448 448 448 64-64Z', fill: 'currentColor' }],
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
  documents: [{ src: `${base}/ebook.pdf`, name: '测试的文件.pdf', active: true }],  identity: { displayName: '匿名用户' },
  theme: { accent: '#2D8A65' },
  icons: { custom_ai: AI_ICON, custom_trans: TRANS_ICON, custom_back: BACK_ICON },
  // 自托管 CJK 回退字体：与 v2 部署同构的 /fonts/<charset> 目录。
  engine: { fallbackFonts: buildFontFallbackConfig(charsetUrlsFromBase(`${location.origin}${base}`)) },
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
