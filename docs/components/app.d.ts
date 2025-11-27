import { h } from 'preact';
import { PluginRegistry } from '@embedpdf/core';
import { PdfTask, Rotation } from '@embedpdf/models';
import { ViewportPluginConfig } from '@embedpdf/plugin-viewport/preact';
import { ScrollPluginConfig, ScrollStrategy } from '@embedpdf/plugin-scroll/preact';
import { SpreadMode, SpreadPluginConfig } from '@embedpdf/plugin-spread/preact';
import { LoaderPluginConfig } from '@embedpdf/plugin-loader/preact';
import { MenuItem, GlobalStoreState, UIComponentType, UIPluginConfig } from '@embedpdf/plugin-ui/preact';
import { ExtIconAction } from './renderers';
import { ZoomMode, ZoomPluginConfig } from '@embedpdf/plugin-zoom/preact';
import { RotatePluginConfig } from '@embedpdf/plugin-rotate/preact';
import { FormattedSelection } from '@embedpdf/plugin-selection/preact';
import { TilingPluginConfig } from '@embedpdf/plugin-tiling/preact';
import { ThumbnailPluginConfig } from '@embedpdf/plugin-thumbnail/preact';
import { AnnotationPluginConfig } from '@embedpdf/plugin-annotation/preact';
export { ScrollStrategy, ZoomMode, SpreadMode, Rotation };
export interface PluginConfigs {
    viewport?: ViewportPluginConfig;
    scroll?: ScrollPluginConfig;
    zoom?: ZoomPluginConfig;
    spread?: SpreadPluginConfig;
    rotate?: RotatePluginConfig;
    tiling?: TilingPluginConfig;
    thumbnail?: ThumbnailPluginConfig;
    annotation?: AnnotationPluginConfig;
    loader?: LoaderPluginConfig;
}
export interface TextSelectionMenuExtAction {
    id?: string;
    img?: string;
    imgNode?: any;
    onClick?: (selectedText: PdfTask<string[]>, formattedSelection: FormattedSelection[]) => void;
    label?: string;
}
export interface PDFViewerConfig {
    id?: string;
    name?: string;
    src: string;
    worker?: boolean;
    wasmUrl?: string;
    plugins?: PluginConfigs;
    log?: boolean;
    textSelectionMenuExtActions?: TextSelectionMenuExtAction[];
    styles?: string;
    locale?: string;
    onInitialized?: (registry: PluginRegistry) => void;
    headerEndExtActions?: ExtIconAction[];
    headerEndExtNode?: any;
    captureExtActions?: ExtIconAction[];
    headerStartExtActions?: ExtIconAction[];
    headerStartExtNode?: any;
}
interface PDFViewerProps {
    config: PDFViewerConfig;
}
type State = GlobalStoreState<{}>;
export declare const menuItems: Record<string, MenuItem<State>>;
export declare const components: Record<string, UIComponentType<State>>;
export declare const uiConfig: UIPluginConfig;
export declare function PDFViewer({ config }: PDFViewerProps): h.JSX.Element;
//# sourceMappingURL=app.d.ts.map