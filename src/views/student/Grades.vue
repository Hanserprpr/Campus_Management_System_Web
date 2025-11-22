<template>
  <div class="page-container">
    <el-card style="margin-bottom: 15px;">
      <div>
        <el-select 
          class="select-list"
          v-model="selectedTerm"
          :options="terms"
          @change="fetchGrades"
          :props="{
            value : 'term',
            label : 'term'
          }"
        />
        <el-button @click="fetchGrades">
          刷新
        </el-button>
      </div>
    </el-card>
    <!-- 成绩统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409eff"><TrophyBase /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gradeStats.averCredits.toFixed(2) || '0.00' }}</div>
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
              <div class="stat-value">{{ gradeStats.totalPoint || 0 }}</div>
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
              <div class="stat-value">{{ gradeStats.totalClass || 0 }}</div>
              <div class="stat-label">已修课程</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#f56c6c"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gradeStats.pointRank || 0 }}</div>
              <div class="stat-label">排名</div>
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
          <el-table-column prop="className" label="课程名称" min-width="150" />
          <el-table-column prop="classNum" label="课程号" width="120" />
          <el-table-column prop="teacher" label="授课教师" width="120" />
          <el-table-column prop="point" label="学分" width="80" />
          <el-table-column prop="type" label="课程类型" width="100" />
          <el-table-column label="平时成绩" width="100">
            <template #default="{ row }">
              {{ row.regular || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="期末成绩" width="100">
            <template #default="{ row }">
              {{ row.finalScore || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="总成绩" width="100">
            <template #default="{ row }">
              <span :class="getScoreClass(row.grade)">
                {{ row.grade || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="rank" label="排名" width="120" />
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
import { TrophyBase, Document, Reading, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getGradeList, getGradeMessage, Grade, GradeStats } from '@/api/grade'
import { exportToExcel } from '@/utils/export'
import { Term } from '@/types'
import { getTermList } from '@/api/common'

const loading = ref(false)
const selectedTerm = ref('2024-2025-1')
const terms = ref<Term[]>()

const gradeStats = reactive<GradeStats>({
  totalPoint: 0,
  totalClass: 0,
  pointRank: 0,
  averCredits: 0
})

const gradeList = ref<Grade[]>([])



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
    const response = await getGradeMessage(selectedTerm.value);
    if (response.code === 200 && response.data) {
      // 更新统计数据
      Object.assign(gradeStats, response.data)
    }
    const res = await getGradeList( selectedTerm.value )
    if(res.code === 200){
      gradeList.value = res.data;
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
    '课程名称': item.className,
    '课程代码': item.classNum,
    '授课教师': item.teacher,
    '学分': item.point,
    '课程类型': item.type,
    '平时成绩': item.regular || '-',
    '期末成绩': item.finalScore || '-',
    '总成绩': item.grade || '-',
  }))

  exportToExcel(exportData, '成绩单')
  ElMessage.success('导出成功')
}

const getTerms = async()=>{
  const res = await getTermList()
  terms.value = res.data
}

onMounted(() => {
  fetchGrades()
  getTerms();
  
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

.select-list{
  width: 160px;
  margin-left: 10px;
  margin-right: 10px;
}
</style>

