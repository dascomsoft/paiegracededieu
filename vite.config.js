import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 5173,
  },
  base: './',  // ← DÉJÀ LÀ
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'html') {
        return `./${filename}`  // ← FORCE LES CHEMINS RELATIFS
      }
      return filename;
    }
  }
})
