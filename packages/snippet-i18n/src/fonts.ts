/**
 * Self-hosted fallback fonts: the v2 `buildCdnFontConfig` successor.
 *
 * The v2 snippet served each script's font folder from the viewer's own base
 * URL (`https://…/fonts/sc`, jsDelivr by default upstream) and handed the
 * engine a per-charset list of `{url, weight, italic}` variants. 3.x wants a
 * flat `RecipeFontSpec[]` on the engine (`fallbackFonts`), one entry per file,
 * located by URL — same bytes, one shape over.
 */
import type { LocalEngineConfig } from '@embedpdf/viewer/snippet';

/** A fallback font entry as the engine recipe takes it. */
export type FallbackFontSpec = NonNullable<LocalEngineConfig['fallbackFonts']>[number];

/** The scripts the v2 snippet shipped fonts for. */
export const FONT_CHARSETS = ['arabic', 'hebrew', 'jp', 'kr', 'latin', 'sc', 'tc'] as const;

export type FontCharset = (typeof FONT_CHARSETS)[number];

/** Family names per charset, as v2's font packages documented them. */
const FONT_FAMILY: Readonly<Record<FontCharset, string>> = {
  arabic: 'Noto Naskh Arabic',
  hebrew: 'Noto Sans Hebrew',
  jp: 'Noto Sans JP',
  kr: 'Noto Sans KR',
  sc: 'Noto Sans Hans',
  tc: 'Noto Sans Hant',
  latin: 'Noto Sans',
};

/**
 * The font files of one charset folder: what the deployed `fonts/<charset>/`
 * directories hold, and what v2's `@embedpdf/fonts-*` packages listed (their
 * `FontFile[]` definitions; family names from the packages' docs).
 */
