<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-row>
            <span>我的课表</span>
            <el-select
              class="select-list"
              v-model="selectedTerm"
              :options="terms"
              @change="getCourses"
              :props="{
                value : 'term',
                label : 'term'
              }"></el-select>
            <el-select
              class="select-list"
              v-model="selectedWeek"
              @change="getCourses"
              :options="weeks"
              :props="{
                value : 'id',
                label : 'label'
              }"></el-select>
              <el-button @click="getCourses">刷新</el-button>
          </el-row>
        </div>
      </template>

      <div class="schedule-container">
        <el-row class="schedule-row day-info">
          <el-col :span="1" class="schedule-col">  </el-col>
          <el-col :span="3" class="schedule-col"> 周一 </el-col>
          <el-col :span="3" class="schedule-col"> 周二 </el-col>
          <el-col :span="3" class="schedule-col"> 周三 </el-col>
          <el-col :span="3" class="schedule-col"> 周四 </el-col>
          <el-col :span="3" class="schedule-col"> 周五 </el-col>
          <el-col :span="3" class="schedule-col"> 周六 </el-col>
          <el-col :span="3" class="schedule-col"> 周日 </el-col>
        </el-row>
        <el-row
          class="schedule-row"
          v-for="(order, i) in courseTableData"
        >
          <el-col :span="1">
             <el-card class="time-info">
                {{ i+1 }}
             </el-card>
          </el-col>
          <el-col
            class="schedule-col"
            :span="3"
            v-for="(day) in order"
          >
            <el-card class = "course-card">
              <div class = "course-div" v-if="day!=null">
                <div class = "course-name">
                  {{ day.name }}
                </div>
                <div class="course-place">
                  {{ day.classroom }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getTermList } from '@/api/common';
import { getCourseSchedule } from '@/api/course';
import { useAppStore } from '@/stores/app';
import { Course, Term } from '@/types';

//  time = (day-1)*5 + classOrder
const appStore = useAppStore();

let courses: Course[] = [];

//初始化数组，确定大小5*7
const courseTableData = reactive<(Course|null)[][]>(
  Array.from( 
    {length:5}, 
    ()=>Array.from( {length:7}, 
      ()=>null
    )
  ) as (Course|null)[][] 
)
const terms = ref<Term[]>()
const weeks : {
  id: number,
  label: string
}[] = [];
for( let i:number = 1; i <= 20; ++i) weeks.push( { id: i, label: `第${i}周`})

const selectedTerm = ref<string>('')
const selectedWeek = ref<number>(1)

const getCourses = async ()=>{
  const res = await getCourseSchedule(selectedWeek.value, { term: selectedTerm.value });
  courses = res.data;
  makeCoursesTableData();
}
const getTerms = async()=>{
  const res = await getTermList()
  terms.value = res.data
}
const makeCoursesTableData = ()=>{
  for(let i = 0; i < 5; ++i){
    for(let j = 0; j < 7; ++j){
      courseTableData[i][j] = null
    }
  }
  courses.forEach( (value: Course)=>{
    const time = Number.parseInt(value.time as string);
    const classOrder: number = time % 5;
    const day: number = Math.floor(time / 5) + 1;
    if( classOrder > 0){
      courseTableData[classOrder-1][day-1] = value;
    }else if( classOrder === 0){
      courseTableData[4][day-1] = value;
    }
  })
}
onMounted( async ()=>{
  selectedTerm.value = await appStore.fetchCurrentTerm();
  getTerms();
  getCourses();
})
</script>

<style lang="scss" scoped>

.page-container{
  height: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.schedule-container {
  width: 100%;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px; // 行与行之间的间距
  max-height: calc(100% - 100px); // 限制最大高度，避免溢出
  overflow-y: auto; 
  overflow-x: auto; 
  white-space: nowrap; 
}

.schedule-row {
  width: 100%;
  display: flex;
  gap: 6px; // 列与列之间的间距
}

.schedule-col {
  flex: 1; 
}

.select-list{
  width: 160px;
  margin-left: 10px;
  margin-right: 10px;
}

.course-card{
  min-height: 100px;
}
.course-div{
  text-align: center;
  border-radius: 6px;
  border: 5px;
  border-width: 2px;
  border-color: rgba(247, 53, 147);
  background-color: rgba(247, 53, 147, 0.162);
}
.course-name{
  font-weight: bold;
}
.time-info{
  min-height: 100px;
  align-items: center;
  align-self: center;
  align-content: center;
  text-align: center;
}
.day-info{
  text-align:center;
}
</style>

