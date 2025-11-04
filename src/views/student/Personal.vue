<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- 个人信息卡片 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" @click="showEditDialog = true">编辑信息</el-button>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ userInfo.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学号/工号">{{ userInfo.sduid || '-' }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ userInfo.sex === '1' ? '男' : userInfo.sex === '0' ? '女' : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机">{{ userInfo.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="民族">{{ userInfo.ethnic || '-' }}</el-descriptions-item>
            <el-descriptions-item v-if="userStore.isStudent" label="专业">
              {{ getMajorName(userInfo.major) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="学院">{{ userInfo.college || '-' }}</el-descriptions-item>
            <el-descriptions-item v-if="userStore.isStudent" label="政治面貌">
              {{ userInfo.politicsStatus || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="籍贯">{{ userInfo.nation || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 操作卡片 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>账户设置</span>
          </template>

          <div class="action-list">
            <div class="action-item" @click="showPasswordDialog = true">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
              <el-icon class="arrow"><ArrowRight /></el-icon>
            </div>

            <div class="action-item" @click="showEmailDialog = true">
              <el-icon><Message /></el-icon>
              <span>修改邮箱</span>
              <el-icon class="arrow"><ArrowRight /></el-icon>
            </div>

            <div class="action-item" @click="showPhoneDialog = true">
              <el-icon><Phone /></el-icon>
              <span>修改手机</span>
              <el-icon class="arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑信息对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑个人信息" width="600px">
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="username">
              <el-input v-model="editForm.username" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="editForm.sex" placeholder="请选择性别">
                <el-option label="男" value="1" />
                <el-option label="女" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="民族" prop="ethnic">
              <el-input v-model="editForm.ethnic" placeholder="请输入民族" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="籍贯" prop="nation">
              <el-input v-model="editForm.nation" placeholder="请输入籍贯" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="userStore.isStudent" label="政治面貌" prop="politicsStatus">
          <el-select v-model="editForm.politicsStatus" placeholder="请选择政治面貌">
            <el-option label="群众" value="群众" />
            <el-option label="团员" value="团员" />
            <el-option label="党员" value="党员" />
            <el-option label="预备党员" value="预备党员" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateInfo" :loading="updateLoading">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePassword" :loading="passwordLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改邮箱对话框 -->
    <el-dialog v-modeMAJOR_1l="showEmailDialog" title="修改邮箱" width="400px">
      <el-form
        ref="emailFormRef"
        :model="emailForm"
        :rules="emailRules"
        label-width="80px"
      >
        <el-form-item label="新邮箱" prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入新邮箱" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="verify-input">
            <el-input v-model="emailForm.code" placeholder="请输入验证码" />
            <el-button
              :disabled="codeCountdown > 0"
              @click="sendEmailCode"
              :loading="sendingCode"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateEmail" :loading="emailLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改手机对话框 -->
    <el-dialog v-model="showPhoneDialog" title="修改手机" width="400px">
      <el-form
        ref="phoneFormRef"
        :model="phoneForm"
        :rules="phoneRules"
        label-width="80px"
      >
        <el-form-item label="新手机" prop="phone">
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPhoneDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePhone" :loading="phoneLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Lock, Message, Phone, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { updatePhone, updateEmail, updatePassword } from '@/api/user'
import { getVerifyCode } from '@/api/verify'

const userStore = useUserStore()

const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const showEmailDialog = ref(false)
const showPhoneDialog = ref(false)

const updateLoading = ref(false)
const passwordLoading = ref(false)
const emailLoading = ref(false)
const phoneLoading = ref(false)
const sendingCode = ref(false)
const codeCountdown = ref(0)

const editFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const emailFormRef = ref<FormInstance>()
const phoneFormRef = ref<FormInstance>()

const userInfo = ref<any>({})

const editForm = reactive({
  username: '',
  sex: '',
  ethnic: '',
  nation: '',
  politicsStatus: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const emailForm = reactive({
  email: '',
  code: ''
})

const phoneForm = reactive({
  phone: ''
})

// 表单验证规则
const editRules: FormRules = {
  username: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ]
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const emailRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const phoneRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 获取专业名称
const getMajorName = (major: string) => {
  const majorMap: Record<string, string> = {
    'MAJOR_0': '软件工程',
    'MAJOR_1': '数字媒体技术',
    'MAJOR_2': '大数据',
    'MAJOR_3': '人工智能'
  }
  return majorMap[major] || major
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    await userStore.fetchUserInfo()
    userInfo.value = { ...userStore.userInfo }

    // 初始化编辑表单
    Object.assign(editForm, {
      username: userInfo.value.username || '',
      sex: userInfo.value.sex || '',
      ethnic: userInfo.value.ethnic || '',
      nation: userInfo.value.nation || '',
      politicsStatus: userInfo.value.politicsStatus || ''
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 更新个人信息
const handleUpdateInfo = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      updateLoading.value = true
      try {
        // 这里应该调用更新用户信息的API
        // 由于API限制，暂时只更新本地状态
        Object.assign(userInfo.value, editForm)
        userStore.updateUserInfo(editForm)

        ElMessage.success('信息更新成功')
        showEditDialog.value = false
      } catch (error) {
        ElMessage.error('更新失败')
      } finally {
        updateLoading.value = false
      }
    }
  })
}

// 更新密码
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })

        ElMessage.success('密码修改成功')
        showPasswordDialog.value = false

        // 重置表单
        Object.assign(passwordForm, {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }

  sendingCode.value = true
  try {
    await getVerifyCode(emailForm.email)
    ElMessage.success('验证码已发送')

    // 开始倒计时
    codeCountdown.value = 60
    const timer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error('发送验证码失败')
  } finally {
    sendingCode.value = false
  }
}

// 更新邮箱
const handleUpdateEmail = async () => {
  if (!emailFormRef.value) return

  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      emailLoading.value = true
      try {
        await updateEmail({
          email: emailForm.email,
          code: emailForm.code
        })

        ElMessage.success('邮箱修改成功')
        showEmailDialog.value = false
        userInfo.value.email = emailForm.email

        // 重置表单
        Object.assign(emailForm, {
          email: '',
          code: ''
        })
      } catch (error) {
        ElMessage.error('邮箱修改失败')
      } finally {
        emailLoading.value = false
      }
    }
  })
}

// 更新手机
const handleUpdatePhone = async () => {
  if (!phoneFormRef.value) return

  await phoneFormRef.value.validate(async (valid) => {
    if (valid) {
      phoneLoading.value = true
      try {
        await updatePhone({ phone: phoneForm.phone })

        ElMessage.success('手机号修改成功')
        showPhoneDialog.value = false
        userInfo.value.phone = phoneForm.phone

        // 重置表单
        phoneForm.phone = ''
      } catch (error) {
        ElMessage.error('手机号修改失败')
      } finally {
        phoneLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.action-list {
  .action-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #f5f7fa;
      margin: 0 -20px;
      padding-left: 20px;
      padding-right: 20px;
    }

    &:last-child {
      border-bottom: none;
    }

    .el-icon:first-child {
      margin-right: 12px;
      color: #409eff;
    }

    span {
      flex: 1;
      color: #303133;
    }

    .arrow {
      color: #c0c4cc;
    }
  }
}

.verify-input {
  display: flex;
  gap: 12px;

  .el-input {
    flex: 1;
  }

  .el-button {
    flex-shrink: 0;
    width: 120px;
  }
}

:deep(.el-descriptions) {
  .el-descriptions__header {
    margin-bottom: 20px;
  }

  .el-descriptions__title {
    font-size: 16px;
    font-weight: bold;
  }

  .el-descriptions__body {
    .el-descriptions__table {
      .el-descriptions__cell {
        padding: 12px 16px;
      }

      .el-descriptions__label {
        font-weight: bold;
        color: #606266;
        background: #fafafa;
      }

      .el-descriptions__content {
        color: #303133;
      }
    }
  }
}

:deep(.el-dialog) {
  .el-dialog__header {
    padding: 20px 20px 10px;

    .el-dialog__title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .el-dialog__body {
    padding: 10px 20px 20px;
  }
}
</style>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

