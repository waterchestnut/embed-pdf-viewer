import { h } from 'preact';
interface LinkModalProps {
    documentId: string;
    isOpen?: boolean;
    onClose?: () => void;
    onExited?: () => void;
}
export declare function LinkModal({ documentId, isOpen, onClose, onExited }: LinkModalProps): h.JSX.Element;
export {};
//# sourceMappingURL=link-modal.d.ts.map