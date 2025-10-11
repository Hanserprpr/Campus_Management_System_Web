/**
 * 本地存储工具类
 */

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

export const storage = {
  // Token 相关
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
  
  // Refresh Token 相关
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },
  
  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
  
  // 用户信息相关
  getUserInfo<T = any>(): T | null {
    const userInfo = localStorage.getItem(USER_INFO_KEY)
    return userInfo ? JSON.parse(userInfo) : null
  },
  
  setUserInfo(userInfo: any): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  },
  
  removeUserInfo(): void {
    localStorage.removeItem(USER_INFO_KEY)
  },
  
  // 清除所有
  clear(): void {
    this.removeToken()
    this.removeRefreshToken()
    this.removeUserInfo()
  },
  
  // 通用方法
  get(key: string): string | null {
    return localStorage.getItem(key)
  },
  
  set(key: string, value: string): void {
    localStorage.setItem(key, value)
  },
  
  remove(key: string): void {
    localStorage.removeItem(key)
  }
}

