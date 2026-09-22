import { Fragment, useMemo, useState } from 'react'
import { exportarExcel } from '../../lib/exportExcel'
import ExcelButton from './ExcelButton'

const filterInputClass =
  'w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none'

const DETALLE_CAMPOS = [
  { key: 'tipo_id', label: 'Tipo de identificación' },
  { key: 'fecha_nacimiento', label: 'Fecha de nacimiento' },
  { key: 'email', label: 'Correo electrónico' },
  { key: 'celular', label: 'Celular' },
  { key: 'nombre_acudiente', label: 'Nombre del acudiente' },
  { key: 'parentesco', label: 'Parentesco' },
  { key: 'telefono_acudiente', label: 'Celular del acudiente' },
  { key: 'nit_ips', label: 'NIT IPS' },
  { key: 'nit_institucion', label: 'NIT institución' },
  { key: 'id_paciente', label: 'ID paciente' },
  { key: 'id_profesional', label: 'ID profesional' },
]

function formatFechaHora(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

function DataTable({ registros }) {
  const [tablaAbierta, setTablaAbierta] = useState(false)
  const [expandidos, setExpandidos] = useState(() => new Set())
  const [filtroIdTest, setFiltroIdTest] = useState('')
  const [filtroNumId, setFiltroNumId] = useState('')
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroSexo, setFiltroSexo] = useState('Todos')
  const [filtroHospitalizado, setFiltroHospitalizado] = useState('Todos')
  const [filtroPuntos, setFiltroPuntos] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')

  function toggleFila(id) {
    setExpandidos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtrados = useMemo(() => {
    return registros.filter((registro) => {
      if (filtroIdTest && !String(registro.id_test ?? '').toLowerCase().includes(filtroIdTest.toLowerCase())) return false

      if (filtroNumId && !String(registro.num_id ?? '').toLowerCase().includes(filtroNumId.toLowerCase())) return false

      const nombreCompleto = `${registro.nombres ?? ''} ${registro.apellidos ?? ''}`.toLowerCase()
      if (filtroNombre && !nombreCompleto.includes(filtroNombre.toLowerCase())) return false

      if (filtroSexo !== 'Todos' && registro.sexo !== filtroSexo) return false

      if (filtroHospitalizado !== 'Todos' && Boolean(registro.hospitalizado) !== (filtroHospitalizado === 'true'))
        return false

      if (filtroPuntos !== '' && String(registro.puntos ?? '') !== filtroPuntos) return false

      if (filtroFecha && !String(registro.fecha_test ?? '').toLowerCase().includes(filtroFecha.toLowerCase()))
        return false

      return true
    })
  }, [registros, filtroIdTest, filtroNumId, filtroNombre, filtroSexo, filtroHospitalizado, filtroPuntos, filtroFecha])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setTablaAbierta((prev) => !prev)}
        aria-expanded={tablaAbierta}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Detalle de registros</h4>
          <p className="text-xs text-gray-500">
            {tablaAbierta
              ? `${filtrados.length} de ${registros.length} registro(s)`
              : `${registros.length} registro(s) disponibles`}
          </p>
        </div>
        <span className={`text-lg text-gray-400 transition-transform ${tablaAbierta ? 'rotate-90' : ''}`}>›</span>
      </button>

      {tablaAbierta && (
        <>
          <div className="flex justify-end">
            <ExcelButton onClick={() => exportarExcel(filtrados, 'dashboard-mst')} disabled={filtrados.length === 0} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="w-6 py-2"></th>
                  <th className="px-2 py-2 font-medium">ID test</th>
                  <th className="px-2 py-2 font-medium">Número ID</th>
                  <th className="px-2 py-2 font-medium">Nombre</th>
                  <th className="px-2 py-2 font-medium">Sexo</th>
                  <th className="px-2 py-2 font-medium">Hospitalizado</th>
                  <th className="px-2 py-2 font-medium">Puntos</th>
                  <th className="px-2 py-2 font-medium">Fecha del test</th>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-1.5"></th>
                  <th className="px-2 py-1.5">
                    <input
                      type="text"
                      value={filtroIdTest}
                      onChange={(e) => setFiltroIdTest(e.target.value)}
                      placeholder="Filtrar..."
                      className={filterInputClass}
                    />
                  </th>
                  <th className="px-2 py-1.5">
                    <input
                      type="text"
                      value={filtroNumId}
                      onChange={(e) => setFiltroNumId(e.target.value)}
                      placeholder="Filtrar..."
                      className={filterInputClass}
                    />
                  </th>
                  <th className="px-2 py-1.5">
                    <input
                      type="text"
                      value={filtroNombre}
                      onChange={(e) => setFiltroNombre(e.target.value)}
                      placeholder="Filtrar..."
                      className={filterInputClass}
                    />
                  </th>
                  <th className="px-2 py-1.5">
                    <select value={filtroSexo} onChange={(e) => setFiltroSexo(e.target.value)} className={filterInputClass}>
                      <option value="Todos">Todos</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </th>
                  <th className="px-2 py-1.5">
                    <select
                      value={filtroHospitalizado}
                      onChange={(e) => setFiltroHospitalizado(e.target.value)}
                      className={filterInputClass}
                    >
                      <option value="Todos">Todos</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </th>
                  <th className="px-2 py-1.5">
                    <input
                      type="text"
                      value={filtroPuntos}
                      onChange={(e) => setFiltroPuntos(e.target.value)}
                      placeholder="Ej: 2"
                      className={filterInputClass}
                    />
                  </th>
                  <th className="px-2 py-1.5">
                    <input
                      type="text"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      placeholder="Ej: 2026-09"
                      className={filterInputClass}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      Sin resultados para estos filtros.
                    </td>
                  </tr>
                )}

                {filtrados.map((registro) => {
                  const id = registro.id_test ?? `${registro.id_paciente}-${registro.fecha_test}`
                  const filaAbierta = expandidos.has(id)
                  return (
                    <Fragment key={id}>
                      <tr
                        onClick={() => toggleFila(id)}
                        className="cursor-pointer border-b border-gray-100 text-gray-700 hover:bg-gray-50"
                      >
                        <td className="py-2 pl-2 text-gray-400">
                          <span className={`inline-block transition-transform ${filaAbierta ? 'rotate-90' : ''}`}>›</span>
                        </td>
                        <td className="px-2 py-2 font-semibold tabular-nums">{registro.id_test ?? '—'}</td>
                        <td className="px-2 py-2">{registro.num_id ?? '—'}</td>
                        <td className="px-2 py-2">
                          {registro.nombres} {registro.apellidos}
                        </td>
                        <td className="px-2 py-2">{registro.sexo === 'F' ? 'Femenino' : 'Masculino'}</td>
                        <td className="px-2 py-2">{registro.hospitalizado ? 'Sí' : 'No'}</td>
                        <td className="px-2 py-2 font-semibold tabular-nums">{registro.puntos ?? '—'}</td>
                        <td className="px-2 py-2">{formatFechaHora(registro.fecha_test)}</td>
                      </tr>
                      {filaAbierta && (
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <td colSpan={8} className="px-4 py-3">
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-3">
                              {DETALLE_CAMPOS.map((campo) => (
                                <div key={campo.key}>
                                  <dt className="text-[11px] text-gray-500">{campo.label}</dt>
                                  <dd className="text-xs font-medium text-gray-800">
                                    {registro[campo.key] === '' || registro[campo.key] == null
                                      ? '—'
                                      : String(registro[campo.key])}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default DataTable
