import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 2000, // Increase warning threshold to 2.0MB to allow large mermaid package
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split large third-party node_modules packages to avoid big files
          if (id.includes('node_modules')) {
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            if (id.includes('katex') || id.includes('rehype') || id.includes('remark')) {
              return 'vendor-math';
            }
            return 'vendor'; // all other dependencies
          }
        }
      }
    }
  }
})
