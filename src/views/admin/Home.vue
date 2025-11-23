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
            <el-icon class="stat-icon" color="#409eff"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studentCount }}</div>
              <div class="stat-label">学生总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67c23a"><UserFilled /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.teacherCount }}</div>
              <div class="stat-label">教师总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#e6a23c"><Reading /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.courseCount }}</div>
              <div class="stat-label">课程总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#f56c6c"><School /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.sectionCount }}</div>
              <div class="stat-label">班级总数</div>
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
              <span>待审批课程</span>
              <el-button type="text" @click="$router.push('/admin/course-management')">
                查看全部
              </el-button>
            </div>
          </template>

          <div v-if="pendingCourses.length > 0" class="course-list">
            <div
              v-for="course in pendingCourses"
              :key="course.id"
              class="course-item"
            >
              <div class="course-info">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-detail">
                  {{ course.teacherName }} | {{ course.college }}
                </div>
              </div>
              <div class="course-actions">
                <el-button type="primary" size="small" @click="showApproveDialog(course)">
                  通过
                </el-button>
                <el-button type="danger" size="small" @click="rejectCourse(course.id)">
                  拒绝
                </el-button>
              </div>
            </div>
          </div>

          <el-empty v-else description="暂无待审批课程" />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
              <el-button type="text" @click="showNoticeDialog = true">
                发布公告
              </el-button>
            </div>
          </template>

          <div v-if="notices.length > 0" class="notice-list">
            <div
              v-for="notice in notices"
              :key="notice.id"
              class="notice-item"
              @click="showNoticeDetail(notice)"
            >
              <div class="notice-header">
                <div class="notice-title">
                  <el-tag v-if="notice.isTop === 1" type="danger" size="small" style="margin-right: 8px;">置顶</el-tag>
                  {{ notice.title }}
                </div>
              </div>
              <div class="notice-footer">
                <span class="notice-publisher">发布者: {{ notice.creatorName }}</span>
                <span class="notice-time">{{ formatDate(notice.publishTime) }}</span>
              </div>
            </div>
          </div>

          <el-empty v-else description="暂无公告" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 公告详情对话框 -->
    <el-dialog v-model="showNoticeDetailDialog" title="公告详情" width="600px">
      <div v-if="currentNotice" class="notice-detail">
        <div class="detail-header">
          <h3 class="detail-title">
            <el-tag v-if="currentNotice.isTop === 1" type="danger" size="small" style="margin-right: 8px;">置顶</el-tag>
            {{ currentNotice.title }}
          </h3>
          <div class="detail-meta">
            <span>发布者: {{ currentNotice.creatorName }}</span>
            <span>发布时间: {{ formatDate(currentNotice.publishTime) }}</span>
          </div>
        </div>
        <el-divider />
        <div class="detail-content">
          {{ currentNotice.content }}
        </div>
      </div>
      <template #footer>
        <el-button @click="showNoticeDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 发布公告对话框 -->
    <el-dialog v-model="showNoticeDialog" title="发布公告" width="600px">
      <el-form :model="noticeForm" label-width="80px">
        <el-form-item label="公告标题" required>
          <el-input v-model="noticeForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容" required>
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="可见范围">
          <el-select v-model="noticeForm.visibleScope" placeholder="请选择可见范围">
            <el-option label="所有人" :value="0" />
            <el-option label="学生" :value="1" />
            <el-option label="教师" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="noticeForm.isTop" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNoticeDialog = false">取消</el-button>
        <el-button type="primary" @click="publishNotice" :loading="publishLoading">
          发布
        </el-button>
      </template>
    </el-dialog>

    <!-- 课程审批对话框 -->
    <el-dialog v-model="showApprovalDialog" title="课程审批" width="600px">
      <div v-if="currentCourse">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程名称">{{ currentCourse.name }}</el-descriptions-item>
          <el-descriptions-item label="授课教师">{{ currentCourse.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="学院">{{ currentCourse.college }}</el-descriptions-item>
          <el-descriptions-item label="学分">{{ currentCourse.credit }}</el-descriptions-item>
          <el-descriptions-item label="课程类型">{{ currentCourse.type }}</el-descriptions-item>
          <el-descriptions-item label="上课时间">{{ currentCourse.schedule }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px;">
          <el-form :model="approvalForm" label-width="100px">
            <el-form-item label="选择班级" required>
              <el-select
                v-model="approvalForm.selectedClasses"
                multiple
                placeholder="请选择要绑定的班级"
                style="width: 100%"
                @focus="loadClassList"
              >
                <el-option
                  v-for="classItem in classList"
                  :key="classItem.value"
                  :label="classItem.label"
                  :value="classItem.value"
                />
              </el-select>
              <div style="margin-top: 8px; color: #909399; font-size: 12px;">
                可以选择多个班级，课程将与所选班级绑定
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="showApprovalDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmApproval" :loading="approvalLoading">
          确认通过
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, UserFilled, Reading, School } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getTeacherStudentNum } from '@/api/admin'
import { getPendingCourses, approveCourse as approveCourseApi } from '@/api/course'
import { getAdminNoticeList, publishNotice as publishNoticeApi } from '@/api/notice'
import { getSectionListAll } from '@/api/section'
import { formatDate } from '@/utils/date'

const userStore = useUserStore()

const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}))

