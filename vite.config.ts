import { Buffer } from 'node:buffer'
import { fileURLToPath, URL } from 'node:url'
import { gzipSync } from 'node:zlib'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

/** 构建时为文本类产物额外输出同名 .gz 文件（nginx gzip_static 可直接服务） */
function gzipOutput(): Plugin {
  return {
    name: 'taskflow:gzip',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        const isText = file.type === 'chunk' || /\.(js|css|html|svg|json)$/.test(file.fileName)
        if (!isText) continue
        const source = file.type === 'chunk' ? file.code : file.source
        this.emitFile({
          type: 'asset',
          fileName: `${file.fileName}.gz`,
          source: gzipSync(Buffer.from(source), { level: 6 }),
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      // vue / vue-router / pinia 的 API 全局自动导入：ref、computed、useRoute…
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'auto-imports.d.ts',
      // 生成 .eslintrc-auto-import.json（globals 清单），供 eslint.config.ts 读取
      eslintrc: { enabled: true },
    }),
    Components({
      // 模板里的 el-* 组件按需自动注册（含样式）
      resolvers: [ElementPlusResolver()],
      dts: 'components.d.ts',
    }),
    gzipOutput(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        // 分包策略：element-plus 体积最大且升级不频繁，单独成块利于浏览器长缓存；
        // 其余第三方统一进 vendor；业务代码保持按路由自动分包
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('element-plus') || id.includes('@element-plus')) return 'element-plus'
          return 'vendor'
        },
      },
    },
  },
})
