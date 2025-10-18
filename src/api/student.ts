import { request } from '@/utils/request'
import type { Student, PageRequest, PageResponse } from '@/types'

/**
 * 学生相关 API
 */

// 获取学生信息
export function getStudentInfo() {
  return request.post<Student>('/student/getInfo')
}

// 更新学生信息
//TODO
export function updateStudentInfo(data: Partial<Student>) {
  return request.put('/student/info', data)
}

// 修改密码
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request.post('/user/updatePassword', data)
}

// 获取学生统计数据
// !TODO 没有这个接口
// export function getStudentStats() {
//   return request.get('/student/stats')
// }

// 获取今日课程 - 需要传入当前周和学期
export function getTodayCourses(week: number, params: { term: string }) {
  return request.get(`/class/getClassSchedule/${week}`, params)
}

// 获取学生公告列表
export function getStudentNoticeList(params?: any) {
  return request.get('/notice/getStudentNoticeList', params)
}

// 管理员：获取学生列表
export function getStudentList(params?: PageRequest) {
  return request.get<PageResponse<Student>>('/admin/students', params)
}

// 管理员：添加学生
export function addStudent(data: Partial<Student>) {
  return request.post('/admin/student', data)
}

// 管理员：更新学生信息
export function updateStudent(studentId: number, data: Partial<Student>) {
  return request.put(`/admin/student/${studentId}`, data)
}

// 管理员：删除学生
export function deleteStudent(studentId: number) {
  return request.delete(`/admin/student/${studentId}`)
}

// 管理员：批量导入学生
export function importStudents(file: File) {
  return request.upload('/admin/students/import', file)
}

// 管理员：导出学生数据
export function exportStudents(params?: any) {
  return request.get('/admin/students/export', params)
}

