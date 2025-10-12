<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <div class="login-title">
          <h1>教务管理系统</h1>
          <p>Campus Management System</p>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="form-title">欢迎登录</h2>
          
          <el-tabs v-model="loginType" class="login-tabs">
            <el-tab-pane label="简单登录" name="simple"></el-tab-pane>
            <el-tab-pane label="统一认证" name="sdu"></el-tab-pane>
          </el-tabs>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="stuId">
              <el-input
                v-model="loginForm.stuId"
                placeholder="请输入学号/工号"
                size="large"
                clearable
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                clearable
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-button"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import type { LoginRequest } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const loginType = ref('simple')
const loading = ref(false)
const loginFormRef = ref<FormInstance>()

const loginForm = reactive<LoginRequest>({
  stuId: '',
  password: ''
})

const loginRules: FormRules = {
  stuId: [
    { required: true, message: '请输入学号/工号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const isSDULogin = loginType.value === 'sdu'
        await userStore.login(loginForm, isSDULogin)
        
        // 登录成功后获取基础数据
        await Promise.all([
          appStore.fetchSemesters(),
          appStore.fetchCurrentTerm(),
          userStore.identity != 2 ? appStore.fetchClassrooms() : Promise.resolve()
        ])
        
        ElMessage.success('登录成功')
        console.log('用户身份:', userStore.identity)
        // 根据用户身份跳转到对应页面
        switch (userStore.identity) {
          case 0:
            router.push('/admin')
            console.log('管理员登录成功')
            break
          case 1:
            router.push('/teacher')
            console.log('教师登录成功')
            break
          case 2:
            router.push('/student')
            console.log('学生登录成功')
            break
          default:
            router.push('/')
            console.log('未知身份，跳转到首页')
        }
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  display: flex;
  width: 900px;
  height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 40px;
}

.login-title {
  text-align: center;
  
  h1 {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 18px;
    opacity: 0.9;
  }
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 32px;
  text-align: center;
}

.login-tabs {
  margin-bottom: 24px;
  
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }
}

.login-button {
  width: 100%;
  margin-top: 8px;
}
</style>

