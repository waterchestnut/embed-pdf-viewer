/** @jsxImportSource preact */
import { h, ComponentChildren } from 'preact';
export interface DialogProps {
    /** Controlled visibility — `true` shows, `false` hides */
    open: boolean;
    /** Dialog title */
    title?: string;
    /** Dialog content */
    children: ComponentChildren;
    /** Callback when dialog should close */
    onClose?: () => void;
    /** Callback when exit animation completes (for cleanup) */
    onExited?: () => void;
    /** Optional className for the dialog content */
    className?: string;
    /** Whether to show close button */
    showCloseButton?: boolean;
    /** Maximum width of the dialog */
    maxWidth?: string;
    /** width of the dialog */
    width?: string;
}
export declare function Dialog({ open, title, children, onClose, onExited, className, showCloseButton, maxWidth, width, }: DialogProps): h.JSX.Element | null;
//# sourceMappingURL=dialog.d.ts.map