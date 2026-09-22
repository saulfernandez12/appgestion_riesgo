import { useMemo, useState } from 'react'
import { getMstResults } from '../lib/storage'
import { RISK_LABELS, RISK_COLORS } from '../lib/riskMeta'
import BarList from './charts/BarList'
import StatTile from './charts/StatTile'

const SIN_ESPECIFICAR = '(Sin especificar)'

const selectClass =
  'rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none'

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

function countBy(records, keyFn) {
  const map = new Map()
  for (const record of records) {
    const key = keyFn(record) || SIN_ESPECIFICAR
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

function formatMesAnio(key) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
}

function ChartsModal({ onClose }) {
  const allRecords = useMemo(() => getMstResults(), [])

  const [estadoAdmision, setEstadoAdmision] = useState('Todos')
  const [mesAnio, setMesAnio] = useState('Todos')
  const [agrupa, setAgrupa] = useState('Todos')
  const [servicio, setServicio] = useState('Todos')
  const [entidad, setEntidad] = useState('Todos')
  const [tipoCargo, setTipoCargo] = useState('Todos')
  const [estadoCuenta, setEstadoCuenta] = useState('Todos')

  const opciones = useMemo(() => {
    const admins = allRecords.map((record) => record.admin ?? {})
    return {
      estadoAdmision: uniqueSorted(admins.map((admin) => admin.estadoAdmision)),
      servicio: uniqueSorted(admins.map((admin) => admin.servicio)),
      tipoCargo: uniqueSorted(admins.map((admin) => admin.tipoCargo)),
      estadoCuenta: uniqueSorted(admins.map((admin) => admin.estadoCuenta)),
      agrupa: uniqueSorted(admins.map((admin) => admin.agrupa)),
      entidad: uniqueSorted(admins.map((admin) => admin.entidad)),
      mesAnio: uniqueSorted(admins.map((admin) => admin.fechaNota?.slice(0, 7))).sort(),
    }
  }, [allRecords])

  const filtered = useMemo(() => {
    return allRecords.filter((record) => {
      const admin = record.admin ?? {}
      if (estadoAdmision !== 'Todos' && admin.estadoAdmision !== estadoAdmision) return false
      if (mesAnio !== 'Todos' && admin.fechaNota?.slice(0, 7) !== mesAnio) return false
      if (agrupa !== 'Todos' && (admin.agrupa || SIN_ESPECIFICAR) !== agrupa) return false
      if (servicio !== 'Todos' && admin.servicio !== servicio) return false
      if (entidad !== 'Todos' && (admin.entidad || SIN_ESPECIFICAR) !== entidad) return false
      if (tipoCargo !== 'Todos' && admin.tipoCargo !== tipoCargo) return false
      if (estadoCuenta !== 'Todos' && admin.estadoCuenta !== estadoCuenta) return false
      return true
    })
  }, [allRecords, estadoAdmision, mesAnio, agrupa, servicio, entidad, tipoCargo, estadoCuenta])

  const riskCounts = { neutral: 0, warning: 0, danger: 0 }
  filtered.forEach((record) => {
    const risk = record.resultado?.risk
    if (risk in riskCounts) riskCounts[risk] += 1
  })
  const riesgoData = Object.keys(RISK_LABELS).map((key) => ({
    label: RISK_LABELS[key],
    value: riskCounts[key],
    color: RISK_COLORS[key],
  }))

  const admisionData = countBy(filtered, (record) => record.admin?.estadoAdmision)
  const servicioData = countBy(filtered, (record) => record.admin?.servicio)
  const entidadData = countBy(filtered, (record) => {
    const nombreEntidad = record.admin?.entidad || SIN_ESPECIFICAR
    const regimen = record.admin?.regimen
    return regimen ? `${nombreEntidad} · ${regimen}` : nombreEntidad
  })
  const tipoCargoData = countBy(filtered, (record) => record.admin?.tipoCargo)
  const estadoCuentaData = countBy(filtered, (record) => record.admin?.estadoCuenta)
  const agrupaData = countBy(filtered, (record) => record.admin?.agrupa)

  const mensualMap = new Map()
  filtered.forEach((record) => {
    const key = record.admin?.fechaNota?.slice(0, 7)
    if (!key) return
    mensualMap.set(key, (mensualMap.get(key) ?? 0) + 1)
  })
  const mensualData = [...mensualMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ label: formatMesAnio(key), value }))

  const totalRegistros = filtered.length
  const promedioPuntaje = totalRegistros
    ? (filtered.reduce((sum, record) => sum + (record.resultado?.total ?? 0), 0) / totalRegistros).toFixed(1)
    : '0'
  const pctRiesgo = totalRegistros
    ? Math.round(((riskCounts.warning + riskCounts.danger) / totalRegistros) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gráficas para la toma de decisiones</h2>
            <p className="text-xs text-gray-500">{allRecords.length} registro(s) guardado(s) en total</p>
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

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Estado de admisión</span>
              <select value={estadoAdmision} onChange={(e) => setEstadoAdmision(e.target.value)} className={selectClass}>
                <option>Todos</option>
                {opciones.estadoAdmision.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Mes y año (fecha de nota)</span>
              <select value={mesAnio} onChange={(e) => setMesAnio(e.target.value)} className={selectClass}>
                <option>Todos</option>
                {opciones.mesAnio.map((option) => (
                  <option key={option} value={option}>
                    {formatMesAnio(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Agrupa</span>
              <select value={agrupa} onChange={(e) => setAgrupa(e.target.value)} className={selectClass}>
                <option>Todos</option>
                {opciones.agrupa.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Servicio</span>
              <select value={servicio} onChange={(e) => setServicio(e.target.value)} className={selectClass}>
                <option>Todos</option>
                {opciones.servicio.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Entidad</span>
              <select value={entidad} onChange={(e) => setEntidad(e.target.value)} className={selectClass}>
                <option>Todos</option>
                {opciones.entidad.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Tipo de cargo</span>
              <select value={tipoCargo} onChange={(e) => setTipoCargo(e.target.value)} className={selectClass}>
                <option>Todos</option>
                {opciones.tipoCargo.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Estado de cuenta</span>
              <select value={estadoCuenta} onChange={(e) => setEstadoCuenta(e.target.value)} className={selectClass}>
                <option>Todos</option>
                {opciones.estadoCuenta.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Registros filtrados" value={totalRegistros} />
            <StatTile label="Promedio puntaje MST" value={promedioPuntaje} />
            <StatTile label="% en riesgo" value={`${pctRiesgo}%`} sub="Riesgo moderado + alto" />
            <StatTile label="Total histórico" value={allRecords.length} sub="Sin aplicar filtros" />
          </div>

          {totalRegistros === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              No hay registros que coincidan con los filtros seleccionados.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-900">Distribución por nivel de riesgo</h4>
                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  {riesgoData.map((item) => (
                    <span key={item.label} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {riesgoData.map((item) => {
                    const max = Math.max(...riesgoData.map((r) => r.value), 1)
                    return (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="w-32 shrink-0 truncate text-xs text-gray-600 sm:w-36">{item.label}</span>
                        <div className="h-3 flex-1 rounded-sm bg-gray-100">
                          <div
                            className="h-3 rounded-r"
                            style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-700">
                          {item.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <BarList title="Tendencia mensual (fecha de nota)" data={mensualData} />
              <BarList title="Registros por estado de admisión" data={admisionData} />
              <BarList title="Registros por servicio" data={servicioData} />
              <BarList title="Registros por entidad (agrupado por régimen)" data={entidadData} />
              <BarList title="Registros por tipo de cargo" data={tipoCargoData} />
              <BarList title="Registros por estado de cuenta" data={estadoCuentaData} />
              <BarList title="Registros por agrupador" data={agrupaData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChartsModal
