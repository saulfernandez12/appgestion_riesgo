import IconoExcel from './IconoExcel'

function ExcelButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded border border-[#217346] bg-white px-3 py-1.5 text-xs font-semibold text-[#217346] transition-colors hover:bg-[#e6f4ec] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <IconoExcel className="h-4 w-4" />
      Exportar a Excel
    </button>
  )
}

export default ExcelButton
