/**
 * The host-facing file event: the v2 `documentManager.onFileSelected`.
 *
 * 3.x keeps no such hook in the kernel — the document menu's Open row and
 * drop-to-open both run the chrome's `document:open` command, and a command
 * given under a built-in id changes that one field by field. Overriding only
 * its `run` keeps the label, icon, shortcut and visibility, asks for the file
 * the same way, tells the host what was chosen before opening it, and opens
 * it through the same kernel call.
 */
import { DocumentsToken, type CommandDefinition } from '@embedpdf/viewer/snippet';

const PDF_TYPE = 'application/pdf';

/** The files a drop hands the command as args, or null when it asked for none. */
function givenFilesOf(args: unknown): readonly File[] | null {
  const files = (args as { files?: readonly File[] } | undefined)?.files;
  return Array.isArray(files) ? files : null;
}

/** One file from the browser's picker: null when the dialog is dismissed. */
function pickPdfFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `.pdf,${PDF_TYPE}`;
    // Chrome needs the dialog opened inside the click that asked for it: this
    // runs synchronously in the command's run, which is enough.
    input.addEventListener('cancel', () => resolve(null), { once: true });
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true });
    input.click();
  });
}

/**
 * The `document:open` override: every chosen file is reported through
 * `onFileSelected` — before its bytes are read — and then opened in a new tab
 * exactly as the built-in command opens it.
 */
export function fileOpenEventCommand(onFileSelected: (file: File) => void): CommandDefinition {
  return {
    id: 'document:open',
    run: async (ctx) => {
      const documents = ctx.tryGet(DocumentsToken);
      if (!documents) return;
      // A drop gives its files as args; a click or the shortcut asks for one.
      const files = givenFilesOf(ctx.args) ?? (await pickPdfFile()) ?? [];
      const chosen = Array.isArray(files) ? files : [files];
      if (!chosen.length) return;
      // Said before the read: the host may rename, gate, or start its own upload.
      for (const file of chosen) onFileSelected(file);
      documents.openAll(
        chosen.map((file) => ({
          name: file.name.replace(/\.pdf$/i, '') || file.name,
          source: async () => ({
            kind: 'bytes',
            bytes: new Uint8Array(await file.arrayBuffer()),
          }),
        })),
      );
    },
  };
}
