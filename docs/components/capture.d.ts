import { h } from 'preact';
export interface CaptureData {
    pageIndex: number;
    rect: any;
    blob: Blob;
}
export interface CaptureExtAction {
    id?: string;
    onClick?: (captureData?: CaptureData | null) => void;
    label?: string;
}
export interface CaptureProps {
    documentId: string;
    captureExtActions?: CaptureExtAction[];
}
export declare function Capture({ documentId, captureExtActions }: CaptureProps): h.JSX.Element;
//# sourceMappingURL=capture.d.ts.map