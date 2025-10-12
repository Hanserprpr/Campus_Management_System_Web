import { request } from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 公告相关 API
 */

/**
 * 公告信息
 */
export interface Notice {
  id: number
  creatorName: string
  title: string
  content: string
  publishTime: string
  visibleScope: number
  creatorId: number
  isTop: number
  status: number
  createdAt: string
  updatedAt: string
}

/**
 * 发布公告参数
 */
export interface PublishNoticeParams {
  id?: number
  creatorName?: string
  title?: string
  content?: string
  publishTime?: string
  visibleScope?: number
  creatorId?: number
  isTop?: number
  status?: number
  createdAt?: string
  updatedAt?: string
}

/**
 * 发布公告
 * @param params 公告参数
 * @returns 响应数据
 */
export function publishNotice(params: PublishNoticeParams): Promise<ApiResponse<null>> {
  return request.get<null>('/notice/set', params)
}

/**
 * 学生获取公告列表
 * @returns 公告列表
 */
export function getStudentNoticeList(): Promise<ApiResponse<Notice[]>> {
  return request.get<Notice[]>('/notice/getStudentNoticeList')
}

/**
 * 教师获取公告列表
 * @returns 公告列表
 */
export function getTeacherNoticeList(): Promise<ApiResponse<Notice[]>> {
  return request.get<Notice[]>('/notice/getTeacherNoticeList')
}

/**
 * 教务获取公告列表
 * @param status 公告状态
 * @returns 公告列表
 */
export function getAdminNoticeList(status?: number): Promise<ApiResponse<Notice[]>> {
  return request.get<Notice[]>('/notice/getAdminNoticeList', { Status: status })
}

/**
 * 编辑公告
 * @param params 公告参数
 * @returns 响应数据
 */
export function editNotice(params: PublishNoticeParams): Promise<ApiResponse<any>> {
  return request.get('/notice/edit', params)
}

/**
 * 删除公告
 * @param id 公告ID
 * @returns 响应数据
 */
export function deleteNotice(id?: number): Promise<ApiResponse<any>> {
  return request.get('/notice/close', { id })
}
