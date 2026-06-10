import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change 'fh6-tracker' to your actual GitHub repo name if different
export default defineConfig({
  plugins: [react()],
  base: '/fh6-tracker/',
})
