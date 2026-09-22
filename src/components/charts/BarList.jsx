const DEFAULT_COLOR = '#2a78d6'

function BarList({
  title,
  data,
  color = DEFAULT_COLOR,
  emptyMessage = 'Sin datos para este filtro.',
  onItemClick,
  leftLabel,
  rightLabel,
}) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>

      {data.length === 0 ? (
        <p className="text-xs text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {(leftLabel || rightLabel) && (
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
              <span className="w-28 shrink-0 sm:w-36">{leftLabel}</span>
              <span className="flex-1"></span>
              <span className="shrink-0 whitespace-nowrap text-right">{rightLabel}</span>
            </div>
          )}
          {data.map((item) => {
            const contenido = (
              <>
                <span className="w-28 shrink-0 truncate text-xs text-gray-600 sm:w-36">{item.label}</span>
                <div className="h-3 flex-1 rounded-sm bg-gray-100">
                  <div
                    className="h-3 rounded-r"
                    style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color ?? color }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-700">
                  {item.value}
                </span>
              </>
            )

            if (onItemClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onItemClick(item)}
                  title={`${item.label}: ${item.value} — clic para ver el detalle`}
                  className="flex w-full items-center gap-2 rounded transition-colors hover:bg-gray-50"
                >
                  {contenido}
                </button>
              )
            }

            return (
              <div key={item.label} className="flex items-center gap-2" title={`${item.label}: ${item.value}`}>
                {contenido}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BarList
