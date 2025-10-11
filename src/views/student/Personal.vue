<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ userStore.userInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ userStore.userInfo.sduid }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ userStore.userInfo.sex }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ userStore.userInfo.major }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ userStore.userInfo.college }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ userStore.userInfo.section }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ userStore.userInfo.email }}</el-descriptions-item>
        <el-descriptions-item label="手机">{{ userStore.userInfo.phone }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const handleEdit = () => {
  ElMessage.info('编辑功能待实现')
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

