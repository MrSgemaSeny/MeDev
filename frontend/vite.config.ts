/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isGitHubPages = mode === 'github' || process.env.GITHUB_PAGES === 'true'
  return {
    plugins: [react(), tailwindcss()],
    base: isGitHubPages ? '/MeDev/' : '/',
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})