<template>
  <div class="page-container">
    <div class="welcome-section">
      <h2>欢迎，{{ userStore.username }}！</h2>
      <p class="date">{{ currentDate }}</p>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409eff"><Reading /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.courseCount }}</div>
              <div class="stat-label">已选课程</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67c23a"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.creditCount }}</div>
              <div class="stat-label">已修学分</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#e6a23c"><TrophyBase /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.avgScore }}</div>
              <div class="stat-label">平均成绩</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#f56c6c"><Calendar /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayCourses }}</div>
              <div class="stat-label">今日课程</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>今日课程</span>
            </div>
          </template>
          
          <div v-if="todayCourses.length > 0" class="course-list">
            <div
              v-for="course in todayCourses"
              :key="course.id"
              class="course-item"
            >
              <div class="course-time">{{ course.time }}</div>
              <div class="course-info">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-detail">
                  {{ course.classroom }} | {{ course.teacherName }}
                </div>
              </div>
            </div>
          </div>
          
          <el-empty v-else description="今天没有课程" />
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>最新公告</span>
            </div>
          </template>
          
          <div v-if="announcements.length > 0" class="announcement-list">
            <div
              v-for="announcement in announcements"
              :key="announcement.id"
              class="announcement-item"
            >
              <div class="announcement-title">{{ announcement.title }}</div>
              <div class="announcement-time">{{ formatDate(announcement.createTime) }}</div>
            </div>
          </div>
          
          <el-empty v-else description="暂无公告" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Reading, Document, TrophyBase, Calendar } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { formatDate, getCurrentDate, getDayOfWeekName } from '@/utils/date'
import { getStudentStats } from '@/api/student'
import { getStudentNoticeList } from '@/api/notice'
import { getCurrentTerm, getCurrentWeek } from '@/api/common'
import type { Course, Announcement } from '@/types'

const userStore = useUserStore()

const currentDate = ref(getCurrentDate() + ' ' + getDayOfWeekName())

const stats = ref({
  courseCount: 0,
  creditCount: 0,
  avgScore: 0,
  todayCourses: 0
})

const todayCourses = ref<Course[]>([])
const announcements = ref<Announcement[]>([])

const fetchStats = async () => {
  try {
    const response = await getStudentStats()
    if (response.code === 200 && response.data) {
      stats.value = response.data
    } else {
      // 如果API返回错误，使用模拟数据
      throw new Error('API返回错误')
    }
  } catch (error) {
    console.warn('获取统计数据失败:', error)
    stats.value = {
      courseCount: 0,
      creditCount: 0,
      avgScore: 0,
      todayCourses: 0
    }
  }
}

const fetchTodayCourses = async () => {
  try {
    todayCourses.value = []

    // 更新统计数据中的今日课程数量
    stats.value.todayCourses = todayCourses.value.length
  } catch (error) {
    console.error('获取今日课程失败:', error)
    todayCourses.value = []
    stats.value.todayCourses = 0
  }
}

const fetchAnnouncements = async () => {
  try {
    const response = await getStudentNoticeList()
    if (response.code === 200 && response.data) {
      // 只取前5条公告
      announcements.value = Array.isArray(response.data)
        ? response.data.slice(0, 5).map(notice => ({
            id: notice.id,
            title: notice.title,
            content: notice.content,
            createTime: notice.createdAt, // 使用 createdAt 映射到 createTime
            updateTime: notice.updatedAt, // 使用 updatedAt 映射到 updateTime
            publisher: notice.creatorName // 使用 creatorName 映射到 publisher
          }))
        : []
    } else {
      throw new Error('API返回错误')
    }
  } catch (error) {
    console.warn('获取公告失败:', error)
    announcements.value = []
  }
}

onMounted(() => {
  fetchStats()
  fetchTodayCourses()
  fetchAnnouncements()
})
</script>

<style lang="scss" scoped>
.welcome-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  
  h2 {
    font-size: 24px;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .date {
    color: #909399;
    font-size: 14px;
  }
}

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

.content-row {
  .content-card {
    height: 400px;
    
    :deep(.el-card__body) {
      height: calc(100% - 56px);
      overflow-y: auto;
    }
  }
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.course-list {
  .course-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .course-time {
      flex-shrink: 0;
      width: 80px;
      font-size: 14px;
      color: #409eff;
      font-weight: bold;
    }
    
    .course-info {
      flex: 1;
      
      .course-name {
        font-size: 16px;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .course-detail {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.announcement-list {
  .announcement-item {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .announcement-title {
      font-size: 14px;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .announcement-time {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>

