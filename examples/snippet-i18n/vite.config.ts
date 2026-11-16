import { defineConfig } from 'vite';

// Relative base: the built folder is a deployable static site, the unit the
// pdfviewer host serves (wasm, fonts, demo PDF beside the app bundle).
export default defineConfig({ base: './' });
