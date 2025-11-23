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

/**
 * 删除用户
 * @param userId 用户ID
 * @returns 响应数据
 */
export function deleteUser(userId: number): Promise<ApiResponse<null>> {
  return request.post<null>('/admin/deleteUser', null, {
    params: { userId }
  })
}

/**
 * 用户详细信息响应
 */
export interface UserDetailResponse {
  user: UserInfo
  status: {
    id: number
    grade: number
    sectionId: number
    section: string
    status: string
    admission: number
    graduation: number
  }
  section: any
}

/**
 * 获取用户详细信息
 * @param userId 用户ID
 * @returns 用户详细信息
 */
export function getUserInfo(userId: number): Promise<ApiResponse<UserDetailResponse>> {
  return request.get<UserDetailResponse>('/admin/getUserInfo', { userId })
}

/**
 * 批量导入用户（Excel）
 * @param file Excel文件
 * @returns 响应数据
 */
export function uploadUserExcel(file: File): Promise<ApiResponse<any>> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<any>('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}



