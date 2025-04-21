<script lang="ts" setup>
import {
  autoBackup,
  deleteBackup,
  exportBackupData,
  getBackupsList,
  importBackupFile,
  restoreFromBackup,
} from '@/utils/backup'
import { Download, PlusIcon, RotateCcw, Trash2, Upload } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from './ui/button'

const backups = ref<Array<{ id: string, time: string, note: string }>>([])
const isLoading = ref(false)

// 加载备份列表
async function loadBackups() {
  try {
    isLoading.value = true
    const list = await getBackupsList()
    // 按时间戳排序，最新的在前面
    backups.value = list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    // 只保留最新的5个备份
    if (backups.value.length > 5) {
      const oldBackups = backups.value.slice(5)
      for (const backup of oldBackups) {
        await deleteBackup(backup.id)
      }
      backups.value = backups.value.slice(0, 5)
    }
  }
  catch (error) {
    toast.error(`加载备份列表失败`)
    console.error(`加载备份列表失败:`, error)
  }
  finally {
    isLoading.value = false
  }
}

// 格式化时间
function formatTime(time: string) {
  return new Date(time).toLocaleString(`zh-CN`, {
    year: `numeric`,
    month: `2-digit`,
    day: `2-digit`,
    hour: `2-digit`,
    minute: `2-digit`,
    second: `2-digit`,
    hour12: false,
  })
}

// 创建新备份
async function handleCreateBackup() {
  try {
    isLoading.value = true
    await autoBackup(`手动备份`)
    await loadBackups()
    toast.success(`备份创建成功`)
  }
  catch (error) {
    toast.error(`创建备份失败`)
    console.error(`创建备份失败:`, error)
  }
  finally {
    isLoading.value = false
  }
}

// 导出备份
function handleExportBackup() {
  try {
    exportBackupData()
    toast.success(`备份导出成功`)
  }
  catch (error) {
    toast.error(`导出备份失败`)
    console.error(`导出备份失败:`, error)
  }
}

// 导入备份
async function handleImportBackup() {
  try {
    isLoading.value = true
    const result = await importBackupFile()
    if (result) {
      toast.success(`备份导入成功`)
      await loadBackups()
    }
    else {
      toast.error(`导入备份失败`)
    }
  }
  catch (error) {
    toast.error(`导入备份失败`)
    console.error(`导入备份失败:`, error)
  }
  finally {
    isLoading.value = false
  }
}

// 恢复备份
async function handleRestoreBackup(backupId: string) {
  try {
    isLoading.value = true
    await restoreFromBackup(backupId)
    toast.success(`备份恢复成功`)
  }
  catch (error) {
    toast.error(`恢复备份失败`)
    console.error(`恢复备份失败:`, error)
  }
  finally {
    isLoading.value = false
  }
}

// 删除备份
async function handleDeleteBackup(backupId: string) {
  try {
    isLoading.value = true
    await deleteBackup(backupId)
    await loadBackups()
    toast.success(`备份删除成功`)
  }
  catch (error) {
    toast.error(`删除备份失败`)
    console.error(`删除备份失败:`, error)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadBackups()
})
</script>

<template>
  <div class="backup-manager">
    <div class="backup-header">
      <h3>备份管理</h3>
      <div class="backup-actions-header">
        <Button :disabled="isLoading" @click="handleCreateBackup">
          <PlusIcon class="icon" />
          创建备份
        </Button>
        <Button variant="outline" :disabled="isLoading" @click="handleExportBackup">
          <Download class="icon" />
          导出备份
        </Button>
        <Button variant="outline" :disabled="isLoading" @click="handleImportBackup">
          <Upload class="icon" />
          导入备份
        </Button>
      </div>
    </div>

    <div class="backup-list">
      <div v-if="backups.length === 0" class="empty-state">
        暂无备份记录
      </div>
      <div v-else class="backup-cards">
        <div v-for="backup in backups" :key="backup.id" class="backup-card">
          <div class="backup-info">
            <div class="backup-time">
              {{ formatTime(backup.time) }}
            </div>
            <div class="backup-note">
              {{ backup.note }}
            </div>
          </div>
          <div class="backup-actions">
            <Button variant="outline" :disabled="isLoading" @click="handleRestoreBackup(backup.id)">
              <RotateCcw class="icon" />
              恢复
            </Button>
            <Button variant="destructive" :disabled="isLoading" @click="handleDeleteBackup(backup.id)">
              <Trash2 class="icon" />
              删除
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backup-manager {
  padding: 1rem;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.backup-actions-header {
  display: flex;
  gap: 0.5rem;
}

.backup-list {
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.backup-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.backup-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.backup-info {
  flex: 1;
}

.backup-time {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.backup-note {
  color: #666;
  font-size: 0.875rem;
}

.backup-actions {
  display: flex;
  gap: 0.5rem;
}

.icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}
</style>
