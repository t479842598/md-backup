import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { Toaster } from 'vue-sonner'
import App from './App.vue'
import { autoBackup } from './utils/backup'

import 'virtual:uno.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/xq-light.css'
import 'codemirror/theme/darcula.css'
// import 'vue-sonner/dist/style.css'

/* 每个页面公共css */
import '@/assets/index.css'
import '@/assets/less/theme.less'
import '@/assets/toast.css'

import 'codemirror/mode/css/css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/css-hint'

const app = createApp(App)
app.config.performance = false

app.use(createPinia())
app.component(`Toaster`, Toaster)

app.mount(`#app`)

// 初始化备份，确保首次打开应用时创建备份
setTimeout(() => {
  autoBackup()
}, 2000)
