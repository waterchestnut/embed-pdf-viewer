import { h } from 'preact';
import { ExtIconAction } from '@/components/renderers';
export interface CaptureData {
    pageIndex: number;
    rect: any;
    blob: Blob;
}
export interface CaptureDataProps {
    captureExtActions?: ExtIconAction[];
}
export declare function Capture(props: CaptureDataProps): h.JSX.Element;
//# sourceMappingURL=capture.d.ts.map