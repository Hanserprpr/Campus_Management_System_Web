<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的课表</span>
        </div>
      </template>
      
      <div class="schedule-container">
        <el-empty description="课表功能待实现" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 课表功能待实现
</script>

<style lang="scss" scoped>
.card-header {
  font-size: 16px;
  font-weight: bold;
}

.schedule-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

