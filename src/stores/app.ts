import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTermList, getCurrentTerm, getClassRoomList } from '@/api/common'

export const useAppStore = defineStore('app', () => {
  // State
  const semesters = ref<string[]>([])
  const currentTerm = ref<string>('')
  const classrooms = ref<string[]>([])
  const loading = ref(false)

  // Actions

  /**
   * 获取学期列表
   */
  async function fetchSemesters() {
    try {
      const response = await getTermList()
      if (response.code === 200 && response.data) {
        // 从返回的数组中提取 term 字段
        const termList = response.data.map((item: any) => item.term)
        semesters.value = termList
        return termList
      }
    } catch (error) {
      console.error('获取学期列表失败:', error)
      throw error
    }
  }

  /**
   * 获取当前学期
   */
  async function fetchCurrentTerm() {
    try {
      const response = await getCurrentTerm()
      if (response.code === 200 && response.data) {
        currentTerm.value = response.data
        return response.data
      }
    } catch (error) {
      console.error('获取当前学期失败:', error)
      throw error
    }
  }

  /**
   * 获取教室列表
   */
  async function fetchClassrooms() {
    try {
      const response = await getClassRoomList()
      if (response.code === 200 && response.data) {
        // 从返回的数组中提取 location 字段
        const roomList = response.data.map((item: any) => item.location)
        classrooms.value = roomList
        return roomList
      }
    } catch (error) {
      console.error('获取教室列表失败:', error)
      throw error
    }
  }
  
  /**
   * 设置加载状态
   */
  function setLoading(value: boolean) {
    loading.value = value
  }
  
  return {
    // State
    semesters,
    currentTerm,
    classrooms,
    loading,
    
    // Actions
    fetchSemesters,
    fetchCurrentTerm,
    fetchClassrooms,
    setLoading
  }
})

