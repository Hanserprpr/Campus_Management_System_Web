import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 * @param date 日期
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取当前日期
 * @returns 当前日期字符串
 */
export function getCurrentDate(): string {
  // 测试：返回明天的日期
  return dayjs().add(1, 'day').format('YYYY-MM-DD')
}

/**
 * 获取当前日期时间
 * @returns 当前日期时间字符串
 */
export function getCurrentDateTime(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取星期几
 * @param date 日期
 * @returns 星期几（0-6，0 表示星期日）
 */
export function getDayOfWeek(date: string | Date = new Date()): number {
  return dayjs(date).day()
}

/**
 * 获取星期几的中文名称
 * @param date 日期
 * @returns 星期几的中文名称
 */
export function getDayOfWeekName(_date: string | Date = new Date()): string {
  // 测试：返回明天的星期几
  const tomorrow = dayjs().add(1, 'day').toDate()
  const day = getDayOfWeek(tomorrow)
  const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return names[day]
}

/**
 * 判断是否是今天
 * @param date 日期
 * @returns 是否是今天
 */
export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  return dayjs(date1).diff(dayjs(date2), 'day')
}

