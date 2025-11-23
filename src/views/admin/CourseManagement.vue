<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程管理</span>
          <div class="header-actions">
            <el-button type="warning" @click="showPendingCourses">
              <el-icon><DocumentChecked /></el-icon>
              待审批课程
            </el-button>
            <el-button type="success" @click="handleAutoSchedule">
              <el-icon><Calendar /></el-icon>
              自动排课
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="课程名称">
            <el-input v-model="searchForm.keyword" placeholder="请输入课程名称" clearable />
          </el-form-item>
          <el-form-item label="学期">
            <el-select v-model="searchForm.term" placeholder="请选择学期" clearable style="width: 150px;">
              <el-option
                v-for="term in termList"
                :key="term.term"
                :label="term.term"
                :value="term.term"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 课程列表 -->
      <el-table
        v-loading="loading"
        :data="courseList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="课程名称" min-width="150" />
        <el-table-column prop="teacherName" label="授课教师" width="120" />
        <el-table-column prop="category" label="课程小类" width="100" />
        <el-table-column prop="type" label="课程类型" width="100" />
        <el-table-column prop="point" label="学分" width="80" />
        <el-table-column prop="capacity" label="容量" width="80" />
        <el-table-column prop="college" label="学院" width="120" />
        <el-table-column prop="term" label="学期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="viewCourse(row)">
              详情
            </el-button>
            <template v-if="row.status === '待审批'">
              <el-button type="success" size="small" @click="approveCourse(row)">
                通过
              </el-button>
              <el-button type="warning" size="small" @click="rejectCourse(row)">
                拒绝
              </el-button>
            </template>
            <template v-else>
              <el-button type="danger" size="small" @click="deleteCourse(row)">
                删除
              </el-button>
            </template>
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

    <!-- 课程详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="课程详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程ID">{{ currentCourse.id }}</el-descriptions-item>
        <el-descriptions-item label="课序号">{{ currentCourse.classNum }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ currentCourse.name }}</el-descriptions-item>
        <el-descriptions-item label="授课教师">{{ currentCourse.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="课程小类">{{ currentCourse.category || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="课程类型">{{ currentCourse.type }}</el-descriptions-item>
        <el-descriptions-item label="学分">{{ currentCourse.point }}</el-descriptions-item>
        <el-descriptions-item label="容量">{{ currentCourse.capacity }}</el-descriptions-item>
        <el-descriptions-item label="教室">{{ currentCourse.classroom }}</el-descriptions-item>
        <el-descriptions-item label="上课时间">{{ currentCourse.time }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentCourse.college }}</el-descriptions-item>
        <el-descriptions-item label="学期">{{ currentCourse.term }}</el-descriptions-item>
        <el-descriptions-item label="开始周次">{{ currentCourse.weekStart }}</el-descriptions-item>
        <el-descriptions-item label="结束周次">{{ currentCourse.weekEnd }}</el-descriptions-item>
        <el-descriptions-item label="周期">{{ currentCourse.period }} 周</el-descriptions-item>
        <el-descriptions-item label="考核方式">
          {{ currentCourse.examination === 1 ? '考试' : '考查' }}
        </el-descriptions-item>
        <el-descriptions-item label="平时成绩占比">
          {{ currentCourse.regularRatio ? (currentCourse.regularRatio * 100).toFixed(0) + '%' : '0%' }}
        </el-descriptions-item>
        <el-descriptions-item label="期末成绩占比">
          {{ currentCourse.finalRatio ? (currentCourse.finalRatio * 100).toFixed(0) + '%' : '0%' }}
        </el-descriptions-item>
        <el-descriptions-item label="成绩是否公开">
          <el-tag :type="currentCourse.published ? 'success' : 'info'" size="small">
            {{ currentCourse.published ? '已公开' : '未公开' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentCourse.status)" size="small">
            {{ currentCourse.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="课程介绍" :span="2">
          {{ currentCourse.intro || '暂无介绍' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentCourse.f_reason" label="拒绝原因" :span="2">
          <el-text type="danger">{{ currentCourse.f_reason }}</el-text>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="showApproveDialog" title="审核课程" width="500px">
      <el-form :model="approveForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="approveForm.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="approveForm.status === 1" label="课序号">
          <el-input
            v-model="approveForm.classNum"
            placeholder="请输入课序号"
          />
        </el-form-item>
        <el-form-item v-if="approveForm.status === 1" label="选择班级">
          <el-select
            v-model="approveForm.sectionId"
            multiple
            placeholder="请选择班级（可多选）"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="section in sectionList"
              :key="section.id"
              :label="`${section.grade}级${section.number}班 (${getMajorName(section.major)})`"
              :value="section.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="approveForm.status === 2" label="拒绝原因">
          <el-input
            v-model="approveForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showApproveDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleApprove">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Calendar, DocumentChecked } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPendingCourses,
  approveCourse as approveCourseApi,
  deleteApprovedCourse,
  searchCourses,
  getAllCourses,
  getCourseDetail
} from '@/api/course'
import { getTermList, getCurrentTerm } from '@/api/common'
import { autoSchedule } from '@/api/course'
import { getSectionListAll } from '@/api/section'
import type { Course, Term, SectionInfo } from '@/types'

const loading = ref(false)
const showDetailDialog = ref(false)
const showApproveDialog = ref(false)
const submitLoading = ref(false)

const searchForm = reactive({
  keyword: '',
  term: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const courseList = ref<Course[]>([])
const selectedCourses = ref<Course[]>([])
const currentCourse = ref<Course>({} as Course)
const termList = ref<Term[]>([])
const sectionList = ref<SectionInfo[]>([])

const approveForm = reactive({
  status: 1,
  reason: '',
  classNum: '',
  sectionId: [] as number[]
})

// 专业名称映射
const getMajorName = (major: string) => {
  const majorMap: Record<string, string> = {
    'MAJOR_0': '软件工程',
    'MAJOR_1': '数字媒体技术',
    'MAJOR_2': '大数据',
    'MAJOR_3': '人工智能',
    '0': '软件工程',
    '1': '数字媒体技术',
    '2': '大数据',
    '3': '人工智能'
  }
  return majorMap[major] || major
}

// 获取状态标签类型
const getStatusType = (status: string|undefined) => {
  switch (status) {
    case '待审批':
      return 'warning'
    case '已通过':
      return 'success'
    case '已拒绝':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取学期列表
const fetchTermList = async () => {
  try {
    const response = await getTermList()
    if (response.code === 200 && response.data) {
      termList.value = response.data
    }
  } catch (error) {
    console.error('获取学期列表失败:', error)
  }
}

// 获取班级列表
const fetchSectionList = async () => {
  try {
    const response = await getSectionListAll({ page: 1, size: 500 })
    if (response.code === 200 && response.data) {
      sectionList.value = response.data.section || []
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

// 获取课程列表
const fetchCourseList = async () => {
  loading.value = true
  try {
    let response: any

    if (searchForm.keyword) {
      // 如果有关键词搜索，使用搜索API
      const searchParams: any = {}
      if (searchForm.keyword) searchParams.keyword = searchForm.keyword
      if (searchForm.term) searchParams.term = searchForm.term

      response = await searchCourses(searchParams)
    } else {
      // 获取所有课程列表
      const listParams: any = {
        pageNum: pagination.page,
        pageSize: pagination.size
      }
      // 如果有学期筛选，添加学期参数
      if (searchForm.term) {
        listParams.term = searchForm.term
      }
      response = await getAllCourses(listParams)
    }

    if (response.code === 200 && response.data) {
      if (Array.isArray(response.data)) {
        courseList.value = response.data
        pagination.total = response.data.length
      } else if (response.data.list) {
        courseList.value = response.data.list
        pagination.total = response.data.total || response.data.list.length
      } else {
        courseList.value = []
        pagination.total = 0
      }
    } else {
      courseList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
    courseList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCourseList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    term: ''
  })
  pagination.page = 1
  fetchCourseList()
}

// 显示待审批课程
const showPendingCourses = async () => {
  loading.value = true
  try {
    const response = await getPendingCourses()

    if (response.code === 200 && response.data) {
      if (Array.isArray(response.data)) {
        courseList.value = response.data
        pagination.total = response.data.length
      } else if (response.data.list) {
        courseList.value = response.data.list
        pagination.total = response.data.total || response.data.list.length
      } else {
        courseList.value = []
        pagination.total = 0
      }

      // 清空搜索条件
      Object.assign(searchForm, {
        keyword: '',
        term: ''
      })

      ElMessage.success(`加载了 ${courseList.value.length} 条待审批课程`)
    } else {
      ElMessage.error('获取待审批课程失败')
    }
  } catch (error) {
    console.error('获取待审批课程失败:', error)
    ElMessage.error('获取待审批课程失败')
  } finally {
    loading.value = false
  }
}

// 选择变化
const handleSelectionChange = (selection: Course[]) => {
  selectedCourses.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchCourseList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchCourseList()
}

// 查看课程详情
const viewCourse = async (course: Course) => {
  try {
    loading.value = true
    const response = await getCourseDetail(course.id)

    if (response.code === 200 && response.data) {
      currentCourse.value = response.data
      showDetailDialog.value = true
    } else {
      ElMessage.error('获取课程详情失败')
    }
  } catch (error) {
    console.error('获取课程详情失败:', error)
    ElMessage.error('获取课程详情失败')
  } finally {
    loading.value = false
  }
}

// 审核课程
const approveCourse = (course: Course) => {
  currentCourse.value = course
  approveForm.status = 1
  approveForm.reason = ''
  // 预填充课序号（从申请中读取）
  approveForm.classNum = course.classNum || ''
  approveForm.sectionId = []
  showApproveDialog.value = true
}

// 拒绝课程
const rejectCourse = (course: Course) => {
  currentCourse.value = course
  approveForm.status = 2
  approveForm.reason = ''
  approveForm.classNum = ''
  approveForm.sectionId = []
  showApproveDialog.value = true
}

// 处理审核
const handleApprove = async () => {
  if (approveForm.status === 2 && !approveForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  if (approveForm.status === 1 && !approveForm.classNum.trim()) {
    ElMessage.warning('请输入课序号')
    return
  }

  submitLoading.value = true
  try {
    await approveCourseApi(
      currentCourse.value.id,
      approveForm.status,
      approveForm.classNum,
      approveForm.reason,
      approveForm.sectionId
    )

    ElMessage.success(approveForm.status === 1 ? '审核通过' : '审核拒绝')
    showApproveDialog.value = false
    fetchCourseList()
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  } finally {
    submitLoading.value = false
  }
}

// 删除课程
const deleteCourse = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确认删除课程 ${course.name}？`,
      '确认删除',
      { type: 'warning' }
    )

    await deleteApprovedCourse(course.id)
    ElMessage.success('删除成功')
    fetchCourseList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除课程失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 自动排课
const handleAutoSchedule = async () => {
  try {
    const currentTermResponse = await getCurrentTerm()
    if (currentTermResponse.code !== 200 || !currentTermResponse.data) {
      ElMessage.error('获取当前学期失败')
      return
    }

    let termName = ''
    if (typeof currentTermResponse.data === 'string') {
      termName = currentTermResponse.data
    } else {
      ElMessage.error('无法获取当前学期名称')
      return
    }

    await ElMessageBox.confirm(
      `确认对当前学期 ${termName} 进行自动排课？`,
      '确认排课',
      { type: 'warning' }
    )

    loading.value = true
    await autoSchedule(termName)
    ElMessage.success('自动排课成功')
    fetchCourseList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('自动排课失败:', error)
      ElMessage.error('自动排课失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTermList()
  fetchSectionList()
  fetchCourseList()
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

