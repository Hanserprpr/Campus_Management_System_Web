import { request } from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 教师相关 API
 */

/**
 * 教师统计信息
 */
export interface TeacherStats {
  totalClassHour: number
  classAmo: number
}

/**
 * 教师课程统计信息
 */
export interface TeacherCourseStats {
  unFinish: number
  finish: number
}

/**
 * 教师课程数量统计
 */
export interface TeacherClassCount {
  activeClass: number
  pendingClass: number
}

/**
 * 教室信息
 */
export interface Classroom {
  id: number
  location: string
}

/**
 * 获取教师信息/统计
 * @returns 教师统计信息
 */
export function getTeacherMessage(): Promise<ApiResponse<TeacherStats>> {
  return request.get<TeacherStats>('/Teacher/getMessage')
}

/**
 * 获取教师统计信息 (POST)
 * @param term 学期
 * @returns 教师课程统计信息
 */
export function getTeacherStats(term?: string): Promise<ApiResponse<TeacherCourseStats>> {
  return request.post<TeacherCourseStats>('/Teacher/getMessage', null, {
    params: { term }
  })
}

/**
 * 获取教师课程数量
 * @param term 学期
 * @returns 课程数量统计
 */
export function countClass(term?: string): Promise<ApiResponse<TeacherClassCount>> {
  return request.get<TeacherClassCount>('/Teacher/countClass', { term })
}

/**
 * 获取教室列表
 * @returns 教室列表
 */
export function getClassRoom(): Promise<ApiResponse<Classroom[]>> {
  return request.get<Classroom[]>('/Teacher/getClassRoom')
}
