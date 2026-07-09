import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Use the current working directory instead of fileURLToPath to be compatible
// with different dev runtimes (tsx/register, nodemon, etc.).
const projectRoot = process.cwd();

export default defineConfig(() => ({
  // Disable React fast refresh to avoid duplicate Refresh runtime injection
  // in certain dev loader setups. HMR overlay is disabled above to prevent
  // blocking runtime transform errors from stopping the UI.
  plugins: [react({ fastRefresh: false }), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, '.'),
    },
  },
  server: {
    hmr: {
      overlay: false,
      clientPort: undefined,
    },
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: {
    // Enable code splitting for better caching and parallel loading
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'motion/react'
          ],
          'ui-components': [
            'lucide-react'
          ],
          'three-vendor': [
            'three'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Use terser for minification (default)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Source maps for production debugging
    sourcemap: process.env.DEBUG === 'true',
    // Optimize CSS
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Inline small assets
    assetsInlineLimit: 4096,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'motion/react',
      'lucide-react',
      'three',
      'recharts'
    ],
    exclude: ['fs', 'path', 'crypto']
  }
}));
