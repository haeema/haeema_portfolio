import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honour an assigned port (e.g. from the preview launcher); Vite ignores PORT on its own.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
})
