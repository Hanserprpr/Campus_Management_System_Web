import { request } from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 成绩相关 API
 */

/**
 * 学生成绩统计信息
 */
export interface GradeStats {
  totalPoint: number
  totalClass: number
  pointRank: number
  averCredits: number
}

/**
 * 获取学生信息/成绩统计
 * @param term 学期
 * @returns 学生成绩统计信息
 */
export function getGradeMessage(term?: string): Promise<ApiResponse<GradeStats>> {
  return request.get<GradeStats>('/grade/getMessage', { term })
}
