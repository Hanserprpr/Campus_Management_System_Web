<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入课程名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="课程类别">
          <el-select
            v-model="searchForm.category"
            placeholder="请选择课程类别"
            clearable
            @change="handleSearch"
          >
            <el-option label="必修课" value="必修" />
            <el-option label="选修课" value="选修" />
            <el-option label="公共课" value="公共" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="content-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="可选课程" name="unselected">
          <el-table
            v-loading="loading"
            :data="unselectedCourses"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="name" label="课程名称" min-width="150" />
            <el-table-column prop="teacherName" label="授课教师" width="120" />
            <el-table-column prop="category" label="课程类别" width="100" />
            <el-table-column prop="point" label="学分" width="80" />
            <el-table-column prop="classroom" label="教室" width="120" />
            <el-table-column label="上课时间" width="200">
              <template #default="{ row }">
                {{ formatCourseTime(row) }}
              </template>
            </el-table-column>
            <el-table-column label="容量" width="100">
              <template #default="{ row }">
                {{ row.selectedCount || 0 }} / {{ row.capacity }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="row.selectedCount >= row.capacity"
                  @click="handleSelectCourse(row)"
                >
                  {{ row.selectedCount >= row.capacity ? '已满' : '选课' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination">
            <el-pagination
              v-model:current-page="unselectedPage.page"
              v-model:page-size="unselectedPage.size"
              :total="unselectedPage.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadUnselectedCourses"
              @current-change="loadUnselectedCourses"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="已选课程" name="selected">
          <el-table
            v-loading="loading"
            :data="selectedCourses"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="name" label="课程名称" min-width="150" />
            <el-table-column prop="teacherName" label="授课教师" width="120" />
            <el-table-column prop="category" label="课程类别" width="100" />
            <el-table-column prop="point" label="学分" width="80" />
            <el-table-column prop="classroom" label="教室" width="120" />
            <el-table-column label="上课时间" width="200">
              <template #default="{ row }">
                {{ formatCourseTime(row) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDropCourse(row)"
                >
                  退课
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination">
            <el-pagination
              v-model:current-page="selectedPage.page"
              v-model:page-size="selectedPage.size"
              :total="selectedPage.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadSelectedCourses"
              @current-change="loadSelectedCourses"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUnselectedCourses, getSelectedCourses, selectCourse, dropCourse } from '@/api/course'
import type { Course } from '@/types'

const activeTab = ref('unselected')
const loading = ref(false)

const searchForm = reactive({
  keyword: '',
  category: ''
})

const unselectedCourses = ref<Course[]>([])
const selectedCourses = ref<Course[]>([])

const unselectedPage = reactive({
  page: 1,
  size: 10,
  total: 0
})

const selectedPage = reactive({
  page: 1,
  size: 10,
  total: 0
})

const formatCourseTime = (course: Course) => {
  return `第${course.weekStart}-${course.weekEnd}周 ${course.time}`
}

const loadUnselectedCourses = async () => {
  loading.value = true
  try {
    const response = await getUnselectedCourses({
      page: unselectedPage.page,
      size: unselectedPage.size,
      ...searchForm
    })
    
    if (response.code === 200 && response.data) {
      unselectedCourses.value = response.data.list || []
      unselectedPage.total = response.data.total || 0
    }
  } catch (error) {
    console.error('获取可选课程失败:', error)
  } finally {
    loading.value = false
  }
}

const loadSelectedCourses = async () => {
  loading.value = true
  try {
    const response = await getSelectedCourses({
      page: selectedPage.page,
      size: selectedPage.size
    })
    
    if (response.code === 200 && response.data) {
      selectedCourses.value = response.data.list || []
      selectedPage.total = response.data.total || 0
    }
  } catch (error) {
    console.error('获取已选课程失败:', error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: string) => {
  if (tab === 'unselected') {
    loadUnselectedCourses()
  } else {
    loadSelectedCourses()
  }
}

const handleSearch = () => {
  unselectedPage.page = 1
  loadUnselectedCourses()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  handleSearch()
}

const handleSelectCourse = (course: Course) => {
  ElMessageBox.confirm(
    `确定要选择课程《${course.name}》吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      const response = await selectCourse(course.id)
      if (response.code === 200) {
        ElMessage.success('选课成功')
        loadUnselectedCourses()
      }
    } catch (error: any) {
      ElMessage.error(error.message || '选课失败')
    }
  })
}

const handleDropCourse = (course: Course) => {
  ElMessageBox.confirm(
    `确定要退选课程《${course.name}》吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await dropCourse(course.id)
      if (response.code === 200) {
        ElMessage.success('退课成功')
        loadSelectedCourses()
      }
    } catch (error: any) {
      ElMessage.error(error.message || '退课失败')
    }
  })
}

onMounted(() => {
  loadUnselectedCourses()
})
</script>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.content-card {
  :deep(.el-card__body) {
    padding: 0;
  }
  
  :deep(.el-tabs__header) {
    padding: 0 20px;
    margin: 0;
  }
  
  :deep(.el-tabs__content) {
    padding: 20px;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>

