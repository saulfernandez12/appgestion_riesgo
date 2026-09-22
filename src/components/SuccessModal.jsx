function SuccessModal({ onAccept }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/30 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg bg-white p-6 text-center shadow-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-8 w-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">¡Información guardada!</h2>
          <p className="text-sm text-gray-600">
            Los datos del paciente y el resultado del test de MST se almacenaron de manera exitosa.
          </p>
        </div>

        <button
          type="button"
          onClick={onAccept}
          className="mt-2 w-full rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default SuccessModal
