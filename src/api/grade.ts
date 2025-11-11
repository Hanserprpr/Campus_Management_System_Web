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

export interface Grade{
  className: string;
  classNum: number;
  courseId: number;
  finalScore: number;
  grade: number;
  id: number;
  point: number;
  rank: number;
  regular: number;
  teacher: string;
  teacherId: number;
  type: string;
  [property: string]: any;
}

/**
 * 获取学生信息/成绩统计
 * @param term 学期
 * @returns 学生成绩统计信息
 */
export function getGradeMessage(term?: string): Promise<ApiResponse<GradeStats>> {
  return request.get<GradeStats>('/grade/getMessage', { term })
}

export function getGradeList( term: string): Promise<ApiResponse<Grade[]>>{
  return request.get<Grade[]>('/grade/getGrade', {term});
}
