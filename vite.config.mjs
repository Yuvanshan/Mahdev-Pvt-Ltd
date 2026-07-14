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
    // Enable compression and caching in dev
    middlewareMode: false,
  },
  build: {
    // Enable code splitting for better caching and parallel loading
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'motion/react'],
          'ui-components': ['lucide-react'],
          'three-vendor': ['three'],
          'utilities': ['@vercel/speed-insights']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Use terser for minification with optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        keep_infinity: false,
        pure_funcs: ['console.log', 'console.warn']
      },
      format: {
        comments: false,
        beautify: false
      },
      mangle: true
    },
    // Source maps only in debug mode
    sourcemap: process.env.DEBUG === 'true',
    // Optimize CSS and enable splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Inline small assets (smaller threshold for optimization)
    assetsInlineLimit: 2048,
    // Enable brotli compression hints
    brotliSize: true,
    // Optimize build output
    emptyOutDir: true,
    outDir: 'dist',
  },
  // Optimize dependencies for faster dev startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'motion/react',
      'lucide-react',
      'three',
      'recharts',
      '@vercel/speed-insights'
    ],
    exclude: ['fs', 'path', 'crypto'],
    // Esbuild options
    esbuildOptions: {
      target: 'esnext',
      // Enable tree-shaking
      pure: ['console.log'],
    }
  }
}));
