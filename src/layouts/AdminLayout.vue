<template>
  <div class="layout-container">
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <h1 class="app-title">教务管理系统</h1>
        </div>
        <div class="header-right">
          <span class="username">{{ userStore.username }}</span>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      
      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="200px" class="layout-aside">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            router
          >
            <el-menu-item index="/admin/home">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/personal">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/student-management">
              <el-icon><UserFilled /></el-icon>
              <span>学生管理</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/teacher-management">
              <el-icon><Avatar /></el-icon>
              <span>教师管理</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/course-management">
              <el-icon><Reading /></el-icon>
              <span>课程管理</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/class-management">
              <el-icon><School /></el-icon>
              <span>班级管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <!-- 主内容区 -->
        <el-main class="layout-main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { HomeFilled, User, UserFilled, Avatar, Reading, School } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  })
}
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;
}

.el-container {
  height: 100%;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-left {
  .app-title {
    font-size: 20px;
    font-weight: bold;
    color: #303133;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .username {
    color: #606266;
    font-size: 14px;
  }
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.layout-main {
  background: #f5f7fa;
  padding: 0;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

