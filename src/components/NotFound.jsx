import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>

        <span className="text-4xl font-bold tracking-tight text-gray-300">404</span>

        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-gray-900">Página no encontrada</h1>
          <p className="text-sm text-gray-600">
            La ruta que intentás abrir no existe o fue movida. Verificá la dirección e intentá nuevamente.
          </p>
        </div>

        <Link
          to="/"
          className="mt-2 w-full rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound
