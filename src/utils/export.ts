import * as XLSX from 'xlsx'

/**
 * 导出数据到 Excel
 * @param data 要导出的数据
 * @param filename 文件名
 * @param sheetName 工作表名称
 */
export function exportToExcel<T = any>(
  data: T[],
  filename: string = 'export.xlsx',
  sheetName: string = 'Sheet1'
): void {
  if(!filename.endsWith('.xlsx')){
    filename += '.xlsx'
  }

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  
  // 将数据转换为工作表
  const ws = XLSX.utils.json_to_sheet(data)
  
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  
  // 导出文件
  XLSX.writeFile(wb, filename)
}

/**
 * 从 Excel 文件读取数据
 * @param file Excel 文件
 * @returns Promise<any[]>
 */
export function importFromExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        // 读取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 将工作表转换为 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = (error) => {
      reject(error)
    }
    
    reader.readAsBinaryString(file)
  })
}

/**
 * 下载文件
 * @param url 文件 URL
 * @param filename 文件名
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

