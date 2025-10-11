import { request } from '@/utils/request'

/**
 * 公共 API - 学期、教室等
 */

// 获取学期列表
export function getTermList() {
  return request.get('/term/getTermList')
}

// 获取当前学期
export function getCurrentTerm() {
  return request.get('/term/getCurrentTerm')
}

// 获取当前教学周
export function getCurrentWeek(term: string) {
  return request.get('/term/getCurrentWeek', { term })
}

// 获取教室列表（教师和管理员使用）
export function getClassRoomList() {
  return request.get('/Teacher/getClassRoom')
}