const stats = ref({
  studentCount: 0,
  teacherCount: 0,
  courseCount: 0,
  sectionCount: 0
})

const pendingCourses = ref<any[]>([])
const notices = ref<any[]>([])
const showNoticeDialog = ref(false)
const showNoticeDetailDialog = ref(false)
const currentNotice = ref<any>(null)
const publishLoading = ref(false)
const showApprovalDialog = ref(false)
const approvalLoading = ref(false)
const currentCourse = ref<any>(null)
const classList = ref<Array<{label: string, value: string}>>([])

const approvalForm = ref({
  selectedClasses: [] as string[]
})

const noticeForm = ref({
  title: '',
  content: '',
  visibleScope: 0,
  isTop: false
})

// 获取统计数据
const fetchStats = async () => {
  try {
    // 获取教师数量
    const teacherResponse = await getTeacherStudentNum({ permission: 1 })
    if (teacherResponse.code === 200) {
      stats.value.teacherCount = teacherResponse.data || 0
    }

    // 获取学生数量
    const studentResponse = await getTeacherStudentNum({ permission: 2 })
    if (studentResponse.code === 200) {
      stats.value.studentCount = studentResponse.data || 0
    }

    // 这里可以添加其他统计数据的获取
    // 由于API限制，暂时使用模拟数据
    stats.value.courseCount = 156
    stats.value.sectionCount = 48
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取待审批课程
const fetchPendingCourses = async () => {
  try {
    const response = await getPendingCourses()
    if (response.code === 200) {
      pendingCourses.value = response.data.slice(0, 5) // 只显示前5个
    }
  } catch (error) {
    console.error('获取待审批课程失败:', error)
  }
}

// 获取公告列表
const fetchNotices = async () => {
  try {
    const response = await getAdminNoticeList(1)
    if (response.code === 200 && response.data) {
      // 置顶的排在前面
      const sortedData = [...response.data].sort((a, b) => (b.isTop || 0) - (a.isTop || 0))
      notices.value = sortedData.slice(0, 5) // 只显示前5个
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
  }
}

// 显示审批对话框
const showApproveDialog = (course: any) => {
  currentCourse.value = course
  approvalForm.value.selectedClasses = []
  showApprovalDialog.value = true
}

// 加载班级列表
const loadClassList = async () => {
  try {
    const response = await getSectionListAll({ page: 1, size: 500 })
    if (response.code === 200 && response.data) {
      const sections = response.data.section || []
      classList.value = sections.map((section: any) => ({
        label: `${section.grade}级${section.number}班 (${section.major})`,
        value: section.id.toString()
      }))
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
  }
}

// 确认审批
const confirmApproval = async () => {
  if (approvalForm.value.selectedClasses.length === 0) {
    ElMessage.warning('请选择至少一个班级')
    return
  }

  approvalLoading.value = true
  try {
    const sectionIds = approvalForm.value.selectedClasses.map(id => Number(id))
    console.log(sectionIds)
    await approveCourseApi(
      Number(currentCourse.value.id),
      1,
      currentCourse.value.classNum || '',  // classNum
      undefined,  // reason
      sectionIds  // sectionId
    )

    ElMessage.success('课程审批通过')
    showApprovalDialog.value = false
    fetchPendingCourses() // 刷新列表
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批失败')
  } finally {
    approvalLoading.value = false
  }
}

// 拒绝课程
const rejectCourse = async (courseId: string) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝课程', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea'
    })

    if (reason) {
      await approveCourseApi(
        Number(courseId),
        2,
        undefined,  // classNum
        reason      // reason
      )
      ElMessage.success('课程已拒绝')
      fetchPendingCourses() // 刷新列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 发布公告
const publishNotice = async () => {
  if (!noticeForm.value.title || !noticeForm.value.content) {
    ElMessage.warning('请填写完整的公告信息')
    return
  }

  publishLoading.value = true
  try {
    await publishNoticeApi({
      title: noticeForm.value.title,
      content: noticeForm.value.content,
      visibleScope: noticeForm.value.visibleScope,
      isTop: noticeForm.value.isTop ? 1 : 0,
      publishTime: new Date().toISOString()
    })

    ElMessage.success('公告发布成功')
    showNoticeDialog.value = false

    // 重置表单
    noticeForm.value = {
      title: '',
      content: '',
      visibleScope: 0,
      isTop: false
    }

    fetchNotices() // 刷新公告列表
  } catch (error) {
    ElMessage.error('发布公告失败')
  } finally {
    publishLoading.value = false
  }
}

// 显示公告详情
const showNoticeDetail = (notice: any) => {
  currentNotice.value = notice
  showNoticeDetailDialog.value = true
}

onMounted(() => {
  fetchStats()
  fetchPendingCourses()
  fetchNotices()
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.course-list {
  .course-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
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

    .course-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.notice-list {
  .notice-item {
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

    .notice-header {
      margin-bottom: 8px;

      .notice-title {
        font-size: 14px;
        color: #303133;
        display: flex;
        align-items: center;
      }
    }

    .notice-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .notice-publisher {
        font-size: 12px;
        color: #606266;
      }

      .notice-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.notice-detail {
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

