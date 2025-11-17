<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>班级管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              添加班级
            </el-button>
            <el-button type="success" @click="showAssignDialog = true">
              <el-icon><UserFilled /></el-icon>
              分配人员
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="年级">
            <el-select v-model="searchForm.grade" placeholder="请选择年级" clearable style="width: 120px;">
              <el-option label="2021级" value="2021" />
              <el-option label="2022级" value="2022" />
              <el-option label="2023级" value="2023" />
              <el-option label="2024级" value="2024" />
            </el-select>
          </el-form-item>
          <el-form-item label="专业">
            <el-select v-model="searchForm.major" placeholder="请选择专业" clearable style="width: 200px;">
              <el-option label="软件工程" value="0" />
              <el-option label="数字媒体技术" value="1" />
              <el-option label="大数据" value="2" />
              <el-option label="AI" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="请输入班级名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 班级列表 -->
      <el-table
        v-loading="loading"
        :data="sectionList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="number" label="班级号" width="100" />
        <el-table-column label="班级名称" width="150">
          <template #default="{ row }">
            {{ row.grade }}级{{ row.number }}班
          </template>
        </el-table-column>
        <el-table-column label="专业" width="200">
          <template #default="{ row }">
            {{ getMajorName(row.major) }}
          </template>
        </el-table-column>
        <el-table-column prop="advisor" label="班主任" width="120" />
        <el-table-column prop="studentCount" label="学生人数" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editSection(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="viewSection(row)">
              详情
            </el-button>
            <el-button type="danger" size="small" @click="deleteSection(row)">
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

    <!-- 添加/编辑班级对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑班级' : '添加班级'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="sectionForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="年级" prop="grade">
          <el-select v-model="sectionForm.grade" placeholder="请选择年级">
            <el-option label="2021级" value="2021" />
            <el-option label="2022级" value="2022" />
            <el-option label="2023级" value="2023" />
            <el-option label="2024级" value="2024" />
          </el-select>
        </el-form-item>

        <el-form-item label="班级号" prop="number">
          <el-input v-model="sectionForm.number" placeholder="请输入班级号，如：01" />
        </el-form-item>

        <el-form-item label="专业" prop="major">
          <el-select v-model="sectionForm.major" placeholder="请选择专业">
            <el-option label="软件工程" value="0" />
            <el-option label="数字媒体技术" value="1" />
            <el-option label="大数据" value="2" />
            <el-option label="AI" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="班主任" prop="advisorId">
          <el-select
            v-model="sectionForm.advisorId"
            placeholder="请选择班主任"
            filterable
            remote
            :remote-method="searchTeachers"
            :loading="teacherLoading"
          >
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.id"
              :label="`${teacher.username} (${teacher.sduid})`"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
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

    <!-- 班级详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="班级详情" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="年级">{{ currentSection.grade }}级</el-descriptions-item>
        <el-descriptions-item label="班级号">{{ currentSection.number }}</el-descriptions-item>
        <el-descriptions-item label="班级名称">
          {{ currentSection.grade }}级{{ currentSection.number }}班
        </el-descriptions-item>
        <el-descriptions-item label="专业">
          {{ getMajorName(currentSection.major) }}
        </el-descriptions-item>
        <el-descriptions-item label="班主任">{{ currentSection.advisor }}</el-descriptions-item>
        <el-descriptions-item label="学生人数">{{ currentSection.studentCount }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 分配人员对话框 -->
    <el-dialog v-model="showAssignDialog" title="分配人员" width="400px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="年级">
          <el-select v-model="assignForm.grade" placeholder="请选择年级">
            <el-option label="2021级" value="2021" />
            <el-option label="2022级" value="2022" />
            <el-option label="2023级" value="2023" />
            <el-option label="2024级" value="2024" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAssignDialog = false">取消</el-button>
          <el-button type="primary" :loading="assignLoading" @click="handleAssign">
            确定分配
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getSectionListAll,
  addSection,
  updateSection,
  deleteSection as deleteSectionApi,
  assignSection,
  searchSections
} from '@/api/section'
import { searchUsers, getUserInfo } from '@/api/admin'
import type { SectionInfo, UserInfo } from '@/types'

const loading = ref(false)
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const showAssignDialog = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const assignLoading = ref(false)
const teacherLoading = ref(false)
const formRef = ref<FormInstance>()

const searchForm = reactive({
  grade: '',
  major: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const sectionList = ref<SectionInfo[]>([])
const selectedSections = ref<SectionInfo[]>([])
const currentSection = ref<SectionInfo>({} as SectionInfo)
const teacherOptions = ref<UserInfo[]>([])
const teacherCache = ref<Map<number, string>>(new Map()) // 教师ID到姓名的缓存

const sectionForm = reactive({
  grade: '',
  number: '',
  major: '',
  advisorId: null as number | null
})

const assignForm = reactive({
  grade: ''
})

const formRules: FormRules = {
  grade: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ],
  number: [
    { required: true, message: '请输入班级号', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请选择专业', trigger: 'change' }
  ],
  advisorId: [
    { required: true, message: '请选择班主任', trigger: 'change' }
  ]
}

// 专业名称映射
const getMajorName = (major: string | number) => {
  // 如果已经是中文名称，直接返回
  if (typeof major === 'string' && /[\u4e00-\u9fa5]/.test(major)) {
    return major
  }

  const majorMap: Record<string, string> = {
    'MAJOR_0': '软件工程',
    'MAJOR_1': '数字媒体技术',
    'MAJOR_2': '大数据',
    'MAJOR_3': 'AI',
    '0': '软件工程',
    '1': '数字媒体技术',
    '2': '大数据',
    '3': 'AI'
  }
  return majorMap[major.toString()] || major.toString()
}

// 获取班级列表
const fetchSectionList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }

    // 只在有值时才添加参数
    if (searchForm.grade) {
      params.grade = searchForm.grade
    }
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }
    if (searchForm.major) {
      params.major = searchForm.major
    }

    // 判断使用哪个接口
    const hasSearchCondition = searchForm.keyword || searchForm.grade || searchForm.major
    let response: any

    if (hasSearchCondition) {
      // 有搜索条件，使用搜索接口
      response = await searchSections(params)
    } else {
      // 无搜索条件，使用获取所有班级接口
      response = await getSectionListAll(params)
    }

    if (response.code === 200 && response.data) {
      let rawData: any[] = []

      // 处理响应格式
      if (Array.isArray(response.data)) {
        // 如果直接返回数组
        rawData = response.data
        pagination.total = response.data.length
      } else if (response.data.section) {
        // 如果返回对象包含 section 字段
        rawData = response.data.section
        // 如果有 page 字段，表示总页数，需要转换为总记录数
        if (response.data.page) {
          pagination.total = response.data.page * pagination.size
        } else {
          pagination.total = response.data.section.length
        }
      } else if (response.data.list) {
        // 如果返回对象包含 list 字段
        rawData = response.data.list
        pagination.total = response.data.total || response.data.list.length
      } else {
        sectionList.value = []
        pagination.total = 0
        return
      }

      // 收集所有需要查询的教师ID
      const advisorIds = [...new Set(rawData.map((item: any) => item.advisorId).filter(Boolean))]

      // 批量获取教师信息
      for (const advisorId of advisorIds) {
        if (!teacherCache.value.has(advisorId)) {
          try {
            const teacherResponse: any = await getUserInfo(advisorId)
            if (teacherResponse.code === 200 && teacherResponse.data) {
              const username = teacherResponse.data.user?.username || teacherResponse.data.username
              if (username) {
                teacherCache.value.set(advisorId, username)
              }
            }
          } catch (error) {
            console.error(`获取教师信息失败 (ID: ${advisorId}):`, error)
          }
        }
      }

      // 补充缺失的字段
      sectionList.value = rawData.map((item: any) => ({
        ...item,
        advisor: item.advisorId ? (teacherCache.value.get(item.advisorId) || '未知') : '未分配',
        studentCount: item.studentCount || 0
      }))
    } else {
      sectionList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
    sectionList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索教师
const searchTeachers = async (query: string) => {
  if (!query) {
    teacherOptions.value = []
    return
  }

  teacherLoading.value = true
  try {
    const response = await searchUsers({
      keyword: query,
      permission: 1, // 教师权限
      pageNum: 1,
      pageSize: 20
    })

    if (response.code === 200 && response.data) {
      teacherOptions.value = Array.isArray(response.data) ? response.data : response.data.list || []
    } else {
      teacherOptions.value = []
    }
  } catch (error) {
    console.error('搜索教师失败:', error)
    teacherOptions.value = []
  } finally {
    teacherLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchSectionList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    grade: '',
    major: '',
    keyword: ''
  })
  pagination.page = 1
  fetchSectionList()
}

// 选择变化
const handleSelectionChange = (selection: SectionInfo[]) => {
  selectedSections.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchSectionList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchSectionList()
}

// 编辑班级
const editSection = (section: SectionInfo) => {
  isEdit.value = true
  currentSection.value = section

  Object.assign(sectionForm, {
    grade: section.grade,
    number: section.number,
    major: section.major,
    advisorId: section.advisorId
  })

  showAddDialog.value = true
}

// 查看班级详情
const viewSection = (section: SectionInfo) => {
  currentSection.value = section
  showDetailDialog.value = true
}

// 删除班级
const deleteSection = async (section: SectionInfo) => {
  try {
    await ElMessageBox.confirm(
      `确认删除班级 ${section.grade}级${section.number}班？`,
      '确认删除',
      { type: 'warning' }
    )

    await deleteSectionApi(section.id.toString())
    ElMessage.success('删除成功')
    fetchSectionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除班级失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  Object.assign(sectionForm, {
    grade: '',
    number: '',
    major: '',
    advisorId: null
  })

  isEdit.value = false
  currentSection.value = {} as SectionInfo
  teacherOptions.value = []
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true

      try {
        const data: any = {
          grade: sectionForm.grade,
          number: sectionForm.number,
          major: sectionForm.major,
          advisorId: sectionForm.advisorId
        }

        if (isEdit.value) {
          await updateSection({
            id: currentSection.value.id,
            ...data
          })
          ElMessage.success('更新成功')
        } else {
          await addSection(data)
          ElMessage.success('添加成功')
        }

        showAddDialog.value = false
        fetchSectionList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 分配人员
const handleAssign = async () => {
  if (!assignForm.grade) {
    ElMessage.warning('请选择年级')
    return
  }

  assignLoading.value = true
  try {
    await assignSection(assignForm.grade)
    ElMessage.success('分配成功')
    showAssignDialog.value = false
    fetchSectionList()
  } catch (error) {
    console.error('分配失败:', error)
    ElMessage.error('分配失败')
  } finally {
    assignLoading.value = false
  }
}

onMounted(() => {
  fetchSectionList()
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

.header-actions {
  display: flex;
  gap: 10px;
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

