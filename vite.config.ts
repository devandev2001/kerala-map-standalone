import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2020',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  esbuild: {
    // Ensure proper loader configuration
    loader: 'tsx',
    include: /\.(tsx?|jsx?)$/,
    exclude: /node_modules/
  }
}));