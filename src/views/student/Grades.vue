<template>
  <div class="page-container">
    <!-- 成绩统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409eff"><TrophyBase /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gradeStats.gpa || '0.00' }}</div>
              <div class="stat-label">总GPA</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67c23a"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gradeStats.totalCredits || 0 }}</div>
              <div class="stat-label">总学分</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#e6a23c"><Reading /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gradeStats.passedCourses || 0 }}</div>
              <div class="stat-label">通过课程</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#f56c6c"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gradeStats.failedCourses || 0 }}</div>
              <div class="stat-label">未通过课程</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>成绩查询</span>
          <div class="header-actions">
            <el-select v-model="selectedTerm" placeholder="选择学期" @change="fetchGrades">
              <el-option
                v-for="term in terms"
                :key="term"
                :label="term"
                :value="term"
              />
            </el-select>
            <el-button type="primary" @click="handleExport">导出成绩</el-button>
          </div>
        </div>
      </template>

      <div class="grades-container">
        <el-table
          v-loading="loading"
          :data="gradeList"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="courseName" label="课程名称" min-width="150" />
          <el-table-column prop="courseCode" label="课程代码" width="120" />
          <el-table-column prop="teacherName" label="授课教师" width="120" />
          <el-table-column prop="credits" label="学分" width="80" />
          <el-table-column prop="courseType" label="课程类型" width="100" />
          <el-table-column label="平时成绩" width="100">
            <template #default="{ row }">
              {{ row.regularScore || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="期末成绩" width="100">
            <template #default="{ row }">
              {{ row.finalScore || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="总成绩" width="100">
            <template #default="{ row }">
              <span :class="getScoreClass(row.totalScore)">
                {{ row.totalScore || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="绩点" width="80">
            <template #default="{ row }">
              {{ row.gradePoint || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="等级" width="80">
            <template #default="{ row }">
              <el-tag :type="getGradeType(row.grade)">
                {{ row.grade || '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="term" label="学期" width="120" />
        </el-table>

        <div v-if="gradeList.length === 0 && !loading" class="empty-container">
          <el-empty description="暂无成绩数据" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { TrophyBase, Document, Reading, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getGradeMessage } from '@/api/grade'
import { exportToExcel } from '@/utils/export'

const loading = ref(false)
const selectedTerm = ref('')
const terms = ref(['2023-2024-1', '2023-2024-2', '2024-2025-1'])

const gradeStats = reactive({
  gpa: 0,
  totalCredits: 0,
  passedCourses: 0,
  failedCourses: 0
})

const gradeList = ref<any[]>([])

// 获取成绩等级类型
const getGradeType = (grade: string) => {
  switch (grade) {
    case 'A':
    case 'A+':
      return 'success'
    case 'B':
    case 'B+':
      return 'primary'
    case 'C':
    case 'C+':
      return 'warning'
    case 'D':
    case 'F':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取成绩样式类
const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 获取成绩数据
const fetchGrades = async () => {
  loading.value = true
  try {
    const response = await getGradeMessage()
    if (response.code === 200 && response.data) {
      // 更新统计数据
      Object.assign(gradeStats, response.data)

      // 模拟成绩列表数据
      gradeList.value = [
        {
          courseName: '高等数学A',
          courseCode: 'MATH001',
          teacherName: '张教授',
          credits: 4,
          courseType: '必修',
          regularScore: 85,
          finalScore: 88,
          totalScore: 87,
          gradePoint: 3.7,
          grade: 'B+',
          term: '2023-2024-1'
        },
        {
          courseName: '程序设计基础',
          courseCode: 'CS001',
          teacherName: '李教授',
          credits: 3,
          courseType: '必修',
          regularScore: 92,
          finalScore: 95,
          totalScore: 94,
          gradePoint: 4.0,
          grade: 'A',
          term: '2023-2024-1'
        },
        {
          courseName: '大学英语',
          courseCode: 'ENG001',
          teacherName: '王教授',
          credits: 2,
          courseType: '必修',
          regularScore: 78,
          finalScore: 82,
          totalScore: 80,
          gradePoint: 3.0,
          grade: 'B',
          term: '2023-2024-1'
        }
      ]

      // 如果选择了学期，过滤数据
      if (selectedTerm.value) {
        gradeList.value = gradeList.value.filter(item => item.term === selectedTerm.value)
      }
    }
  } catch (error) {
    console.error('获取成绩失败:', error)
    ElMessage.error('获取成绩数据失败')
  } finally {
    loading.value = false
  }
}

// 导出成绩
const handleExport = () => {
  if (gradeList.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const exportData = gradeList.value.map(item => ({
    '课程名称': item.courseName,
    '课程代码': item.courseCode,
    '授课教师': item.teacherName,
    '学分': item.credits,
    '课程类型': item.courseType,
    '平时成绩': item.regularScore || '-',
    '期末成绩': item.finalScore || '-',
    '总成绩': item.totalScore || '-',
    '绩点': item.gradePoint || '-',
    '等级': item.grade || '-',
    '学期': item.term
  }))

  exportToExcel(exportData, '成绩单')
  ElMessage.success('导出成功')
}

onMounted(() => {
  fetchGrades()
})
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      font-size: 48px;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.grades-container {
  min-height: 400px;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

// 成绩颜色样式
:deep(.score-excellent) {
  color: #67c23a;
  font-weight: bold;
}

:deep(.score-good) {
  color: #409eff;
  font-weight: bold;
}

:deep(.score-average) {
  color: #e6a23c;
}

:deep(.score-pass) {
  color: #909399;
}

:deep(.score-fail) {
  color: #f56c6c;
  font-weight: bold;
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
</style>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grades-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

