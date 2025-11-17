<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>教师管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加教师
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="工号">
            <el-input v-model="searchForm.sduid" placeholder="请输入工号" clearable />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="searchForm.username" placeholder="请输入姓名" clearable />
          </el-form-item>
          <el-form-item label="学院">
            <el-select v-model="searchForm.college" placeholder="请选择学院" clearable style="width: 180px;">
              <el-option label="计算机学院" value="计算机学院" />
              <el-option label="软件学院" value="软件学院" />
              <el-option label="数学学院" value="数学学院" />
              <el-option label="物理学院" value="物理学院" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 教师列表 -->
      <el-table
        v-loading="loading"
        :data="teacherList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="sduid" label="工号" width="120" />
        <el-table-column prop="username" label="姓名" width="100" />
        <el-table-column prop="sex" label="性别" width="80">
          <template #default="{ row }">
            {{ row.sex === '1' || row.sex === '男' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="college" label="学院" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editTeacher(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="viewTeacher(row)">
              详情
            </el-button>
            <el-button type="danger" size="small" @click="deleteTeacher(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :page-count="pagination.pageCount"
          layout="sizes, prev, pager, next, jumper, ->, slot"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <span class="pagination-info"> 共 {{ pagination.pageCount }} 页</span>
        </el-pagination>
      </div>
    </el-card>

    <!-- 添加/编辑教师对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑教师' : '添加教师'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="teacherForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号" prop="sduid">
              <el-input v-model="teacherForm.sduid" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="username">
              <el-input v-model="teacherForm.username" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="teacherForm.sex" placeholder="请选择性别">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="teacherForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="teacherForm.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="民族" prop="ethnic">
              <el-input v-model="teacherForm.ethnic" placeholder="请输入民族" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学院" prop="college">
              <el-select v-model="teacherForm.college" placeholder="请选择学院">
                <el-option label="计算机学院" value="计算机学院" />
                <el-option label="软件学院" value="软件学院" />
                <el-option label="数学学院" value="数学学院" />
                <el-option label="物理学院" value="物理学院" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="政治面貌" prop="politicsStatus">
              <el-select v-model="teacherForm.politicsStatus" placeholder="请选择政治面貌">
                <el-option label="中共党员" value="中共党员" />
                <el-option label="共青团员" value="共青团员" />
                <el-option label="群众" value="群众" />
                <el-option label="民主党派" value="民主党派" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="国籍" prop="nation">
              <el-input v-model="teacherForm.nation" placeholder="请输入国籍" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="teacherForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 教师详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="教师详情" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="工号">{{ currentTeacher.sduid }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentTeacher.username }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ currentTeacher.sex === '1' || currentTeacher.sex === '男' ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentTeacher.email }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentTeacher.phone }}</el-descriptions-item>
        <el-descriptions-item label="民族">{{ currentTeacher.ethnic }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentTeacher.college }}</el-descriptions-item>
        <el-descriptions-item label="政治面貌">{{ currentTeacher.politicsStatus }}</el-descriptions-item>
        <el-descriptions-item label="国籍">{{ currentTeacher.nation }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getTeacherList, addUser, updateUser, searchUsers } from '@/api/admin'
import { deleteStudent as deleteUserApi } from '@/api/student'
import type { UserInfo } from '@/types'

const loading = ref(false)
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const searchForm = reactive({
  sduid: '',
  username: '',
  college: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
  pageCount: 0
})

const teacherList = ref<UserInfo[]>([])
const selectedTeachers = ref<UserInfo[]>([])
const currentTeacher = ref<UserInfo>({} as UserInfo)

const teacherForm = reactive({
  sduid: '',
  username: '',
  sex: '',
  email: '',
  phone: '',
  ethnic: '',
  college: '',
  politicsStatus: '',
  nation: '',
  password: ''
})

const formRules: FormRules = {
  sduid: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  college: [
    { required: true, message: '请选择学院', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 获取教师列表
const fetchTeacherList = async () => {
  loading.value = true
  try {
    let response: any

    const hasSearchKeyword = searchForm.sduid || searchForm.username

    if (hasSearchKeyword) {
      // 使用搜索API
      const searchParams = {
        keyword: searchForm.sduid || searchForm.username,
        permission: 1, // 教师权限
        pageNum: pagination.page,
        pageSize: pagination.size
      }
      response = await searchUsers(searchParams)
    } else {
      // 使用教师列表API
      const listParams = {
        college: searchForm.college,
        page: pagination.page,
        limit: pagination.size
      }
      response = await getTeacherList(listParams)
    }

    if (response.code === 200 && response.data) {
      if (Array.isArray(response.data)) {
        teacherList.value = response.data
        pagination.total = response.data.length
        pagination.pageCount = Math.ceil(response.data.length / pagination.size)
      } else if (response.data.user) {
        teacherList.value = response.data.user.map((teacher: any) => ({
          ...teacher,
          permission: 1 // 教师权限
        }))
        // 后端返回的 page 是总页数
        pagination.pageCount = response.data.page
        // 总记录数 = 总页数 × 每页大小
        pagination.total = response.data.page * pagination.size
      } else if (response.data.list) {
        teacherList.value = response.data.list.map((teacher: any) => ({
          ...teacher,
          permission: 1 // 教师权限
        }))
        pagination.total = response.data.total || response.data.list.length
        pagination.pageCount = Math.ceil(pagination.total / pagination.size)
      } else {
        teacherList.value = []
        pagination.total = 0
        pagination.pageCount = 0
      }
    } else {
      teacherList.value = []
      pagination.total = 0
      pagination.pageCount = 0
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
    teacherList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchTeacherList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    sduid: '',
    username: '',
    college: ''
  })
  pagination.page = 1
  fetchTeacherList()
}

// 选择变化
const handleSelectionChange = (selection: UserInfo[]) => {
  selectedTeachers.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchTeacherList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchTeacherList()
}

// 编辑教师
const editTeacher = (teacher: UserInfo) => {
  isEdit.value = true
  currentTeacher.value = teacher

  Object.assign(teacherForm, {
    sduid: teacher.sduid,
    username: teacher.username,
    sex: teacher.sex,
    email: teacher.email,
    phone: teacher.phone,
    ethnic: teacher.ethnic,
    college: teacher.college,
    politicsStatus: teacher.politicsStatus,
    nation: teacher.nation,
    password: ''
  })

  showAddDialog.value = true
}

// 查看教师详情
const viewTeacher = (teacher: UserInfo) => {
  currentTeacher.value = teacher
  showDetailDialog.value = true
}

// 删除教师
const deleteTeacher = async (teacher: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确认删除教师 ${teacher.username}？`,
      '确认删除',
      { type: 'warning' }
    )

    await deleteUserApi(teacher.id)
    ElMessage.success('删除成功')
    fetchTeacherList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除教师失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  Object.assign(teacherForm, {
    sduid: '',
    username: '',
    sex: '',
    email: '',
    phone: '',
    ethnic: '',
    college: '',
    politicsStatus: '',
    nation: '',
    password: ''
  })

  isEdit.value = false
  currentTeacher.value = {} as UserInfo
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true

      try {
        const formData = new FormData()
        Object.keys(teacherForm).forEach(key => {
          if (teacherForm[key as keyof typeof teacherForm]) {
            formData.append(key, teacherForm[key as keyof typeof teacherForm])
          }
        })

        if (isEdit.value) {
          formData.append('id', currentTeacher.value.id.toString())
          await updateUser(formData)
          ElMessage.success('更新成功')
        } else {
          formData.append('permission', '1') // 教师权限
          await addUser(formData)
          ElMessage.success('添加成功')
        }

        showAddDialog.value = false
        fetchTeacherList()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchTeacherList()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  .pagination-info {
    font-size: 14px;
    color: #606266;
    line-height: 32px;
    margin-left: 16px;
  }
}

:deep(.el-table) {
  .el-table__header {
    th {
      background: #f5f7fa;
      color: #606266;
      font-weight: bold;
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

