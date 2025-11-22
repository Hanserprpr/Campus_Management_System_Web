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

/**
 * 教师：获取课程学生成绩列表
 * @param courseId 课程ID
 * @returns 学生成绩列表
 */
export function getCourseGradeList(courseId: number): Promise<ApiResponse<Grade[]>> {
  return request.post<Grade[]>('/grade/getGradeList', null, {
    params: { courseId }
  })
}

/**
 * 教师：录入/更新成绩
 * @param params 成绩信息
 * @returns 响应数据
 */
export function setGrade(params: {
  id?: number
  studentId: number
  courseId: number
  regular?: number
  finalScore?: number
  grade?: number
  term?: string
}): Promise<ApiResponse<null>> {
  return request.post<null>('/grade/setGrade', null, {
    params
  })
}

/**
 * 教师：发布成绩
 * @param courseId 课程ID
 * @returns 响应数据
 */
export function releaseGrade(courseId: number): Promise<ApiResponse<null>> {
  return request.post<null>('/grade/releaseGrade', null, {
    params: { courseId }
  })
}
