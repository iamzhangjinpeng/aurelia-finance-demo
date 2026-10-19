import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  // Include lazy-route dependencies before the first browser navigation.
  optimizeDeps: { include: ['recharts', 'three'] },
  server: { host: '127.0.0.1' },
})
