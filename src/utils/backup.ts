import { format } from 'date-fns'
import { addPrefix } from './index'

// 定义备份数据的接口
interface BackupData {
  posts: Array<{
    title: string
    content: string
    history: Array<{
      datetime: string
      content: string
    }>
  }>
  cssContentConfig: {
    active: string
    tabs: Array<{
      title: string
      name: string
      content: string
    }>
  }
  settings: {
    theme: string
    fontFamily: string
    fontSize: string
    primaryColor: string
    codeBlockTheme: string
    legend: string
    isMacCodeBlock: boolean
    isCiteStatus: boolean
    isCountStatus: boolean
    isUseIndent: boolean
    isEditOnLeft: boolean
  }
  backupTime: string
  backupVersion: string
}

// 自动备份的时间间隔（毫秒）
const AUTO_BACKUP_INTERVAL = 30 * 60 * 1000 // 30分钟

// IndexedDB 数据库名称和版本
const DB_NAME = `md_editor_backup`
const DB_VERSION = 1

// 打开数据库
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // 创建备份数据存储
      if (!db.objectStoreNames.contains(`backups`)) {
        const store = db.createObjectStore(`backups`, { keyPath: `id` })
        store.createIndex(`time`, `time`, { unique: false })
      }

      // 创建备份列表存储
      if (!db.objectStoreNames.contains(`backups_list`)) {
        db.createObjectStore(`backups_list`, { keyPath: `id` })
      }
    }
  })
}

// 获取备份数据
export async function getBackupData(): Promise<BackupData> {
  const posts = JSON.parse(localStorage.getItem(addPrefix(`posts`)) || `[]`)
  const cssContentConfig = JSON.parse(localStorage.getItem(addPrefix(`css_content_config`)) || `{}`)

  const theme = localStorage.getItem(`theme`) || ``
  const fontFamily = localStorage.getItem(`fonts`) || ``
  const fontSize = localStorage.getItem(`size`) || ``
  const primaryColor = localStorage.getItem(`color`) || ``
  const codeBlockTheme = localStorage.getItem(`codeBlockTheme`) || ``
  const legend = localStorage.getItem(`legend`) || ``
  const isMacCodeBlock = localStorage.getItem(`isMacCodeBlock`) === `true`
  const isCiteStatus = localStorage.getItem(`isCiteStatus`) === `true`
  const isCountStatus = localStorage.getItem(`isCountStatus`) === `true`
  const isUseIndent = localStorage.getItem(addPrefix(`use_indent`)) === `true`
  const isEditOnLeft = localStorage.getItem(`isEditOnLeft`) === `true`

  return {
    posts,
    cssContentConfig,
    settings: {
      theme,
      fontFamily,
      fontSize,
      primaryColor,
      codeBlockTheme,
      legend,
      isMacCodeBlock,
      isCiteStatus,
      isCountStatus,
      isUseIndent,
      isEditOnLeft,
    },
    backupTime: new Date().toISOString(),
    backupVersion: `1.0.0`,
  }
}

// 导入备份数据
export async function importBackupData(data: BackupData): Promise<boolean> {
  try {
    if (!data || !data.posts || !data.cssContentConfig || !data.settings) {
      throw new Error(`备份数据格式不正确`)
    }

    // 恢复 posts 数据
    localStorage.setItem(addPrefix(`posts`), JSON.stringify(data.posts))

    // 恢复 cssContentConfig 数据
    localStorage.setItem(addPrefix(`css_content_config`), JSON.stringify(data.cssContentConfig))

    // 恢复设置
    const { settings } = data
    localStorage.setItem(`theme`, settings.theme)
    localStorage.setItem(`fonts`, settings.fontFamily)
    localStorage.setItem(`size`, settings.fontSize)
    localStorage.setItem(`color`, settings.primaryColor)
    localStorage.setItem(`codeBlockTheme`, settings.codeBlockTheme)
    localStorage.setItem(`legend`, settings.legend)
    localStorage.setItem(`isMacCodeBlock`, String(settings.isMacCodeBlock))
    localStorage.setItem(`isCiteStatus`, String(settings.isCiteStatus))
    localStorage.setItem(`isCountStatus`, String(settings.isCountStatus))
    localStorage.setItem(addPrefix(`use_indent`), String(settings.isUseIndent))
    localStorage.setItem(`isEditOnLeft`, String(settings.isEditOnLeft))

    return true
  }
  catch (error) {
    console.error(`导入备份数据失败:`, error)
    return false
  }
}

