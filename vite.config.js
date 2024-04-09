import { defineConfig } from 'vite'
import * as path from 'path'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    (()=>({
        name:'prod-vue-resolver-cropper',
        resolveId(id){
          // dev mode vite resolves vue in other way
          // only in prod mode, `id === vue` is true
          if(id === 'vue') {
            return resolve(__dirname,'./node_modules/vue-advanced-cropper/dist/index.esm-bundler.js')
          }
        }
      }))()
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') }
    ]
  }
})
