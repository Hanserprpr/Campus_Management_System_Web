import { request } from '@/utils/request'
import type { Course, PageRequest } from '@/types'
import { useAppStore } from '@/stores/app'

/**
 * 课程相关 API
 */

// 获取未选课程列表（可选课程）
export function getUnselectedCourses(params?: PageRequest) {
  return request.get<Course[]>('/course-selection/unChoose', params)
}


// 获取选课结果
export function getCourseResults(params?: PageRequest) {
  return request.get<Course[]>('/course-selection/results', params)
}

// 选课 - 注意：路径中包含课程ID
export function selectCourse(courseId: number) {
  return request.post(`/course-selection/select/${courseId}`, {})
}

// 退课 - 注意：路径中包含课程ID
export function dropCourse(courseId: number) {
  return request.post(`/course-selection/drop/${courseId}`, {})
}

// 获取课程详情 (使用OpenAPI中的class/detail端点)
export function getCourseDetail(courseId: number) {
  return request.get<Course>(`/class/detail/${courseId}`)
}

// 搜索课程 (使用OpenAPI中的course-selection/search端点)
export function searchCourses(params: {
  keyword?: string
  term?: string
  type?: string
}) {
  return request.get<Course[]>('/course-selection/search', params)
}

// 获取课表
export function getCourseSchedule(week: number = 1, param:{term?:string}) {
  if( !param ){
    param = {}
  }
  if( !param.term || param.term == null || param.term == undefined){
    param.term = useAppStore().$state.currentTerm;
  }
  return request.get<Course[]>(
    `/class/getClassSchedule/${week}`,
    param
  )
}


// 教师：申请新课程
export function applyCourse(data: Partial<Course>) {
  return request.post('/teacher/course/apply', data)
}

// 教师：搜索教师创建的课程列表
export function searchTeacherCourses(params: {
  term?: string
  pageNum: number
  pageSize: number
  keyword?: string
}) {
  return request.get('/class/searchTeacherCourses', params)
}

// 教师：修改课程信息
export function updateTeacherCourse(courseId: number, data: any) {
  return request.post(`/class/update/${courseId}`, data)
}

// 教师：删除课程
export function deleteTeacherCourse(courseId: number) {
  return request.post(`/class/delete/${courseId}`)
}

// 管理员：获取待批准的课程列表
export function getPendingCourses() {
  return request.get('/class/pending')
}

// 获取已选课成员名单
export function getCourseStudents(courseId: number) {
  return request.get(`/class/${courseId}/students`)
}

// 管理员：排课
export function autoSchedule(term: string) {
  return request.post('/class/autoSchedule', null, {
    params: { term }
  })
}

// 管理员：删除已审核课程
export function deleteApprovedCourse(courseId: number) {
  return request.post(`/class/deleteAd/${courseId}`)
}

// 获取课程被退回原因
export function getCourseReason(courseId: number) {
  return request.get(`/class/getReason/${courseId}`)
}

// 管理员：获取所有课程列表
export function getAllCourses(params?: {
  term?: string
  pageNum?: number
  pageSize?: number
}) {
  return request.get('/class/list', params)
}

// 管理员：审核课程申请
export function approveCourse(courseId: number, status: number, reason?: string, classNum?: Array<number>) {
  return request.post(`/class/approve/${courseId}`, classNum, {params: { status, reason }})
}

