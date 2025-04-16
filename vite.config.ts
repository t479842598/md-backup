import path from 'node:path'
import process from 'node:process'

import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePluginRadar } from 'vite-plugin-radar'

// https://vitejs.dev/config/
export default defineConfig({
  base: `/`, // 修改为根路径，适用于大多数部署环境
  define: {
    process,
    // 在生产环境中禁用 Vue DevTools
    ...(process.env.NODE_ENV === `production`
      ? {
          __VUE_PROD_DEVTOOLS__: false,
        }
      : {}),
  },
  plugins: [
    vue(),
    UnoCSS(),
    nodePolyfills({
      include: [`path`, `util`, `timers`, `stream`, `fs`],
      overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        // fs: 'memfs',
      },
    }),
    VitePluginRadar({
      analytics: {
        id: `G-7NZL3PZ0NK`,
      },
    }),
    process.env.ANALYZE === `true` && visualizer({
      emitFile: true,
      filename: `stats.html`,
    }),
    AutoImport({
      imports: [
        `vue`,
        `pinia`,
        `@vueuse/core`,
      ],
      dirs: [
        `./src/stores`,
        `./src/utils/toast`,
      ],
    }),
    Components({
      resolvers: [],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, `./src`),
    },
  },
  css: {
    devSourcemap: true,
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: `static/js/[name].js`,
        entryFileNames: `static/js/[name].js`,
        assetFileNames: `static/[ext]/[name].[ext]`,
      },
    },
  },
})
