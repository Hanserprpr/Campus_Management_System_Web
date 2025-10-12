import { request } from '@/utils/request'
import type { UserInfo, UpdateUserRequest, AddTeacherRequest, ApiResponse } from '@/types'

/**
 * 用户相关 API
 */

/**
 * 获取个人信息
 * @returns 用户信息
 */
export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return request.post<UserInfo>('/user/getInfo')
}

/**
 * 用户登出
 * @returns 响应数据
 */
export function logout(): Promise<ApiResponse<null>> {
  return request.post<null>('/user/logout')
}

/**
 * 更新用户手机号
 * @param phone 新手机号
 * @returns 响应数据
 */
export function updatePhone(phone: string): Promise<ApiResponse<null>> {
  return request.post<null>('/user/updatePhone', null, {
    params: { phone }
  })
}

/**
 * 更新用户邮箱
 * @param email 新邮箱
 * @returns 响应数据
 */
export function updateEmail(email: string): Promise<ApiResponse<null>> {
  return request.post<null>('/user/updateEmail', null, {
    params: { email }
  })
}

/**
 * 管理修改学生信息
 * @param data 学生信息更新数据
 * @returns 响应数据
 */
export function updateStudent(data: UpdateUserRequest): Promise<ApiResponse<null>> {
  return request.post<null>('/user/updateStudent', null, {
    params: data
  })
}

/**
 * 重置密码
 * @param userId 用户ID
 * @returns 响应数据
 */
export function resetPassword(userId: string): Promise<ApiResponse<null>> {
  return request.post<null>('/user/resetPassword', null, {
    params: { userId }
  })
}

/**
 * 修改密码
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 * @returns 响应数据
 */
export function updatePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<null>> {
  return request.post<null>('/user/updatePassword', null, {
    params: { oldPassword, newPassword }
  })
}

/**
 * 添加教师 (已废弃)
 * @param data 教师信息
 * @returns 响应数据
 */
export function addTeacher(data: AddTeacherRequest): Promise<ApiResponse<any>> {
  return request.post('/user/addTeacher', null, {
    params: data
  })
}
