import { request } from '@/utils/request'
import type { SectionRequest, SectionListResponse, ApiResponse } from '@/types'

/**
 * 班级/节管理相关 API
 */

/**
 * 添加班级
 * @param data 班级信息
 * @returns 响应数据
 */
export function addSection(data: SectionRequest): Promise<ApiResponse<null>> {
  return request.post<null>('/section/addSection', null, {
    params: data
  })
}

/**
 * 修改班级信息
 * @param data 班级信息
 * @returns 响应数据
 */
export function updateSection(data: SectionRequest): Promise<ApiResponse<null>> {
  return request.post<null>('/section/updateSection', null, {
    params: data
  })
}

/**
 * 分配人员
 * @param grade 年级
 * @returns 响应数据
 */
export function assignSection(grade?: string): Promise<ApiResponse<null>> {
  return request.post<null>('/section/assign', null, {
    params: { grade }
  })
}

/**
 * 删除班级
 * @param id 班级唯一ID
 * @returns 响应数据
 */
export function deleteSection(id?: string): Promise<ApiResponse<null>> {
  return request.post<null>('/section/deleteSection', null, {
    params: { id }
  })
}

/**
 * 根据年级获取班级列表
 * @param params 查询参数
 * @returns 班级列表
 */
export function getSectionList(params?: {
  grade?: string
  page?: number
  size?: number
  keyword?: string
}): Promise<ApiResponse<SectionListResponse>> {
  return request.get<SectionListResponse>('/section/getSectionList', params)
}

/**
 * 获取班级列表
 * @param params 分页参数
 * @returns 班级列表
 */
export function getSectionListAll(params?: {
  page?: number
  size?: number
}): Promise<ApiResponse<SectionListResponse>> {
  return request.get<SectionListResponse>('/section/getSectionListAll', params)
}

/**
 * 获取班级成员
 * @param id 班级ID
 * @returns 班级成员列表
 */
export function getSectionMember(id?: number): Promise<ApiResponse<any[]>> {
  return request.get('/section/getSectionMember', { id })
}

/**
 * 获取班级信息
 * @param id 班级ID
 * @returns 班级信息
 */
export function getSectionInfo(id?: number): Promise<ApiResponse<any>> {
  return request.get('/section/getSectionInfo', { id })
}
