import { defineConfig } from 'vite'
import * as path from 'path'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  base: import.meta.env.VITE_ENV === 'production' ? '/kucni-prevoz/' : '/',
  plugins: [
    vue(),
    vueDevTools()
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') }
    ]
  }
})
