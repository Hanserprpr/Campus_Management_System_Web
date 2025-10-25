<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的课表</span>
          
        </div>
      </template>
      
      <div class="schedule-container">
        
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getCourseSchedule } from '@/api/course';
import { useAppStore } from '@/stores/app';
import { Course } from '@/types';

// 课表功能待实现 time = (day-1)*5 + classOrder
const appStore = useAppStore();
console.log( appStore.currentTerm )
console.log( 111)
const res = await getCourseSchedule(1, { term: appStore.currentTerm });
const courses = ref<Course[]>( res.data as Course[] );

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

