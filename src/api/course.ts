import { request } from '@/utils/request'
import type { Course, PageRequest, PageResponse } from '@/types'

/**
 * 课程相关 API
 */

// 获取未选课程列表（可选课程）
export function getUnselectedCourses(params?: PageRequest) {
  return request.get<Course[]>('/course-selection/unChoose', params)
}

// 获取已选课程列表
export function getSelectedCourses(params?: PageRequest) {
  return request.get<Course[]>('/course-selection/choose', params)
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

// 获取课程详情
export function getCourseDetail(courseId: number) {
  return request.get<Course>(`/course/${courseId}`)
}

// 搜索课程
export function searchCourses(params: {
  keyword?: string
  category?: string
  college?: string
  page?: number
  size?: number
}) {
  return request.get<PageResponse<Course>>('/course/search', params)
}

// 获取课表
export function getCourseSchedule() {
  return request.get('/course-selection/schedule')
}

// 教师：获取我的课程列表
export function getMyCourses() {
  return request.get<Course[]>('/teacher/courses')
}

// 教师：申请新课程
export function applyCourse(data: Partial<Course>) {
  return request.post('/teacher/course/apply', data)
}

// 教师：编辑课程
export function updateCourse(courseId: number, data: Partial<Course>) {
  return request.put(`/teacher/course/${courseId}`, data)
}

// 教师：删除课程
export function deleteCourse(courseId: number) {
  return request.delete(`/teacher/course/${courseId}`)
}

// 管理员：获取所有课程
export function getAllCourses(params?: PageRequest) {
  return request.get<PageResponse<Course>>('/admin/courses', params)
}

// 管理员：审核课程申请
export function approveCourse(courseId: number, approved: boolean, reason?: string) {
  return request.post('/admin/course/approve', { courseId, approved, reason })
}

