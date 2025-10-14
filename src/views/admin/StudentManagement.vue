<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加学生
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="学号">
            <el-input v-model="searchForm.sduid" placeholder="请输入学号" clearable />
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
          <el-form-item label="专业">
            <el-select v-model="searchForm.major" placeholder="请选择专业" clearable style="width: 200px;">
              <el-option label="计算机科学与技术" value="MAJOR_0" />
              <el-option label="软件工程" value="MAJOR_1" />
              <el-option label="数据科学与大数据技术" value="MAJOR_2" />
              <el-option label="人工智能" value="MAJOR_3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 学生列表 -->
      <el-table
        v-loading="loading"
        :data="studentList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="sduid" label="学号" width="120" />
        <el-table-column prop="username" label="姓名" width="100" />
        <el-table-column prop="sex" label="性别" width="80">
          <template #default="{ row }">
            {{ row.sex === '1' || row.sex === '男' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="college" label="学院" width="120" />
        <el-table-column prop="major" label="专业" width="150">
          <template #default="{ row }">
            {{ getMajorName(row.major) }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editStudent(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="viewStudent(row)">
              详情
            </el-button>
            <el-button type="danger" size="small" @click="deleteStudent(row)">
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
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑学生对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑学生' : '添加学生'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="studentForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号" prop="sduid">
              <el-input v-model="studentForm.sduid" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="username">
              <el-input v-model="studentForm.username" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="studentForm.sex" placeholder="请选择性别">
                <el-option label="男" value="1" />
                <el-option label="女" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="studentForm.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="民族" prop="ethnic">
              <el-input v-model="studentForm.ethnic" placeholder="请输入民族" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学院" prop="college">
              <el-select v-model="studentForm.college" placeholder="请选择学院">
                <el-option label="计算机学院" value="计算机学院" />
                <el-option label="软件学院" value="软件学院" />
                <el-option label="数学学院" value="数学学院" />
                <el-option label="物理学院" value="物理学院" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-select v-model="studentForm.major" placeholder="请选择专业">
                <el-option label="计算机科学与技术" value="MAJOR_0" />
                <el-option label="软件工程" value="MAJOR_1" />
                <el-option label="数据科学与大数据技术" value="MAJOR_2" />
                <el-option label="人工智能" value="MAJOR_3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="政治面貌" prop="politicsStatus">
              <el-select v-model="studentForm.politicsStatus" placeholder="请选择政治面貌">
                <el-option label="群众" value="群众" />
                <el-option label="团员" value="团员" />
                <el-option label="党员" value="党员" />
                <el-option label="预备党员" value="预备党员" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="籍贯" prop="nation">
              <el-input v-model="studentForm.nation" placeholder="请输入籍贯" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="studentForm.password"
            type="password"
            placeholder="请输入初始密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ isEdit ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 学生详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="学生详情" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学号">{{ currentStudent.sduid }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentStudent.username }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ currentStudent.sex === '1' ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentStudent.email }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentStudent.phone }}</el-descriptions-item>
        <el-descriptions-item label="民族">{{ currentStudent.ethnic }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentStudent.college }}</el-descriptions-item>
        <el-descriptions-item label="专业">
          {{ getMajorName(currentStudent.major) }}
        </el-descriptions-item>
        <el-descriptions-item label="政治面貌">{{ currentStudent.politicsStatus }}</el-descriptions-item>
        <el-descriptions-item label="籍贯">{{ currentStudent.nation }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { addUser, updateUser, searchUsers, getStudentList as getAdminStudentList } from '@/api/admin'
import { deleteStudent as deleteStudentApi } from '@/api/student'
import type { UserInfo, PageRequest, PageResponse } from '@/types'

const loading = ref(false)
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const searchForm = reactive({
  sduid: '',
  username: '',
  college: '',
  major: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const studentList = ref<UserInfo[]>([])
const selectedStudents = ref<UserInfo[]>([])
const currentStudent = ref<UserInfo>({} as UserInfo)

const studentForm = reactive({
  sduid: '',
  username: '',
  sex: '',
  email: '',
  phone: '',
  ethnic: '',
  college: '',
  major: '',
  politicsStatus: '',
  nation: '',
  password: ''
})

const formRules: FormRules = {
  sduid: [
    { required: true, message: '请输入学号', trigger: 'blur' }
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
  major: [
    { required: true, message: '请选择专业', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 获取专业名称
const getMajorName = (major: string | number) => {
  const majorMap: Record<string, string> = {
    'MAJOR_0': '计算机科学与技术',
    'MAJOR_1': '软件工程',
    'MAJOR_2': '数据科学与大数据技术',
    'MAJOR_3': '人工智能',
    '0': '软件工程',
    '1': '数字媒体技术',
    '2': '大数据',
    '3': 'AI'
  }
  return majorMap[major.toString()] || major.toString()
}

// 获取学生列表
const fetchStudentList = async () => {
  loading.value = true
  try {
    let response: any

    // 判断是否有搜索条件
    const hasSearchKeyword = searchForm.sduid || searchForm.username

    if (hasSearchKeyword) {
      // 使用搜索API
      const searchParams = {
        keyword: searchForm.sduid || searchForm.username,
        permission: 2, // 学生权限
        pageNum: pagination.page,
        pageSize: pagination.size
      }
      response = await searchUsers(searchParams)
    } else {
      // 使用普通列表API
      const listParams: any = {
        pageNum: pagination.page,
        pageSize: pagination.size
      }

      // 添加筛选条件
      if (searchForm.major) {
        // 将专业枚举转换为数字
        const majorMap: Record<string, string> = {
          'MAJOR_0': '0',
          'MAJOR_1': '1',
          'MAJOR_2': '2',
          'MAJOR_3': '3'
        }
        listParams.major = majorMap[searchForm.major] || searchForm.major
      }

      response = await getAdminStudentList(listParams)
    }

    if (response.code === 200 && response.data) {
      // 处理响应数据
      if (Array.isArray(response.data)) {
        studentList.value = response.data
        pagination.total = response.data.length
      } else if (response.data.list) {
        // 处理学生数据，添加缺失的字段
        studentList.value = response.data.list.map((student: any) => ({
          ...student,
          // 确保有必要的字段
          permission: 2, // 学生权限
          email: student.email || '',
          phone: student.phone || '',
          ethnic: student.ethnic || '',
          college: student.college || '',
          politicsStatus: student.politicsStatus || '',
          nation: student.nation || ''
        }))
        pagination.total = response.data.total || response.data.list.length
      } else {
        studentList.value = []
        pagination.total = 0
      }
    } else {
      studentList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
    studentList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchStudentList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    sduid: '',
    username: '',
    college: '',
    major: ''
  })
  pagination.page = 1
  fetchStudentList()
}

// 选择变化
const handleSelectionChange = (selection: UserInfo[]) => {
  selectedStudents.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchStudentList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchStudentList()
}

// 编辑学生
const editStudent = (student: UserInfo) => {
  isEdit.value = true
  currentStudent.value = student

  Object.assign(studentForm, {
    sduid: student.sduid,
    username: student.username,
    sex: student.sex,
    email: student.email,
    phone: student.phone,
    ethnic: student.ethnic,
    college: student.college,
    major: student.major,
    politicsStatus: student.politicsStatus,
    nation: student.nation,
    password: ''
  })

  showAddDialog.value = true
}

// 查看学生详情
const viewStudent = (student: UserInfo) => {
  currentStudent.value = student
  showDetailDialog.value = true
}

// 删除学生
const deleteStudent = async (student: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确认删除学生 ${student.username}？`,
      '确认删除',
      { type: 'warning' }
    )

    await deleteStudentApi(student.id)
    ElMessage.success('删除成功')
    fetchStudentList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除学生失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  Object.assign(studentForm, {
    sduid: '',
    username: '',
    sex: '',
    email: '',
    phone: '',
    ethnic: '',
    college: '',
    major: '',
    politicsStatus: '',
    nation: '',
    password: ''
  })

  isEdit.value = false
  currentStudent.value = {} as UserInfo
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true

      try {
        const formData = new FormData()
        Object.keys(studentForm).forEach(key => {
          if (studentForm[key as keyof typeof studentForm]) {
            formData.append(key, studentForm[key as keyof typeof studentForm])
          }
        })

        if (isEdit.value) {
          formData.append('id', currentStudent.value.id.toString())
          await updateUser(formData)
          ElMessage.success('更新成功')
        } else {
          formData.append('permission', '2') // 学生权限
          await addUser(formData)
          ElMessage.success('添加成功')
        }

        showAddDialog.value = false
        fetchStudentList()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchStudentList()
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

