<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog">
              <el-icon><Plus /></el-icon>
              申请课程
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
      >
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="category" label="课程小类" />
        <el-table-column prop="type" label="课程类型" />
        <el-table-column prop="point" label="学分" />
        <el-table-column prop="term" label="学期" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="viewCourse(row)">
              详情
            </el-button>
            <template v-if="row.status === '已通过'">
              <el-button type="success" size="small" @click="viewStudents(row)">
                选课学生
              </el-button>
            </template>
            <template v-if="row.status === '待审批' || row.status === '已拒绝'">
              <el-button type="primary" size="small" @click="editCourse(row)">
                编辑
              </el-button>
            </template>
            <template v-if="row.status === '已拒绝'">
              <el-button type="warning" size="small" @click="viewReason(row)">
                查看原因
              </el-button>
            </template>
            <el-button type="danger" size="small" @click="deleteCourse(row)">
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

    <!-- 添加/编辑课程对话框 -->
    <el-dialog
      v-model="showFormDialog"
      :title="isEdit ? '编辑课程' : '申请课程'"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="courseForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="name">
              <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课序号" prop="classNum">
              <el-input v-model="courseForm.classNum" placeholder="请输入课序号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程小类" prop="category">
              <el-select
                v-model="courseForm.category"
                placeholder="请选择课程小类"
                style="width: 100%"
                :disabled="!isSportsCategory"
                clearable
              >
                <el-option label="无" value="无" />
                <el-option label="羽毛球" value="羽毛球" />
                <el-option label="篮球" value="篮球" />
                <el-option label="网球" value="网球" />
                <el-option label="乒乓球" value="乒乓球" />
                <el-option label="武术" value="武术" />
                <el-option label="健美操" value="健美操" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程类型" prop="type">
              <el-select v-model="courseForm.type" placeholder="请选择课程类型" style="width: 100%">
                <el-option label="必修" value="必修" />
                <el-option label="限选" value="限选" />
                <el-option label="任选" value="任选" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学分" prop="point">
              <el-input-number v-model="courseForm.point" :min="0" :max="10" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input-number v-model="courseForm.capacity" :min="1" :max="500" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="教室">
              <el-select v-model="courseForm.classroom" placeholder="请选择教室（可选）" style="width: 100%" filterable clearable>
                <el-option
                  v-for="room in classroomList"
                  :key="room.location"
                  :label="room.location"
                  :value="room.location"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学院" prop="college">
              <el-input v-model="courseForm.college" placeholder="请输入学院" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学期" prop="term">
              <el-select v-model="courseForm.term" placeholder="请选择学期" style="width: 100%">
                <el-option
                  v-for="term in termList"
                  :key="term.term"
                  :label="term.term"
                  :value="term.term"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考核方式" prop="examination">
              <el-radio-group v-model="courseForm.examination">
                <el-radio :label="1">考试</el-radio>
                <el-radio :label="0">考查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始周次" prop="weekStart">
              <el-input-number v-model="courseForm.weekStart" :min="1" :max="20" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束周次" prop="weekEnd">
              <el-input-number v-model="courseForm.weekEnd" :min="1" :max="20" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平时成绩占比" prop="regularRatio">
              <div style="display: flex; align-items: center;">
                <el-input-number
                  v-model="regularRatioPercent"
                  :min="0"
                  :max="100"
                  :step="5"
                  style="flex: 1;"
                />
                <span style="margin-left: 8px">%</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="期末成绩占比" prop="finalRatio">
              <div style="display: flex; align-items: center;">
                <el-input-number
                  v-model="finalRatioPercent"
                  :min="0"
                  :max="100"
                  :step="5"
                  style="flex: 1;"
                />
                <span style="margin-left: 8px">%</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程介绍" prop="intro">
          <el-input
            v-model="courseForm.intro"
            type="textarea"
            :rows="4"
            placeholder="请输入课程介绍"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showFormDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '保存' : '提交申请' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="showReasonDialog" title="拒绝原因" width="500px">
      <el-alert
        :title="rejectionReason"
        type="error"
        :closable="false"
        show-icon
      />
    </el-dialog>

    <!-- 选课学生对话框 -->
    <el-dialog v-model="showStudentsDialog" title="选课学生名单" width="800px">
      <div v-if="currentCourse" style="margin-bottom: 16px;">
        <el-tag type="primary">{{ currentCourse.name }}</el-tag>
        <el-tag type="info" style="margin-left: 8px;">课序号: {{ currentCourse.classNum }}</el-tag>
        <el-tag type="success" style="margin-left: 8px;">
          选课人数: {{ studentList.length }}
          <template v-if="currentCourse.capacity">
            / {{ currentCourse.capacity }}
          </template>
        </el-tag>
      </div>

      <el-table :data="studentList" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="sduid" label="学号" width="150">
          <template #default="{ row }">
            {{ row.sduid || row.SDUId }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="姓名" width="120">
          <template #default="{ row }">
            {{ row.username || row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="major" label="专业">
          <template #default="{ row }">
            {{ getMajorName(row.major) }}
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="section" label="班级" width="100">
          <template #default="{ row }">
            {{ row.section || row.number || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  searchTeacherCourses,
  applyCourse,
  updateTeacherCourse,
  deleteTeacherCourse,
  getCourseDetail,
  getCourseReason,
  getCourseStudents
} from '@/api/course'
import { getTermList, getClassRoomList, getCurrentTerm } from '@/api/common'
import type { Course, Term, CreateCourseDTO } from '@/types'
import type { Classroom } from '@/api/teacher'

const loading = ref(false)
const submitLoading = ref(false)
const showDetailDialog = ref(false)
const showFormDialog = ref(false)
const showReasonDialog = ref(false)
const showStudentsDialog = ref(false)
const isEdit = ref(false)

const formRef = ref<FormInstance>()

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
const termList = ref<Term[]>([])
const classroomList = ref<Classroom[]>([])
const currentCourse = ref<Course>({} as Course)
const rejectionReason = ref('')
const currentTermValue = ref('')
const studentList = ref<any[]>([])

// 课程表单
const courseForm = reactive<Partial<CreateCourseDTO>>({
  name: '',
  classNum: '',
  category: '无',
  type: '',
  point: 0,
  capacity: 0,
  classroom: '',
  college: '软件学院',
  term: '',
  weekStart: 1,
  weekEnd: 16,
  examination: 1,
  regularRatio: 0.4,
  finalRatio: 0.6,
  intro: ''
})

// 判断是否为体育类课程（课程名称包含"体育"）
const isSportsCategory = computed(() => {
  return courseForm.name?.includes('体育') || false
})

// 成绩占比百分比形式（用于表单输入）
const regularRatioPercent = computed({
  get: () => (courseForm.regularRatio || 0) * 100,
  set: (val) => {
    courseForm.regularRatio = val / 100
    courseForm.finalRatio = (100 - val) / 100
  }
})

const finalRatioPercent = computed({
  get: () => (courseForm.finalRatio || 0) * 100,
  set: (val) => {
    courseForm.finalRatio = val / 100
    courseForm.regularRatio = (100 - val) / 100
  }
})

// 表单验证规则
const formRules: FormRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  classNum: [{ required: true, message: '请输入课序号', trigger: 'blur' }],
  category: [{ required: true, message: '请输入课程小类', trigger: 'blur' }],
  type: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  point: [{ required: true, message: '请输入学分', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入容量', trigger: 'blur' }],
  college: [{ required: true, message: '请输入学院', trigger: 'blur' }],
  term: [{ required: true, message: '请选择学期', trigger: 'change' }],
  weekStart: [{ required: true, message: '请输入开始周次', trigger: 'blur' }],
  weekEnd: [{ required: true, message: '请输入结束周次', trigger: 'blur' }],
  examination: [{ required: true, message: '请选择考核方式', trigger: 'change' }]
}

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
const getStatusType = (status: string | undefined) => {
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

// 获取当前学期
const fetchCurrentTerm = async () => {
  try {
    const response = await getCurrentTerm()
    if (response.code === 200 && response.data) {
      // 处理不同的返回格式
      if (typeof response.data === 'string') {
        currentTermValue.value = response.data
      } else if (response.data.term) {
        currentTermValue.value = response.data.term
      }
    }
  } catch (error) {
    console.error('获取当前学期失败:', error)
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

// 获取教室列表
const fetchClassroomList = async () => {
  try {
    const response = await getClassRoomList()
    if (response.code === 200 && response.data) {
      classroomList.value = response.data
    }
  } catch (error) {
    console.error('获取教室列表失败:', error)
  }
}

// 获取课程列表
const fetchCourseList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.page,
      pageSize: pagination.size,
      term: searchForm.term || undefined,
      keyword: searchForm.keyword || undefined
    }

    const response = await searchTeacherCourses(params)

    if (response.code === 200 && response.data) {
      // 处理不同的响应格式
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

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  resetForm()
  // 设置默认学期为当前学期
  if (currentTermValue.value) {
    courseForm.term = currentTermValue.value
  }
  showFormDialog.value = true
}

// 编辑课程
const editCourse = async (course: Course) => {
  try {
    loading.value = true
    const response = await getCourseDetail(course.id)

    if (response.code === 200 && response.data) {
      isEdit.value = true
      currentCourse.value = response.data

      // 填充表单
      Object.assign(courseForm, {
        name: response.data.name,
        classNum: response.data.classNum,
        category: response.data.category,
        type: response.data.type,
        point: response.data.point,
        capacity: response.data.capacity,
        classroom: response.data.classroom,
        college: response.data.college,
        term: response.data.term,
        weekStart: response.data.weekStart,
        weekEnd: response.data.weekEnd,
        examination: response.data.examination,
        regularRatio: response.data.regularRatio || 0.4,
        finalRatio: response.data.finalRatio || 0.6,
        intro: response.data.intro
      })

      showFormDialog.value = true
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

// 查看拒绝原因
const viewReason = async (course: Course) => {
  try {
    const response = await getCourseReason(course.id)

    if (response.code === 200) {
      rejectionReason.value = response.data || course.f_reason || '未提供拒绝原因'
      showReasonDialog.value = true
    } else {
      ElMessage.error('获取拒绝原因失败')
    }
  } catch (error) {
    console.error('获取拒绝原因失败:', error)
    ElMessage.error('获取拒绝原因失败')
  }
}

// 查看选课学生
const viewStudents = async (course: Course) => {
  try {
    loading.value = true
    currentCourse.value = course

    const response = await getCourseStudents(course.id)

    if (response.code === 200 && response.data) {
      studentList.value = Array.isArray(response.data) ? response.data : []
      showStudentsDialog.value = true
    } else {
      ElMessage.error(response.msg || '获取学生列表失败')
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
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

    await deleteTeacherCourse(course.id)
    ElMessage.success('删除成功')
    fetchCourseList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除课程失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 计算周期
    const period = (courseForm.weekEnd || 0) - (courseForm.weekStart || 0) + 1

    submitLoading.value = true
    try {
      const submitData = {
        ...courseForm,
        period
      }

      if (isEdit.value) {
        // 编辑课程
        await updateTeacherCourse(currentCourse.value.id, submitData)
        ElMessage.success('修改成功')
      } else {
        // 申请新课程
        await applyCourse(submitData)
        ElMessage.success('申请成功，等待审核')
      }

      showFormDialog.value = false
      fetchCourseList()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error(isEdit.value ? '修改失败' : '申请失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(courseForm, {
    name: '',
    classNum: '',
    category: '无',
    type: '',
    point: 0,
    capacity: 0,
    classroom: '',
    college: '软件学院',
    term: '',
    weekStart: 1,
    weekEnd: 16,
    examination: 1,
    regularRatio: 0.4,
    finalRatio: 0.6,
    intro: ''
  })
  formRef.value?.clearValidate()
}

onMounted(async () => {
  loading.value = true
  await fetchCurrentTerm()
  await fetchTermList()
  await fetchClassroomList()
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
