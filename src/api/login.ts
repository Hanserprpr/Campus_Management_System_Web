import { request } from '@/utils/request'
import type { LoginRequest, LoginResponse, RefreshTokenResponse, ApiResponse } from '@/types'

/**
 * 登录相关 API
 */

/**
 * 简单登录
 * @param data 登录请求参数
 * @returns 登录响应数据
 */
export function simpleLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return request.post<LoginResponse>('/login/simpleLogin', data)
}

/**
 * SDU登录 (已废弃)
 * @param data 登录请求参数
 * @returns 登录响应数据
 */
export function sduLogin(data: LoginRequest): Promise<ApiResponse<any>> {
  return request.post('/login/SDULogin', data)
}

/**
 * 跳转到登录页面
 * @param deviceId 设备ID
 * @returns 响应数据
 */
export function toLogin(deviceId: string): Promise<ApiResponse<any>> {
  return request.get('/login/toLogin', { deviceId })
}

/**
 * OAuth登录回调
 * @param code 授权码
 * @param state 状态参数
 * @returns 响应数据
 */
export function oauthCallback(code: string, state: string): Promise<ApiResponse<string>> {
  return request.get('/login/callback', { code, state })
}

/**
 * 获取OAuth Token
 * @param state 状态参数
 * @returns 响应数据
 */
export function getOAuthToken(state: string): Promise<ApiResponse<any>> {
  return request.get('/login/getOAuthToken', { state })
}

/**
 * 刷新Token
 * @returns 新的访问Token
 */
export function refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
  return request.post<RefreshTokenResponse>('/login/refreshToken')
}
