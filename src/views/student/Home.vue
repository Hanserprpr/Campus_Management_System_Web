<template>
  <div class="student-home">
    <div class="page-container">
      <div class="welcome-section">
        <h2>欢迎，{{ userStore.username }}！</h2>
        <p class="date">{{ currentDate }}</p>
      </div>
      
      <el-col class="content-col">
        <el-col :span="24">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <span>今日课程</span>
                <el-button style="margin-left: 18px;" @click="router.push('/student/schedule')"> 查看课表 </el-button>
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
        
        <el-col :span="24">
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
                @click="showAnnouncementDetail(announcement)"
              >
                <div class="announcement-header">
                  <div class="announcement-title">
                    <el-tag v-if="announcement.isTop === 1" type="danger" size="small" style="margin-right: 8px;">置顶</el-tag>
                    {{ announcement.title }}
                  </div>
                </div>
                <div class="announcement-footer">
                  <span class="announcement-publisher">发布者: {{ announcement.publisher }}</span>
                  <span class="announcement-time">{{ formatDate(announcement.createTime) }}</span>
                </div>
              </div>
            </div>

            <el-empty v-else description="暂无公告" />
          </el-card>
        </el-col>
      </el-col>
    </div>

    <!-- 公告详情对话框 -->
    <el-dialog v-model="showAnnouncementDialog" title="公告详情" width="600px">
      <div v-if="currentAnnouncement" class="announcement-detail">
        <div class="detail-header">
          <h3 class="detail-title">
            <el-tag v-if="currentAnnouncement.isTop === 1" type="danger" size="small" style="margin-right: 8px;">置顶</el-tag>
            {{ currentAnnouncement.title }}
          </h3>
          <div class="detail-meta">
            <span>发布者: {{ currentAnnouncement.publisher }}</span>
            <span>发布时间: {{ formatDate(currentAnnouncement.createTime) }}</span>
          </div>
        </div>
        <el-divider />
        <div class="detail-content">
          {{ currentAnnouncement.content }}
        </div>
      </div>
      <template #footer>
        <el-button @click="showAnnouncementDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { formatDate, getCurrentDate, getDayOfWeekName, getDayOfWeek } from '@/utils/date'
import { getStudentNoticeList } from '@/api/notice'
import { getCourseSchedule } from '@/api/course'
import type { Course, Announcement } from '@/types'
import router from '@/router'

const userStore = useUserStore()
const appStore = useAppStore()

const currentDate = ref(getCurrentDate() + ' ' + getDayOfWeekName())

const stats = ref({
  courseCount: 0,
  creditCount: 0,
  avgScore: 0,
  todayCourses: 0
})

const todayCourses = ref<Course[]>([])
const announcements = ref<Announcement[]>([])
const showAnnouncementDialog = ref(false)
const currentAnnouncement = ref<Announcement | null>(null)

// const fetchStats = async () => {
//   try {
//     const response = await getStudentStats()
//     if (response.code === 200 && response.data) {
//       stats.value = response.data
//     } else {
//       // 如果API返回错误，使用模拟数据
//       throw new Error('API返回错误')
//     }
//   } catch (error) {
//     console.warn('获取统计数据失败:', error)
//     stats.value = {
//       courseCount: 0,
//       creditCount: 0,
//       avgScore: 0,
//       todayCourses: 0
//     }
//   }
// }

// 获取时间段文本
const getTimeSlotText = (classOrder: number): string => {
  const timeSlots: Record<number, string> = {
    1: '08:00-09:50',
    2: '10:10-12:00',
    3: '14:00-15:50',
    4: '16:10-18:00',
    5: '19:00-20:50'
  }
  return timeSlots[classOrder] || ''
}

const fetchTodayCourses = async () => {
  try {
    // 获取当前学期
    const currentTerm = await appStore.fetchCurrentTerm()
    if (!currentTerm) {
      console.warn('无法获取当前学期')
      todayCourses.value = []
      return
    }

    // 获取当前周的课表（这里假设当前是第1周，实际应该获取当前教学周）
    const currentWeek = 1 // TODO: 应该从API获取当前教学周
    const response = await getCourseSchedule(currentWeek, { term: currentTerm })

    if (response.code === 200 && response.data) {
      const allCourses = Array.isArray(response.data) ? response.data : []

      // 获取今天是星期几 (1-5, 1表示周一，只有工作日有课)
      // 测试：往后调1天
      const today = getDayOfWeek() // 0-6, 0表示星期日
      let todayIndex = today === 0 ? 7 : today // 转换为1-7，7表示星期日
      todayIndex = todayIndex + 1 // 往后调1天
      if (todayIndex > 7) todayIndex -= 7 // 如果大于7，减7天（例如周日+1=周一）

      console.log('今天是星期几（原始）:', today)
      console.log('今天是星期几（调整后）:', todayIndex)
      console.log('所有课程:', allCourses)

      // 筛选今日课程
      // time字段范围：0-24，每天5节课（周一到周五）
      // time = 0-4: 周一, 5-9: 周二, 10-14: 周三, 15-19: 周四, 20-24: 周五
      // day = Math.floor(time / 5) + 1
      const todaysCourses = allCourses.filter(course => {
        const time = Number.parseInt(course.time as string)
        const day = Math.floor(time / 5) + 1 // 1-5 对应周一到周五
        console.log(`课程 ${course.name}: time=${time}, day=${day}, 是否匹配=${day === todayIndex}`)
        return day === todayIndex
      })

      console.log('筛选后的今日课程:', todaysCourses)

      // 处理课程数据，添加时间显示
      todayCourses.value = todaysCourses.map(course => {
        const time = Number.parseInt(course.time as string)
        const classOrder = (time % 5) + 1 // 0-4 转换为 1-5

        return {
          ...course,
          time: getTimeSlotText(classOrder),
          period: classOrder
        }
      }).sort((a: any, b: any) => a.period - b.period) // 按时间段排序

      console.log('处理后的今日课程:', todayCourses.value)

      // 更新统计数据中的今日课程数量
      stats.value.todayCourses = todayCourses.value.length
    } else {
      throw new Error('API返回错误')
    }
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
      // 只取前5条公告，置顶的排在前面
      const sortedData = Array.isArray(response.data)
        ? [...response.data].sort((a, b) => (b.isTop || 0) - (a.isTop || 0))
        : []

      announcements.value = sortedData.slice(0, 5).map(notice => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        createTime: notice.createdAt, // 使用 createdAt 映射到 createTime
        updateTime: notice.updatedAt, // 使用 updatedAt 映射到 updateTime
        publisher: notice.creatorName, // 使用 creatorName 映射到 publisher
        isTop: notice.isTop // 添加置顶标识
      }))
    } else {
      throw new Error('API返回错误')
    }
  } catch (error) {
    console.warn('获取公告失败:', error)
    announcements.value = []
  }
}

// 显示公告详情
const showAnnouncementDetail = (announcement: Announcement) => {
  currentAnnouncement.value = announcement
  showAnnouncementDialog.value = true
}

onMounted(() => {
  //fetchStats()
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

.content-col {
  width: 100%;
  .content-card {
    height: 400px;
    margin-bottom: 16px;
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

    .announcement-header {
      margin-bottom: 8px;

      .announcement-title {
        font-size: 14px;
        color: #303133;
        display: flex;
        align-items: center;
      }
    }

    .announcement-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .announcement-publisher {
        font-size: 12px;
        color: #606266;
      }

      .announcement-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.announcement-detail {
  .detail-header {
    .detail-title {
      font-size: 20px;
      color: #303133;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
    }

    .detail-meta {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #909399;
    }
  }

  .detail-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>