const FONT_FILES: Readonly<Record<FontCharset, readonly FontFile[]>> = {
  arabic: [
    { file: 'NotoNaskhArabic-Regular.ttf', familyName: FONT_FAMILY.arabic, weight: 400 },
    { file: 'NotoNaskhArabic-Bold.ttf', familyName: FONT_FAMILY.arabic, weight: 700 },
  ],
  hebrew: [
    { file: 'NotoSansHebrew-Regular.ttf', familyName: FONT_FAMILY.hebrew, weight: 400 },
    { file: 'NotoSansHebrew-Bold.ttf', familyName: FONT_FAMILY.hebrew, weight: 700 },
  ],
  jp: [
    { file: 'NotoSansJP-Thin.otf', familyName: FONT_FAMILY.jp, weight: 100 },
    { file: 'NotoSansJP-Light.otf', familyName: FONT_FAMILY.jp, weight: 300 },
    { file: 'NotoSansJP-DemiLight.otf', familyName: FONT_FAMILY.jp, weight: 350 },
    { file: 'NotoSansJP-Regular.otf', familyName: FONT_FAMILY.jp, weight: 400 },
    { file: 'NotoSansJP-Medium.otf', familyName: FONT_FAMILY.jp, weight: 500 },
    { file: 'NotoSansJP-Bold.otf', familyName: FONT_FAMILY.jp, weight: 700 },
    { file: 'NotoSansJP-Black.otf', familyName: FONT_FAMILY.jp, weight: 900 },
  ],
  kr: [
    { file: 'NotoSansKR-Thin.otf', familyName: FONT_FAMILY.kr, weight: 100 },
    { file: 'NotoSansKR-Light.otf', familyName: FONT_FAMILY.kr, weight: 300 },
    { file: 'NotoSansKR-DemiLight.otf', familyName: FONT_FAMILY.kr, weight: 350 },
    { file: 'NotoSansKR-Regular.otf', familyName: FONT_FAMILY.kr, weight: 400 },
    { file: 'NotoSansKR-Medium.otf', familyName: FONT_FAMILY.kr, weight: 500 },
    { file: 'NotoSansKR-Bold.otf', familyName: FONT_FAMILY.kr, weight: 700 },
    { file: 'NotoSansKR-Black.otf', familyName: FONT_FAMILY.kr, weight: 900 },
  ],
  sc: [
    { file: 'NotoSansHans-Light.otf', familyName: FONT_FAMILY.sc, weight: 300 },
    { file: 'NotoSansHans-DemiLight.otf', familyName: FONT_FAMILY.sc, weight: 350 },
    { file: 'NotoSansHans-Regular.otf', familyName: FONT_FAMILY.sc, weight: 400 },
    { file: 'NotoSansHans-Medium.otf', familyName: FONT_FAMILY.sc, weight: 500 },
    { file: 'NotoSansHans-Bold.otf', familyName: FONT_FAMILY.sc, weight: 700 },
  ],
  tc: [
    { file: 'NotoSansHant-Thin.otf', familyName: FONT_FAMILY.tc, weight: 100 },
    { file: 'NotoSansHant-Light.otf', familyName: FONT_FAMILY.tc, weight: 300 },
    { file: 'NotoSansHant-DemiLight.otf', familyName: FONT_FAMILY.tc, weight: 350 },
    { file: 'NotoSansHant-Regular.otf', familyName: FONT_FAMILY.tc, weight: 400 },
    { file: 'NotoSansHant-Medium.otf', familyName: FONT_FAMILY.tc, weight: 500 },
    { file: 'NotoSansHant-Bold.otf', familyName: FONT_FAMILY.tc, weight: 700 },
    { file: 'NotoSansHant-Black.otf', familyName: FONT_FAMILY.tc, weight: 900 },
  ],
  latin: [
    { file: 'NotoSans-Thin.ttf', familyName: FONT_FAMILY.latin, weight: 100 },
    { file: 'NotoSans-ThinItalic.ttf', familyName: FONT_FAMILY.latin, weight: 100, italic: true },
    { file: 'NotoSans-ExtraLight.ttf', familyName: FONT_FAMILY.latin, weight: 200 },
    {
      file: 'NotoSans-ExtraLightItalic.ttf',
      familyName: FONT_FAMILY.latin,
      weight: 200,
      italic: true,
    },
    { file: 'NotoSans-Light.ttf', familyName: FONT_FAMILY.latin, weight: 300 },
    { file: 'NotoSans-LightItalic.ttf', familyName: FONT_FAMILY.latin, weight: 300, italic: true },
    { file: 'NotoSans-Regular.ttf', familyName: FONT_FAMILY.latin, weight: 400 },
    { file: 'NotoSans-Italic.ttf', familyName: FONT_FAMILY.latin, weight: 400, italic: true },
    { file: 'NotoSans-Medium.ttf', familyName: FONT_FAMILY.latin, weight: 500 },
    { file: 'NotoSans-MediumItalic.ttf', familyName: FONT_FAMILY.latin, weight: 500, italic: true },
    { file: 'NotoSans-SemiBold.ttf', familyName: FONT_FAMILY.latin, weight: 600 },
    {
      file: 'NotoSans-SemiBoldItalic.ttf',
      familyName: FONT_FAMILY.latin,
      weight: 600,
      italic: true,
    },
    { file: 'NotoSans-Bold.ttf', familyName: FONT_FAMILY.latin, weight: 700 },
    { file: 'NotoSans-BoldItalic.ttf', familyName: FONT_FAMILY.latin, weight: 700, italic: true },
    { file: 'NotoSans-ExtraBold.ttf', familyName: FONT_FAMILY.latin, weight: 800 },
    {
      file: 'NotoSans-ExtraBoldItalic.ttf',
      familyName: FONT_FAMILY.latin,
      weight: 800,
      italic: true,
    },
    { file: 'NotoSans-Black.ttf', familyName: FONT_FAMILY.latin, weight: 900 },
    { file: 'NotoSans-BlackItalic.ttf', familyName: FONT_FAMILY.latin, weight: 900, italic: true },
  ],
};

interface FontFile {
  readonly file: string;
  readonly familyName?: string;
  readonly weight?: number;
  readonly italic?: boolean;
}

/** Base URLs per charset, as the console apps derive them from one host. */
export type CharsetFontUrls = Partial<Readonly<Record<FontCharset, string>>>;

/**
 * Fallback-font specs for self-hosted charset folders: pass the map the page
 * builds from its viewer base URL (`{ sc: '…/fonts/sc', … }`), and every known
 * file of every charset you gave a URL for becomes an engine spec pointing
 * under it. Files beyond the manifest ride on `extra`.
 */
export function buildFontFallbackConfig(
  urls: CharsetFontUrls,
  extra: readonly FallbackFontSpec[] = [],
): FallbackFontSpec[] {
  const specs: FallbackFontSpec[] = [];
  for (const charset of FONT_CHARSETS) {
    const base = urls[charset];
    if (!base) continue;
    for (const font of FONT_FILES[charset]) {
      specs.push({
        key: `selfhost-${charset}-${font.file}`,
        ...(font.familyName ? { familyName: font.familyName } : {}),
        ...(font.weight !== undefined ? { weight: font.weight } : {}),
        ...(font.italic !== undefined ? { italic: font.italic } : {}),
        url: `${base.replace(/\/$/, '')}/${font.file}`,
      });
    }
  }
  return [...specs, ...extra];
}

/** One base URL for all of them, per the deployed folder layout. */
export function charsetUrlsFromBase(baseUrl: string): CharsetFontUrls {
  const base = baseUrl.replace(/\/$/, '');
  return Object.fromEntries(FONT_CHARSETS.map((charset) => [charset, `${base}/fonts/${charset}`]));
}
