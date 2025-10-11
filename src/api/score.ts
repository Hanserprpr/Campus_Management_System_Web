import { request } from '@/utils/request'
import type { ScoreRecord, ScoreEntry, PageRequest, PageResponse } from '@/types'

/**
 * 成绩相关 API
 */

// 学生：获取成绩列表
export function getMyScores(params?: PageRequest) {
  return request.get<PageResponse<ScoreRecord>>('/student/scores', params)
}

// 学生：导出成绩
export function exportMyScores() {
  return request.get('/student/scores/export')
}

// 教师：获取课程学生列表
export function getCourseStudents(courseId: number) {
  return request.get<ScoreEntry[]>(`/teacher/course/${courseId}/students`)
}

// 教师：录入成绩
export function inputScores(courseId: number, scores: ScoreEntry[]) {
  return request.post(`/teacher/course/${courseId}/scores`, { scores })
}

// 教师：更新单个学生成绩
export function updateScore(scoreId: number, data: Partial<ScoreEntry>) {
  return request.put(`/teacher/score/${scoreId}`, data)
}

// 管理员：获取所有成绩
export function getAllScores(params?: PageRequest) {
  return request.get<PageResponse<ScoreRecord>>('/admin/scores', params)
}

