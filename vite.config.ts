import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      spa: { enabled: true },
      server: { entry: './src/server-entry.ts' },
    }),
    react(),
    tailwindcss(),
  ],
})
