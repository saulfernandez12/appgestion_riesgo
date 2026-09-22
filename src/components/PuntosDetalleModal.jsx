import { exportarExcel } from '../lib/exportExcel'
import ExcelButton from './charts/ExcelButton'

function formatFechaHora(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

function PuntosDetalleModal({ puntos, registros, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/30 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Pacientes con {puntos} {puntos === 1 ? 'punto' : 'puntos'}
            </h2>
            <p className="text-xs text-gray-500">{registros.length} registro(s)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          <div className="flex justify-end">
            <ExcelButton
              onClick={() => exportarExcel(registros, `pacientes-${puntos}-puntos`)}
              disabled={registros.length === 0}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-2 py-2 font-medium">ID test</th>
                  <th className="px-2 py-2 font-medium">Número ID</th>
                  <th className="px-2 py-2 font-medium">Nombre</th>
                  <th className="px-2 py-2 font-medium">Sexo</th>
                  <th className="px-2 py-2 font-medium">Hospitalizado</th>
                  <th className="px-2 py-2 font-medium">Fecha del test</th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Sin registros.
                    </td>
                  </tr>
                )}
                {registros.map((registro) => (
                  <tr
                    key={registro.id_test ?? `${registro.id_paciente}-${registro.fecha_test}`}
                    className="border-b border-gray-100 text-gray-700"
                  >
                    <td className="px-2 py-2 font-semibold tabular-nums">{registro.id_test ?? '—'}</td>
                    <td className="px-2 py-2">{registro.num_id ?? '—'}</td>
                    <td className="px-2 py-2">
                      {registro.nombres} {registro.apellidos}
                    </td>
                    <td className="px-2 py-2">{registro.sexo === 'F' ? 'Femenino' : 'Masculino'}</td>
                    <td className="px-2 py-2">{registro.hospitalizado ? 'Sí' : 'No'}</td>
                    <td className="px-2 py-2">{formatFechaHora(registro.fecha_test)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PuntosDetalleModal
