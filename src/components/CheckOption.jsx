// Fila de opción con apariencia de checkbox, pero de selección única dentro
// de su grupo (equivalente a un radio): al hacer click se marca esta y se
// desmarcan las demás porque el padre solo guarda un `value` seleccionado.
function CheckOption({ label, points, checked, onSelect, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={checked}
      className={`flex w-full items-center justify-between gap-3 rounded border px-3 py-2.5 text-left text-sm transition-colors ${
        disabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
          : checked
            ? 'border-brand bg-brand-light text-gray-900'
            : 'border-gray-300 bg-white text-gray-700 hover:border-brand'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            disabled
              ? 'border-gray-300 bg-gray-100'
              : checked
                ? 'border-brand bg-brand'
                : 'border-gray-300 bg-white'
          }`}
        >
          {checked && (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-2.5 w-2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        {label}
      </span>
      <span className={`shrink-0 text-xs font-semibold tabular-nums ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
        {points} {points === 1 ? 'punto' : 'puntos'}
      </span>
    </button>
  )
}

export default CheckOption
