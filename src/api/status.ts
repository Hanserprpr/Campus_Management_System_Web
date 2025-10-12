import { request } from '@/utils/request'
import type { StatusCard, ApiResponse } from '@/types'

/**
 * 学籍状态相关 API
 */

/**
 * 设置用户学籍
 * @param userId 学号
 * @param status 状态
 * @returns 响应数据
 */
export function setStatus(userId?: string, status?: string): Promise<ApiResponse<null>> {
  return request.post<null>('/status/set', null, {
    params: { userId, status }
  })
}

/**
 * 获取学籍卡片
 * @returns 学籍卡片数据
 */
export function getStatusCard(): Promise<ApiResponse<StatusCard>> {
  return request.post<StatusCard>('/status/getStatusCard')
}
