<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  if (userStore.isLoggedIn) {
    switch (userStore.identity) {
      case 0:
        router.push('/admin')
        break
      case 1:
        router.push('/teacher')
        break
      case 2:
        router.push('/student')
        break
      default:
        router.push('/login')
    }
  } else {
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.content {
  text-align: center;
  
  h1 {
    font-size: 120px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 24px;
    color: #606266;
    margin-bottom: 40px;
  }
}
</style>

