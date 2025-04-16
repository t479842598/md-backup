<script setup lang="ts">
import { useStore } from '@/stores'
import { BellRing } from 'lucide-vue-next'

const store = useStore()
const { isDark } = storeToRefs(store)

const notificationText = `微信markdown编辑器项目，更新内容为增加数据备份和自动备份，需要定制联系公众号：战渊IT助手`
</script>

<template>
  <div class="notification-container">
    <div class="notification-card" :class="{ 'dark-mode': isDark }">
      <div class="notification-icon-wrapper">
        <BellRing class="notification-icon" />
      </div>
      <div class="notification-content">
        <div class="scroll-text">
          {{ notificationText }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.notification-card {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 0;
  overflow: hidden;
  position: relative;
  height: 32px;
  width: 100%;
}

.notification-card.dark-mode {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.notification-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #f6f6f6;
  border-right: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.dark-mode .notification-icon-wrapper {
  background-color: #2d3748;
  border-right-color: #374151;
}

.notification-icon {
  width: 16px;
  height: 16px;
  color: #ff4d4f;
}

.notification-content {
  flex: 1;
  overflow: hidden;
  padding: 0 8px;
}

.scroll-text {
  white-space: nowrap;
  animation: scroll 20s linear infinite;
  font-size: 13px;
  color: #333;
}

.dark-mode .scroll-text {
  color: #e5e7eb;
}

@keyframes scroll {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