// 导出备份数据为文件
export function exportBackupData(): void {
  getBackupData().then((backupData) => {
    const backupStr = JSON.stringify(backupData, null, 2)
    const timestamp = format(new Date(), `yyyy-MM-dd-HHmmss`)
    const filename = `md-backup-${timestamp}.json`

    const downLink = document.createElement(`a`)
    downLink.download = filename
    downLink.style.display = `none`
    const blob = new Blob([backupStr], { type: `application/json` })

    downLink.href = URL.createObjectURL(blob)
    document.body.appendChild(downLink)
    downLink.click()
    document.body.removeChild(downLink)
  })
}

// 导入备份文件
export function importBackupFile(): Promise<boolean> {
  return new Promise((resolve) => {
    const input = document.createElement(`input`)
    input.type = `file`
    input.accept = `.json`
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) {
        resolve(false)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const backupData = JSON.parse(content) as BackupData
          importBackupData(backupData).then(resolve)
        }
        catch (error) {
          console.error(`解析备份文件失败:`, error)
          resolve(false)
        }
      }
      reader.onerror = () => resolve(false)
      reader.readAsText(file)
    }

    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
}

// 自动备份到 IndexedDB
export async function autoBackup(note: string = `自动备份`): Promise<void> {
  try {
    const db = await openDB()
    const backupData = await getBackupData()
    const backupId = `backup_${Date.now()}`

    // 开始事务
    const transaction = db.transaction([`backups`, `backups_list`], `readwrite`)
    const backupsStore = transaction.objectStore(`backups`)
    const backupsListStore = transaction.objectStore(`backups_list`)

    // 添加备份数据
    await new Promise<void>((resolve, reject) => {
      const request = backupsStore.add({
        id: backupId,
        data: backupData,
        time: backupData.backupTime,
      })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    // 添加备份记录
    await new Promise<void>((resolve, reject) => {
      const request = backupsListStore.add({
        id: backupId,
        time: backupData.backupTime,
        note,
      })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    // 清理旧备份
    const backupsList = await getBackupsList()
    if (backupsList.length > 10) {
      const oldestBackup = backupsList[0]
      await deleteBackup(oldestBackup.id)
    }
  }
  catch (error) {
    console.error(`自动备份失败:`, error)
  }
}

// 获取备份列表
export async function getBackupsList(): Promise<Array<{ id: string, time: string, note: string }>> {
  try {
    const db = await openDB()
    const transaction = db.transaction(`backups_list`, `readonly`)
    const store = transaction.objectStore(`backups_list`)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const backups = request.result
        backups.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        resolve(backups)
      }
      request.onerror = () => reject(request.error)
    })
  }
  catch (error) {
    console.error(`获取备份列表失败:`, error)
    return []
  }
}

// 从备份中恢复
export async function restoreFromBackup(backupId: string): Promise<boolean> {
  try {
    const db = await openDB()
    const transaction = db.transaction(`backups`, `readonly`)
    const store = transaction.objectStore(`backups`)

    return new Promise((resolve) => {
      const request = store.get(backupId)
      request.onsuccess = () => {
        const backup = request.result
        if (backup) {
          importBackupData(backup.data).then(resolve)
        }
        else {
          resolve(false)
        }
      }
      request.onerror = () => resolve(false)
    })
  }
  catch (error) {
    console.error(`恢复备份失败:`, error)
    return false
  }
}

// 删除备份
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    const db = await openDB()
    const transaction = db.transaction([`backups`, `backups_list`], `readwrite`)
    const backupsStore = transaction.objectStore(`backups`)
    const backupsListStore = transaction.objectStore(`backups_list`)

    await new Promise<void>((resolve, reject) => {
      const request = backupsStore.delete(backupId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    await new Promise<void>((resolve, reject) => {
      const request = backupsListStore.delete(backupId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    return true
  }
  catch (error) {
    console.error(`删除备份失败:`, error)
    return false
  }
}

// 保存时自动备份
export async function backupOnSave(): Promise<void> {
  await autoBackup(`保存时自动备份`)
}
