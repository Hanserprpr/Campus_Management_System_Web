import { request } from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 验证相关 API
 */

/**
 * 验证请求参数
 */
export interface VerifyRequest {
  ticket: string
  code: string
}

/**
 * 获取验证码
 * @param email 邮箱地址
 * @returns 验证码票据
 */
export function getVerifyCode(email?: string): Promise<ApiResponse<string>> {
  return request.get<string>('/verify/getCode', { email })
}

/**
 * 验证验证码
 * @param data 验证请求参数
 * @returns 验证结果
 */
export function verifyCode(data: VerifyRequest): Promise<ApiResponse<null>> {
  return request.post<null>('/verify/verifyCode', data)
}
