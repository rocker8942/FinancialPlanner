import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
// import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    // Bundle analyzer - generates stats.html after build (disabled)
    // visualizer({
    //   filename: 'dist/stats.html',
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    // })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:60471',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Manual code splitting for better caching
        manualChunks(id) {
          // Vendor libraries
          if (id.includes('node_modules')) {
            // ECharts in its own chunk
            if (id.includes('echarts')) {
              return 'echarts';
            }
            // Vue ecosystem
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) {
              return 'vue-vendor';
            }
            // HTTP client
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            // Other vendor libraries
            return 'vendor';
          }
          // Financial calculation utilities
          if (id.includes('/src/utils/')) {
            return 'utils';
          }
          // Components (but not views - they're already code-split by routes)
          if (id.includes('/src/components/') && !id.includes('/src/views/')) {
            return 'components';
          }
        },
      },
    },
    // Enable source maps for better debugging
    sourcemap: true,
    // Increase chunk size warning limit (we're optimizing chunks now)
    chunkSizeWarningLimit: 1000,
  },
  base: './' // Use relative paths for assets
})
