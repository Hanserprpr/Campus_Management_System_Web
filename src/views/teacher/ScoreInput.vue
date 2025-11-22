<template>
  <div class="score-input-container">
    <!-- 顶部筛选区 -->
    <el-card class="filter-card">
      <el-form :inline="true">
        <el-form-item label="学期">
          <el-select
            v-model="searchForm.term"
            placeholder="请选择学期"
            style="width: 200px"
            @change="fetchCourseList"
          >
            <el-option
              v-for="term in termList"
              :key="term.term"
              :label="term.term"
              :value="term.term"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select
            v-model="selectedCourseId"
            placeholder="请选择课程"
            style="width: 300px"
            @change="handleCourseChange"
            clearable
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="`${course.name} (${course.classNum})`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="handleBatchSave" :disabled="!hasChanges">
            保存成绩
          </el-button>
          <el-button type="warning" @click="handleReleaseGrade" :disabled="!selectedCourseId">
            发布成绩
          </el-button>
          <el-button type="primary" @click="fetchGradeList" :disabled="!selectedCourseId">
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 成绩录入表格 -->
    <el-card class="table-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>成绩录入</span>
          <span v-if="currentCourse" class="course-info">
            {{ currentCourse.name }} - {{ currentCourse.classNum }}
            <el-tag size="small" style="margin-left: 8px;">
              平时成绩占比: {{ (currentCourse.regularRatio || 0.4) * 100 }}%
            </el-tag>
            <el-tag size="small" type="success" style="margin-left: 8px;">
              期末成绩占比: {{ (currentCourse.finalRatio || 0.6) * 100 }}%
            </el-tag>
          </span>
        </div>
      </template>

      <el-table
        :data="gradeList"
        border
        stripe
        style="width: 100%"
        :empty-text="selectedCourseId ? '暂无学生数据' : '请先选择课程'"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="username" label="学生姓名" width="120" align="center" />
        <el-table-column prop="studentId" label="学号" width="120" align="center" />
        <el-table-column label="平时成绩" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.regular"
              :min="0"
              :max="100"
              :precision="0"
              size="small"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="期末成绩" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.finalScore"
              :min="0"
              :max="100"
              :precision="0"
              size="small"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="总评成绩" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getScoreType(row.grade)" size="large">
              {{ row.grade !== null && row.grade !== undefined ? row.grade : '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="80" align="center" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleSaveSingle(row)"
              :disabled="!row.changed"
            >
              保存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTermList, getCurrentTerm } from '@/api/common'
import { searchTeacherCourses } from '@/api/course'
import { getCourseGradeList, setGrade, releaseGrade, type Grade } from '@/api/grade'
import type { Term, Course } from '@/types'

const loading = ref(false)
const termList = ref<Term[]>([])
const courseList = ref<Course[]>([])
const gradeList = ref<Grade[]>([])
const selectedCourseId = ref<number | null>(null)
const currentCourse = ref<Course | null>(null)

const searchForm = reactive({
  term: ''
})

// 是否有未保存的修改
const hasChanges = computed(() => {
  return gradeList.value.some(item => item.changed)
})

// 获取成绩类型（用于显示颜色）
const getScoreType = (score: number | null | undefined) => {
  if (score === null || score === undefined) return 'info'
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  if (score >= 60) return ''
  return 'danger'
}

// 获取学期列表
const fetchTermList = async () => {
  try {
    const response = await getTermList()
    if (response.code === 200 && response.data) {
      termList.value = Array.isArray(response.data) ? response.data : []

      // 获取当前学期
      const currentTermRes = await getCurrentTerm()
      if (currentTermRes.code === 200 && currentTermRes.data) {
        searchForm.term = typeof currentTermRes.data === 'string'
          ? currentTermRes.data
          : currentTermRes.data.term || ''

        if (searchForm.term) {
          await fetchCourseList()
        }
      }
    }
  } catch (error) {
    console.error('获取学期列表失败:', error)
    ElMessage.error('获取学期列表失败')
  }
}

// 获取课程列表
const fetchCourseList = async () => {
  if (!searchForm.term) return

  try {
    loading.value = true
    const response = await searchTeacherCourses({
      term: searchForm.term,
      pageNum: 1,
      pageSize: 100
    })

    if (response.code === 200 && response.data) {
      // 只显示已审核通过的课程
      const allCourses = Array.isArray(response.data) ? response.data : response.data.list || []
      courseList.value = allCourses.filter((course: Course) => course.status === '已通过')
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

// 课程变更
const handleCourseChange = () => {
  if (selectedCourseId.value) {
    currentCourse.value = courseList.value.find(c => c.id === selectedCourseId.value) || null
    // 自动加载成绩列表
    fetchGradeList()
  } else {
    currentCourse.value = null
    gradeList.value = []
  }
}

// 获取成绩列表
const fetchGradeList = async () => {
  if (!selectedCourseId.value) {
    ElMessage.warning('请先选择课程')
    return
  }

  try {
    loading.value = true
    const response = await getCourseGradeList(selectedCourseId.value)

    if (response.code === 200 && response.data) {
      gradeList.value = (Array.isArray(response.data) ? response.data : []).map((item: any) => ({
        ...item,
        changed: false,
        originalRegular: item.regular,
        originalFinalScore: item.finalScore
      }))
    } else {
      ElMessage.error(response.msg || '获取成绩列表失败')
    }
  } catch (error) {
    console.error('获取成绩列表失败:', error)
    ElMessage.error('获取成绩列表失败')
  } finally {
    loading.value = false
  }
}

// 成绩变更
const handleScoreChange = (row: any) => {
  // 计算总评成绩（后端返回的是小数形式，如0.4表示40%）
  const regularRatio = currentCourse.value?.regularRatio || 0.4
  const finalRatio = currentCourse.value?.finalRatio || 0.6

  if (row.regular !== null && row.regular !== undefined &&
      row.finalScore !== null && row.finalScore !== undefined) {
    row.grade = Math.round(row.regular * regularRatio + row.finalScore * finalRatio)
  }

  // 标记为已修改
  row.changed = true
}

// 保存单个学生成绩
const handleSaveSingle = async (row: any) => {
  if (!selectedCourseId.value) return

  try {
    loading.value = true
    await setGrade({
      id: row.id,
      studentId: row.studentId,
      courseId: selectedCourseId.value,
      regular: row.regular,
      finalScore: row.finalScore,
      grade: row.grade,
      term: searchForm.term
    })

    ElMessage.success('保存成功')
    row.changed = false
    row.originalRegular = row.regular
    row.originalFinalScore = row.finalScore
  } catch (error) {
    console.error('保存成绩失败:', error)
    ElMessage.error('保存成绩失败')
  } finally {
    loading.value = false
  }
}

// 批量保存成绩
const handleBatchSave = async () => {
  const changedItems = gradeList.value.filter(item => item.changed)

  if (changedItems.length === 0) {
    ElMessage.warning('没有需要保存的成绩')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认保存 ${changedItems.length} 条成绩记录？`,
      '批量保存',
      { type: 'warning' }
    )

    loading.value = true
    let successCount = 0
    let failCount = 0

    for (const item of changedItems) {
      try {
        await setGrade({
          id: item.id,
          studentId: item.studentId,
          courseId: selectedCourseId.value!,
          regular: item.regular,
          finalScore: item.finalScore,
          grade: item.grade,
          term: searchForm.term
        })

        item.changed = false
        item.originalRegular = item.regular
        item.originalFinalScore = item.finalScore
        successCount++
      } catch (error) {
        console.error('保存失败:', item, error)
        failCount++
      }
    }

    if (failCount === 0) {
      ElMessage.success(`成功保存 ${successCount} 条成绩`)
    } else {
      ElMessage.warning(`保存完成：成功 ${successCount} 条，失败 ${failCount} 条`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量保存失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 发布成绩
const handleReleaseGrade = async () => {
  if (!selectedCourseId.value) {
    ElMessage.warning('请先选择课程')
    return
  }

  // 检查是否有未保存的修改
  if (hasChanges.value) {
    ElMessage.warning('请先保存所有修改的成绩')
    return
  }

  try {
    await ElMessageBox.confirm(
      '发布后学生将可以查看成绩，确认发布？',
      '发布成绩',
      { type: 'warning' }
    )

    loading.value = true
    const response = await releaseGrade(selectedCourseId.value)

    if (response.code === 200) {
      ElMessage.success('成绩发布成功')
    } else {
      ElMessage.error(response.msg || '发布失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('发布成绩失败:', error)
      ElMessage.error('发布成绩失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTermList()
})
</script>

<style lang="scss" scoped>
.score-input-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .course-info {
      font-size: 14px;
      color: #606266;
    }
  }
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-table) {
  .el-input-number__decrease,
  .el-input-number__increase {
    background: #f5f7fa;
  }
}
</style>


