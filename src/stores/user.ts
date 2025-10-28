import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import { simpleLogin, sduLogin, refreshToken as refreshTokenApi } from '@/api/login'
import { getUserInfo, logout as logoutApi } from '@/api/user'
import type { UserSession, LoginRequest, LoginResponse, UserIdentity, UserInfo } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const userInfo = ref<Partial<UserSession>>({})
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const identity = computed(() => userInfo.value.identity)
  const username = computed(() => userInfo.value.username)
  const userId = computed(() => userInfo.value.id)
  
  // 判断是否是管理员
  const isAdmin = computed(() => identity.value === 0)
  // 判断是否是教师
  const isTeacher = computed(() => identity.value === 1)
  // 判断是否是学生
  const isStudent = computed(() => identity.value === 2)
  
  // Actions
  
  /**
   * 登录
   */
  async function login(loginData: LoginRequest, isSDULogin: boolean = false) {
    const response = isSDULogin ? await sduLogin(loginData) : await simpleLogin(loginData)

    // API返回code为200表示成功
    if (response.code === 200 && response.data) {
      const { accessToken, refreshToken: refresh, username: name, permission } = response.data

      // 保存 token
      token.value = accessToken
      refreshToken.value = refresh

      // 将permission字符串转换为数字
      const identityValue = typeof permission === 'string' ? parseInt(permission) : permission

      // 保存用户信息
      userInfo.value = {
        token: accessToken,
        refreshToken: refresh,
        username: name,
        identity: identityValue as UserIdentity
      }

      // 持久化到本地存储
      storage.setToken(accessToken)
      storage.setRefreshToken(refresh)
      storage.setUserInfo(userInfo.value)

      return response.data
    }

    throw new Error(response.msg || '登录失败')
  }
  
  /**
   * 刷新 token
   */
  async function refreshAccessToken() {
    try {
      const response = await refreshTokenApi()

      // API返回code为200表示成功
      if (response.code === 200 && response.data) {
        token.value = response.data.accessToken
        userInfo.value.token = response.data.accessToken

        storage.setToken(response.data.accessToken)
        storage.setUserInfo(userInfo.value)

        return response.data.accessToken
      }
    } catch (error) {
      console.error('刷新 token 失败:', error)
      logout()
      throw error
    }
  }
  
  /**
   * 退出登录
   */
  async function logout() {
    try {
      // 调用登出API
      if(isLoggedIn)
        await logoutApi()
    } catch (error) {
      console.error('登出API调用失败:', error)
    } finally {
      // 清除本地存储和状态
      token.value = ''
      refreshToken.value = ''
      userInfo.value = {}

      storage.clear()
    }
  }
  
  /**
   * 检查认证状态
   */
  function checkAuth() {
    const savedToken = storage.getToken()
    const savedRefreshToken = storage.getRefreshToken()
    const savedUserInfo = storage.getUserInfo<Partial<UserSession>>()
    
    if (savedToken && savedUserInfo) {
      token.value = savedToken
      refreshToken.value = savedRefreshToken || ''
      userInfo.value = savedUserInfo
    }
  }
  
  /**
   * 更新用户信息
   */
  function updateUserInfo(info: Partial<UserSession>) {
    userInfo.value = {
      ...userInfo.value,
      ...info
    }
    storage.setUserInfo(userInfo.value)
  }
  
  /**
   * 获取用户详细信息
   */
  async function fetchUserInfo() {
    try {
      const response = await getUserInfo()
      // API返回code为200表示成功
      if (response.code === 200 && response.data) {
        // 更新用户信息，将API返回的数据映射到UserSession格式
        const apiData = response.data
        const sessionData: Partial<UserSession> = {
          id: apiData.id,
          username: apiData.username,
          email: apiData.email,
          phone: apiData.phone,
          sex: apiData.sex,
          nation: apiData.nation,
          ethnic: apiData.ethnic,
          sduid: apiData.sduid,
          major: apiData.major,
          politicsStatus: apiData.politicsStatus,
          college: apiData.college,
          identity: apiData.permission as UserIdentity
        }

        updateUserInfo(sessionData)
        return response.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }
  
  return {
    // State
    token,
    refreshToken,
    userInfo,
    
    // Getters
    isLoggedIn,
    identity,
    username,
    userId,
    isAdmin,
    isTeacher,
    isStudent,
    
    // Actions
    login,
    logout,
    checkAuth,
    updateUserInfo,
    fetchUserInfo,
    refreshAccessToken
  }
})

