import * as XLSX from 'xlsx'

export function exportarExcel(registros, nombreArchivo = 'dashboard-mst') {
  const hoja = XLSX.utils.json_to_sheet(registros)
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, 'Tests')
  XLSX.writeFile(libro, `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
