<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

function onUpdate(val: boolean) {
  if (!val) {
    emit(`close`)
  }
}

const links = [
  // { label: `GitHub 仓库`, url: `https://gitee.com/tangzhanyuan/md-backup/tree/main/` },
  { label: `Gitee 仓库`, url: `https://gitee.com/tangzhanyuan/md-back` },
  // { label: `GitCode 仓库`, url: `https://gitcode.com/doocs/md` },
]

function onRedirect(url: string) {
  window.open(url, `_blank`)
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>关于</DialogTitle>
      </DialogHeader>
      <div class="text-center">
        <h3>一款高度简洁的微信 Markdown 编辑器</h3>
        <p>扫码关注公众号 战渊IT助手，原创技术内容第一时间推送！</p>
        <img
          class="mx-auto my-5"
          src="https://gitee.com/tangzhanyuan/gallery-zy/blob/main/%E6%88%98%E6%B8%8AIT%E5%8A%A9%E6%89%8B.jpg"
          alt="Doocs Markdown 编辑器" style="width: 40%"
        >
      </div>
      <DialogFooter class="sm:justify-evenly">
        <Button v-for="link in links" :key="link.url" @click="onRedirect(link.url)">
          {{ link.label }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
