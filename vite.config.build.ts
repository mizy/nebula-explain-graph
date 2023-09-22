import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/Explain.tsx'),
      name: 'explain',
      // the proper extensions will be added
      fileName: 'index',
      formats: ["umd", "es"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react','react-dom','antd','@vesoft-inc/veditor','copy-to-clipboard'],
      output: {
        // intro: 'import "./Explain.css";',
      },
    },
    cssCodeSplit: true,
    cssMinify: true,
  },
  plugins: [react()]
})
