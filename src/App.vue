<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 应用启动时检查本地存储的token
  userStore.checkAuth()
})
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>

