import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages: set base to your repo name, e.g. '/adv-guardian-ai/'
// For user/org pages (username.github.io), use base: '/'
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, '.', '')
  const repoBase = env.VITE_BASE_PATH || '/adv-guardian-ai/'

  return {
    plugins: [react(), tailwindcss()],
    base: command === 'build' ? repoBase : '/',
  }
})
