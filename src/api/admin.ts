import { request } from '@/utils/request'
import type { ApiResponse, UserInfo } from '@/types'

/**
 * 管理员相关 API
 */

/**
 * 教师列表响应
 */
export interface TeacherListResponse {
  user: UserInfo[]
  page: number
}

/**
 * 获取教师列表
 * @param params 查询参数
 * @returns 教师列表
 */
export function getTeacherList(params: {
  college?: string
  page: number
  limit?: number
}): Promise<ApiResponse<TeacherListResponse>> {
  return request.get<TeacherListResponse>('/admin/getTeacherList', params)
}

/**
 * 修改用户信息
 * @param data 用户信息
 * @returns 响应数据
 */
export function updateUser(data: FormData): Promise<ApiResponse<null>> {
  return request.post<null>('/admin/updateUser', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 添加用户
 * @param data 用户信息
 * @returns 响应数据
 */
export function addUser(data: FormData): Promise<ApiResponse<null>> {
  return request.post<null>('/admin/addUser', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 搜索用户
 * @param params 搜索参数
 * @returns 用户列表
 */
export function searchUsers(params: {
  keyword: string
  permission?: number
  pageNum?: number
  pageSize?: number
}): Promise<ApiResponse<any>> {
  return request.get('/admin/searchSdu', params)
}

/**
 * 获取学生列表
 * @param params 查询参数
 * @returns 学生列表
 */
export function getStudentList(params?: {
  grade?: number
  major?: string
  pageNum?: number
  pageSize?: number
}): Promise<ApiResponse<any>> {
  return request.get('/admin/student/list', params)
}

export function getTeacherStudentNum(params?: {
  permission: number
}): Promise<ApiResponse<any>> {
  return request.get('/admin/getNum', params)
}