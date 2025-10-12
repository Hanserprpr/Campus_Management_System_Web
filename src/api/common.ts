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

/**
 * 学期管理相关 API
 */

/**
 * 添加学期
 * @param term 学期名称
 * @returns 响应数据
 */
export function addTerm(term?: string) {
  return request.post('/term/addTerm', null, {
    params: { term }
  })
}

/**
 * 开放/关闭选课
 * @param term 学期
 * @param open 是否开放选课
 * @param current 是否当前学期
 * @returns 响应数据
 */
export function editSelection(term?: string, open?: boolean, current?: boolean) {
  return request.post('/term/editSelection', null, {
    params: { term, open, current }
  })
}

