import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Évite l'erreur 'undefined/api/...' en production si la variable n'est pas définie
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '')
    }
  }
})