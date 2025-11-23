<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-row align="middle">
            <span>我的课表</span>
            <el-select
              class="select-list"
              v-model="selectedTerm"
              @change="getCourses"
              placeholder="选择学期"
            >
              <el-option
                v-for="item in terms"
                :key="item.term"
                :label="item.term"
                :value="item.term"
              />
            </el-select>
            <el-select
              class="select-list"
              v-model="selectedWeek"
              @change="getCourses"
              placeholder="选择周次"
            >
              <el-option
                v-for="item in weeks"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
            <el-button @click="getCourses" type="primary">刷新</el-button>
          </el-row>
        </div>
      </template>

      <div class="schedule-container">
        <el-row class="schedule-row day-info">
          <el-col :span="1" class="schedule-col time-header"> </el-col>
          <el-col :span="3" class="schedule-col"> 周一 </el-col>
          <el-col :span="3" class="schedule-col"> 周二 </el-col>
          <el-col :span="3" class="schedule-col"> 周三 </el-col>
          <el-col :span="3" class="schedule-col"> 周四 </el-col>
          <el-col :span="3" class="schedule-col"> 周五 </el-col>
          <el-col :span="3" class="schedule-col"> 周六 </el-col>
          <el-col :span="3" class="schedule-col"> 周日 </el-col>
        </el-row>
        <el-row class="schedule-row" v-for="(order, i) in courseTableData" :key="i">
          <el-col :span="1" class="schedule-col">
            <div class="time-info">
              <div class="time-slot">{{ i + 1 }}</div>
            </div>
          </el-col>
          <el-col class="schedule-col" :span="3" v-for="(day, j) in order" :key="j">
            <div
              class="course-card"
              v-if="day"
              :style="{ backgroundColor: getCourseColor(day.name) }"
              @click="showCourseDetail(day)"
            >
              <div class="course-name">{{ day.name }}</div>
              <div class="course-place">@{{ day.classroom }}</div>
            </div>
            <div class="course-card empty" v-else></div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 课程详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="课程详情" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程名称">{{ selectedCourse?.name }}</el-descriptions-item>
        <el-descriptions-item label="授课教师">{{
          selectedCourse?.teacherName
        }}</el-descriptions-item>
        <el-descriptions-item label="上课地点">{{
          selectedCourse?.classroom
        }}</el-descriptions-item>
        <el-descriptions-item label="学分">{{ selectedCourse?.point }}</el-descriptions-item>
        <el-descriptions-item label="周次"
          >{{ selectedCourse?.weekStart }} - {{ selectedCourse?.weekEnd }}</el-descriptions-item
        >
        <el-descriptions-item label="课程类型">{{ selectedCourse?.type }}</el-descriptions-item>
        <el-descriptions-item label="开课学院">{{ selectedCourse?.college }}</el-descriptions-item>
        <el-descriptions-item label="已选/容量"
          >{{ selectedCourse?.selectedCount }} / {{ selectedCourse?.capacity }}</el-descriptions-item
        >
        <el-descriptions-item label="课程简介" :span="2">{{
          selectedCourse?.intro || '暂无'
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getTermList } from '@/api/common'
import { getCourseSchedule } from '@/api/course'
import { useAppStore } from '@/stores/app'
import type { Course, Term } from '@/types'
import { ref, onMounted, reactive } from 'vue'

//  time = (day-1)*5 + classOrder
const appStore = useAppStore()

let courses: Course[] = []

//初始化数组，确定大小5*7
const courseTableData = reactive<(Course | null)[][]>(
  Array.from({ length: 5 }, () => Array.from({ length: 7 }, () => null)) as (Course | null)[][]
)
const terms = ref<Term[]>()
const weeks: {
  id: number
  label: string
}[] = []
for (let i: number = 1; i <= 20; ++i) weeks.push({ id: i, label: `第${i}周` })

const selectedTerm = ref<string>('')
const selectedWeek = ref<number>(1)

const dialogVisible = ref(false)
const selectedCourse = ref<Course | null>(null)

const showCourseDetail = (course: Course) => {
  selectedCourse.value = course
  dialogVisible.value = true
}

// 课程颜色
const courseColors = [
  '#FFDAB9',
  '#E6E6FA',
  '#B0E0E6',
  '#98FB98',
  '#F0E68C',
  '#DDA0DD',
  '#ADD8E6',
  '#F08080',
  '#20B2AA',
  '#87CEFA'
]
const courseColorMap = new Map<string, string>()
let colorIndex = 0

const getCourseColor = (courseName: string) => {
  if (!courseColorMap.has(courseName)) {
    courseColorMap.set(courseName, courseColors[colorIndex % courseColors.length])
    colorIndex++
  }
  return courseColorMap.get(courseName)
}

const getCourses = async () => {
  const res = await getCourseSchedule(selectedWeek.value, { term: selectedTerm.value })
  courses = res.data
  makeCoursesTableData()
}
const getTerms = async () => {
  const res = await getTermList()
  terms.value = res.data
}
const makeCoursesTableData = () => {
  // 重置课表和颜色映射
  for (let i = 0; i < 5; ++i) {
    for (let j = 0; j < 7; ++j) {
      courseTableData[i][j] = null
    }
  }
  courseColorMap.clear()
  colorIndex = 0

  courses.forEach((value: Course) => {
    const time = Number.parseInt(value.time as string)
    // 后端返回 time 范围：0-24
    // 周一: 0-4, 周二: 5-9, 周三: 10-14, 周四: 15-19, 周五: 20-24
    const day: number = Math.floor(time / 5)  // 0-4 对应周一到周五
    const classOrder: number = time % 5  // 0-4 对应第1-5节

    if (day >= 0 && day < 7 && classOrder >= 0 && classOrder < 5) {
      courseTableData[classOrder][day] = value
    }
  })
}
onMounted(async () => {
  selectedTerm.value = await appStore.fetchCurrentTerm()
  getTerms()
  getCourses()
})
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  padding: 16px;
  background-color: #f5f7fa;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.schedule-container {
  width: 100%;
  margin-top: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.schedule-row {
  display: flex;
  &:not(:last-child) {
    border-bottom: 1px solid #ebeef5;
  }
}

.schedule-col {
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  &:not(:last-child) {
    border-right: 1px solid #ebeef5;
  }
}

.day-info .schedule-col {
  height: 40px;
  font-weight: bold;
  background-color: #fafafa;
}

.time-header {
  background-color: #fafafa;
}

.select-list {
  width: 160px;
  margin-left: 20px;
}

.course-card {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  margin: 3px 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  word-break: break-all;
  border-radius: 8px;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  &.empty {
    cursor: default;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
}

.course-name {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}

.course-place {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.time-info {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  font-size: 12px;
  color: #909399;
}

.time-slot {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}
</style>

