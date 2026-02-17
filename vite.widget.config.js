import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to prevent CSS extraction — the widget injects styles via shadow DOM
function cssInlineOnly() {
  return {
    name: 'css-inline-only',
    generateBundle(_, bundle) {
      for (const key of Object.keys(bundle)) {
        if (key.endsWith('.css')) {
          delete bundle[key];
        }
      }
    },
    async closeBundle() {
      const { unlink } = await import('fs/promises');
      const { join } = await import('path');
      try {
        await unlink(join('dist-widget', 'tmj-website.css'));
      } catch {}
    },
  };
}

export default defineConfig({
  plugins: [react(), cssInlineOnly()],
  build: {
    outDir: 'dist-widget',
    cssCodeSplit: false,
    lib: {
      entry: 'src/widget.jsx',
      name: 'TMJChatWidget',
      formats: ['iife'],
      fileName: () => 'tmj-chat-widget.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
