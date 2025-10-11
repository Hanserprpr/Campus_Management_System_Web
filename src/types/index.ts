/**
 * 用户身份类型
 * 0: 管理员
 * 1: 教师
 * 2: 学生
 */
export type UserIdentity = 0 | 1 | 2

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 用户会话信息
 */
export interface UserSession {
  token: string
  refreshToken: string
  username: string
  identity: UserIdentity
  id: number
  email?: string
  phone?: string
  sex?: string
  section?: string
  nation?: string
  ethnic?: string
  sduid?: string
  major?: string
  politicsStatus?: string
  college?: string
  admission?: string
  graduation?: string
  number?: string
  induction?: string
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  stuId: string
  password: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  username: string
  permission: UserIdentity
}

/**
 * 课程信息
 */
export interface Course {
  id: number
  name: string
  teacherName?: string
  category: string
  point: number
  teacherId: number
  classroom: string
  weekStart: number
  weekEnd: number
  period: number
  time: string | object
  college: string
  term?: string
  classNum?: string
  type?: string
  capacity?: number
  selectedCount?: number
  status?: string
  intro?: string
  examination?: number
  f_reason?: string
  published?: boolean
  regularRatio?: number
  finalRatio?: number
}

/**
 * 学生信息
 */
export interface Student {
  id: number
  name: string
  sduid: string
  sex?: string
  email?: string
  phone?: string
  major?: string
  section?: string
  college?: string
  admission?: string
  graduation?: string
  nation?: string
  ethnic?: string
  politicsStatus?: string
}

/**
 * 教师信息
 */
export interface Teacher {
  id: number
  name: string
  sduid: string
  sex?: string
  email?: string
  phone?: string
  college?: string
  nation?: string
  ethnic?: string
  politicsStatus?: string
  induction?: string
}

/**
 * 成绩记录
 */
export interface ScoreRecord {
  id: number
  studentId: number
  studentName?: string
  courseId: number
  courseName?: string
  regularScore?: number
  finalScore?: number
  totalScore?: number
  term?: string
}

/**
 * 成绩录入项
 */
export interface ScoreEntry {
  studentId: number
  studentName: string
  sduid: string
  regularScore?: number
  finalScore?: number
  totalScore?: number
}

/**
 * 班级信息
 */
export interface ClassInfo {
  id: number
  name: string
  major: string
  college: string
  studentCount?: number
}

/**
 * 课程申请
 */
export interface CourseApplication extends Course {
  status: string
  f_reason?: string
}

/**
 * 公告信息
 */
export interface Announcement {
  id: number
  title: string
  content: string
  createTime: string
  updateTime?: string
  publisher?: string
}

/**
 * 学期信息
 */
export interface Term {
  id: number
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

/**
 * 分页请求参数
 */
export interface PageRequest {
  page: number
  size: number
  keyword?: string
  [key: string]: any
}

/**
 * 分页响应数据
 */
export interface PageResponse<T> {
  total: number
  list: T[]
  page: number
  size: number
}

/**
 * 课表节次信息
 */
export interface Section {
  period: number
  startTime: string
  endTime: string
}

/**
 * 课表行数据
 */
export interface CourseRow {
  period: number
  monday?: Course
  tuesday?: Course
  wednesday?: Course
  thursday?: Course
  friday?: Course
  saturday?: Course
  sunday?: Course
}

