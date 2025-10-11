<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成绩查询</span>
          <el-button type="primary" @click="handleExport">导出成绩</el-button>
        </div>
      </template>
      
      <div class="grades-container">
        <el-empty description="成绩查询功能待实现" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const handleExport = () => {
  ElMessage.info('导出功能待实现')
}
</script>

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

