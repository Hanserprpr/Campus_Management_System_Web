<template>
  <div class="term-management">
    <div class="page-header">
      <h2>排课管理</h2>
    </div>

    <div class="content-container">
      <!-- 添加新学期 -->
      <div class="section">
        <div class="section-label">添加新学期:</div>
        <div class="section-content">
          <el-input
            v-model="newTerm"
            placeholder="例如: 2024-2025-1"
            style="width: 300px; margin-right: 16px;"
          />
          <el-button type="danger" @click="handleAddTerm">添加学期</el-button>
        </div>
      </div>

      <!-- 选择学期 -->
      <div class="section">
        <div class="section-label">选择学期:</div>
        <div class="section-content">
          <el-select
            v-model="selectedTerm"
            placeholder="请选择学期"
            style="width: 300px; margin-right: 24px;"
            @change="handleTermChange"
          >
            <el-option
              v-for="term in termList"
              :key="term.term"
              :label="term.term"
              :value="term.term"
            />
          </el-select>
          
          <el-tag v-if="selectedTerm" :type="selectionStatus.type" size="large">
            {{ selectionStatus.text }}
          </el-tag>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="section">
        <div class="action-buttons">
          <el-button 
            type="success" 
            size="large"
            :disabled="!selectedTerm || selectionStatus.open"
            @click="handleStartSelection"
          >
            开始选课
          </el-button>
          <el-button 
            type="warning" 
            size="large"
            :disabled="!selectedTerm || !selectionStatus.open"
            @click="handleEndSelection"
          >
            结束选课
          </el-button>
          <el-button 
            type="danger" 
            size="large"
            :disabled="!selectedTerm"
            @click="handleAutoSchedule"
          >
            执行排课
          </el-button>
        </div>
      </div>

      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        <el-alert :title="successMessage" type="success" :closable="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTermList, addTerm, editSelection } from '@/api/common'
import { autoSchedule } from '@/api/course'
import type { Term } from '@/types'

const newTerm = ref('')
const selectedTerm = ref('')
const termList = ref<Term[]>([])
const successMessage = ref('')
const currentTermInfo = ref<Term | null>(null)

// 选课状态
const selectionStatus = computed<{ text: string; type: 'success' | 'info' | 'warning' | 'danger' | 'primary'; open: boolean }>(() => {
  if (!currentTermInfo.value) {
    return { text: '未开始选课', type: 'info' as const, open: false }
  }

  if (currentTermInfo.value.open) {
    return { text: '选课中', type: 'success' as const, open: true }
  } else {
    return { text: '未开始选课', type: 'info' as const, open: false }
  }
})

// 获取学期列表
const fetchTermList = async () => {
  try {
    const response = await getTermList()
    if (response.code === 200 && response.data) {
      termList.value = Array.isArray(response.data) ? response.data : []
    }
  } catch (error) {
    console.error('获取学期列表失败:', error)
    ElMessage.error('获取学期列表失败')
  }
}

// 添加新学期
const handleAddTerm = async () => {
  if (!newTerm.value.trim()) {
    ElMessage.warning('请输入学期名称')
    return
  }

  try {
    const response = await addTerm(newTerm.value)
    if (response.code === 200) {
      ElMessage.success('学期添加成功')
      successMessage.value = '学期别表添加成功'
      newTerm.value = ''
      await fetchTermList()
      
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      ElMessage.error(response.msg || '添加失败')
    }
  } catch (error) {
    console.error('添加学期失败:', error)
    ElMessage.error('添加学期失败')
  }
}

// 学期变更
const handleTermChange = () => {
  const term = termList.value.find(t => t.term === selectedTerm.value)
  currentTermInfo.value = term || null
}

// 开始选课
const handleStartSelection = async () => {
  if (!selectedTerm.value) return

  try {
    await ElMessageBox.confirm(
      `确认开始学期 ${selectedTerm.value} 的选课？`,
      '确认操作',
      { type: 'warning' }
    )

    const response = await editSelection(selectedTerm.value, true, true)
    if (response.code === 200) {
      ElMessage.success('已开始选课')
      successMessage.value = '已开始选课'
      await fetchTermList()
      handleTermChange()

      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('开始选课失败:', error)
      ElMessage.error('开始选课失败')
    }
  }
}

// 结束选课
const handleEndSelection = async () => {
  if (!selectedTerm.value) return

  try {
    await ElMessageBox.confirm(
      `确认结束学期 ${selectedTerm.value} 的选课？`,
      '确认操作',
      { type: 'warning' }
    )

    const response = await editSelection(selectedTerm.value, false, true)
    if (response.code === 200) {
      ElMessage.success('已结束选课')
      successMessage.value = '已结束选课'
      await fetchTermList()
      handleTermChange()

      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('结束选课失败:', error)
      ElMessage.error('结束选课失败')
    }
  }
}

// 执行排课
const handleAutoSchedule = async () => {
  if (!selectedTerm.value) return

  try {
    await ElMessageBox.confirm(
      `确认对学期 ${selectedTerm.value} 执行自动排课？`,
      '确认排课',
      { type: 'warning' }
    )

    const response = await autoSchedule(selectedTerm.value)
    if (response.code === 200) {
      ElMessage.success('排课成功')
      successMessage.value = '排课成功'

      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      ElMessage.error(response.msg || '排课失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('排课失败:', error)
      ElMessage.error('排课失败')
    }
  }
}

onMounted(() => {
  fetchTermList()
})
</script>

<style lang="scss" scoped>
.term-management {
  padding: 24px;
  background: #fff;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 32px;
  text-align: center;

  h2 {
    font-size: 28px;
    color: #303133;
    margin: 0;
  }
}

.content-container {
  max-width: 1000px;
  margin: 0 auto;
}

.section {
  margin-bottom: 40px;
  display: flex;
  align-items: center;

  .section-label {
    font-size: 16px;
    color: #303133;
    min-width: 120px;
    margin-right: 16px;
  }

  .section-content {
    flex: 1;
    display: flex;
    align-items: center;
  }
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

.success-message {
  margin-top: 40px;
  text-align: center;
}
</style>


