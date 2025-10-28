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
            <el-menu-item index="/student/home">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            
            <el-menu-item index="/student/personal">
              <el-icon><UserFilled /></el-icon>
              <span>个人中心</span>
            </el-menu-item>

            <el-menu-item index="/student/schedule">
              <el-icon><Calendar /></el-icon>
              <span>课表查询</span>
            </el-menu-item>

            <el-menu-item index="/student/course-selection">
              <el-icon><Notebook /></el-icon>
              <span>选课系统</span>
            </el-menu-item>

            <el-menu-item index="/student/grades">
              <el-icon><DocumentCopy /></el-icon>
              <span>成绩查询</span>
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
import {
  HomeFilled,
  UserFilled,
  Calendar,
  Notebook,
  DocumentCopy
} from '@element-plus/icons-vue'
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
  }).then(async () => {
    try {
      await userStore.logout()
      // 使用 replace 而不是 push，避免用户通过后退按钮回到登录前的页面
      await router.replace('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      // 即使API调用失败，也要清除本地状态并跳转
      await router.replace('/login')
    }
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

  .el-menu-item {
    .el-icon {
      color: #606266;
      font-size: 18px;
    }

    &.is-active {
      .el-icon {
        color: #409eff;
      }
    }

    &:hover {
      .el-icon {
        color: #409eff;
      }
    }
  }
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

