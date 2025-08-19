import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // sab IPs par accessible banata hai
    port: 5173, // default port, chahe to change kar sakte ho
  },
})
