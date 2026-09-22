import { useEffect, useMemo, useState } from 'react'
import { obtenerTestXPaciente } from '../lib/testXPacienteApi'
import BarList from './charts/BarList'
import StatTile from './charts/StatTile'
import DataTable from './charts/DataTable'
import PuntosDetalleModal from './PuntosDetalleModal'
import logo from './Img/panel_logo_login.svg'

const USUARIO_VALIDO = 'admin'
const CONTRASENA_VALIDA = 'admin123'
const AUTH_KEY = 'dashboard-auth'

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none'

const selectClass =
  'rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none'

// En el Dashboard el riesgo es binario: sin riesgo (< 2 puntos) o con riesgo (>= 2 puntos).
const NIVEL_RIESGO_LABELS = { sin_riesgo: 'Sin riesgo', con_riesgo: 'Con riesgo' }
const NIVEL_RIESGO_COLORS = { sin_riesgo: '#0ca30c', con_riesgo: '#d03b3b' }

function nivelRiesgo(puntos) {
  return (puntos ?? 0) >= 2 ? 'con_riesgo' : 'sin_riesgo'
}

function formatIsoDate(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function hoyIso() {
  return formatIsoDate(new Date())
}

function primerDiaDelMesIso() {
  const hoy = new Date()
  return formatIsoDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
}

function riesgoDataPara(registros) {
  const conteo = { sin_riesgo: 0, con_riesgo: 0 }
  registros.forEach((registro) => {
    conteo[nivelRiesgo(registro.puntos)] += 1
  })
  return Object.keys(NIVEL_RIESGO_LABELS).map((key) => ({
    label: NIVEL_RIESGO_LABELS[key],
    value: conteo[key],
    color: NIVEL_RIESGO_COLORS[key],
  }))
}

function DashboardLogin({ onSuccess }) {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()
    if (usuario === USUARIO_VALIDO && contrasena === CONTRASENA_VALIDA) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setError(null)
      onSuccess()
    } else {
      setError('Usuario o contraseña incorrectos.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/10 p-4">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={logo} alt="Medicall24" className="h-16 w-auto" />
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Ingresá tus credenciales para continuar.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Usuario</span>
          <input
            type="text"
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            className={inputClass}
            autoFocus
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Contraseña</span>
          <input
            type="password"
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
            className={inputClass}
            required
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="mt-2 w-full rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}

function DashboardContent({ onLogout }) {
  const [registros, setRegistros] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState(null)
  const [puntosSeleccionados, setPuntosSeleccionados] = useState(null)

  const [fechaInicio, setFechaInicio] = useState(primerDiaDelMesIso)
  const [fechaFinal, setFechaFinal] = useState(hoyIso)
  const [filtroRiesgo, setFiltroRiesgo] = useState('Todos')
  const [filtroSexo, setFiltroSexo] = useState('Todos')
  const [filtroHospitalizado, setFiltroHospitalizado] = useState('Todos')

  function cargarDatos({ esActualizacion = false } = {}) {
    if (esActualizacion) setActualizando(true)
    else setCargando(true)

    return obtenerTestXPaciente()
      .then((data) => {
        setRegistros(data)
        setError(null)
      })
      .catch((err) => setError(err.message || 'No se pudo cargar la información.'))
      .finally(() => {
        setCargando(false)
        setActualizando(false)
      })
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const filtrados = useMemo(() => {
    if (!registros) return []
    return registros.filter((registro) => {
      const fechaTest = registro.fecha_test ? registro.fecha_test.slice(0, 10) : null
      if (fechaInicio && (!fechaTest || fechaTest < fechaInicio)) return false
      if (fechaFinal && (!fechaTest || fechaTest > fechaFinal)) return false
      if (filtroRiesgo !== 'Todos' && nivelRiesgo(registro.puntos) !== filtroRiesgo) return false
      if (filtroSexo !== 'Todos' && registro.sexo !== filtroSexo) return false
      if (filtroHospitalizado !== 'Todos') {
        const esHospitalizado = filtroHospitalizado === 'true'
        if (Boolean(registro.hospitalizado) !== esHospitalizado) return false
      }
      return true
    })
  }, [registros, fechaInicio, fechaFinal, filtroRiesgo, filtroSexo, filtroHospitalizado])

  const total = filtrados.length
  const promedioPuntos = total ? (filtrados.reduce((sum, r) => sum + (r.puntos ?? 0), 0) / total).toFixed(1) : '0'
  const enRiesgo = filtrados.filter((r) => nivelRiesgo(r.puntos) === 'con_riesgo').length
  const pctRiesgo = total ? Math.round((enRiesgo / total) * 100) : 0
  const hospitalizados = filtrados.filter((r) => r.hospitalizado).length
  const pctHospitalizados = total ? Math.round((hospitalizados / total) * 100) : 0

  const riesgoData = riesgoDataPara(filtrados)
  const sexoData = [
    { label: 'Masculino', value: filtrados.filter((r) => r.sexo === 'M').length },
    { label: 'Femenino', value: filtrados.filter((r) => r.sexo === 'F').length },
  ]
  const hospitalizadoData = [
    { label: 'Hospitalizado', value: filtrados.filter((r) => r.hospitalizado).length },
    { label: 'No hospitalizado', value: filtrados.filter((r) => !r.hospitalizado).length },
  ]

  const riesgoMasculino = riesgoDataPara(filtrados.filter((r) => r.sexo === 'M'))
  const riesgoFemenino = riesgoDataPara(filtrados.filter((r) => r.sexo === 'F'))
  const riesgoHospitalizado = riesgoDataPara(filtrados.filter((r) => r.hospitalizado))
  const riesgoNoHospitalizado = riesgoDataPara(filtrados.filter((r) => !r.hospitalizado))

  const puntosData = useMemo(() => {
    const conteo = new Map()
    filtrados.forEach((registro) => {
      const puntos = registro.puntos ?? 0
      conteo.set(puntos, (conteo.get(puntos) ?? 0) + 1)
    })
    return [...conteo.entries()]
      .sort(([a], [b]) => a - b)
      .map(([puntos, value]) => ({ label: String(puntos), value, puntos }))
  }, [filtrados])

  const registrosPuntosSeleccionados = useMemo(() => {
    if (puntosSeleccionados == null) return []
    return filtrados.filter((registro) => (registro.puntos ?? 0) === puntosSeleccionados)
  }, [filtrados, puntosSeleccionados])

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY)
    onLogout()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 print:max-w-none print:gap-4 print:p-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Medicall24" className="h-12 w-auto shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard MST</h1>
            <p className="text-sm text-gray-500">Análisis de tests aplicados, por puntos, sexo y hospitalización.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cargarDatos({ esActualizacion: true })}
            disabled={cargando || actualizando}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-brand px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <svg
              className={`h-4 w-4 ${actualizando ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {actualizando ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 sm:flex-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
              />
            </svg>
            Imprimir
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 sm:flex-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3"
              />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="hidden items-center gap-3 print:flex">
        <img src={logo} alt="Medicall24" className="h-10 w-auto" />
        <h1 className="text-xl font-bold text-gray-900">Dashboard MST — Gráficas</h1>
      </div>

      {cargando && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Cargando información...
        </div>
      )}

      {error && !cargando && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>
      )}

      {!cargando && !error && registros && (
        <>
          <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Fecha inicio</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={selectClass}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Fecha final</span>
              <input
                type="date"
                value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)}
                className={selectClass}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Puntos (nivel de riesgo)</span>
              <select value={filtroRiesgo} onChange={(e) => setFiltroRiesgo(e.target.value)} className={selectClass}>
                <option value="Todos">Todos</option>
                {Object.keys(NIVEL_RIESGO_LABELS).map((key) => (
                  <option key={key} value={key}>
                    {NIVEL_RIESGO_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Sexo</span>
              <select value={filtroSexo} onChange={(e) => setFiltroSexo(e.target.value)} className={selectClass}>
                <option value="Todos">Todos</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Hospitalizado</span>
              <select
                value={filtroHospitalizado}
                onChange={(e) => setFiltroHospitalizado(e.target.value)}
                className={selectClass}
              >
                <option value="Todos">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Registros filtrados" value={total} />
            <StatTile label="Promedio de puntos" value={promedioPuntos} />
            <StatTile label="% en riesgo" value={`${pctRiesgo}%`} sub="Puntos ≥ 2" />
            <StatTile label="% hospitalizados" value={`${pctHospitalizados}%`} />
          </div>

          {total === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              No hay registros que coincidan con los filtros seleccionados.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 md:col-span-2 print:break-inside-avoid">
                <h4 className="text-sm font-semibold text-gray-900">Distribución por nivel de riesgo (puntos)</h4>
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

              <BarList title="Distribución por sexo" data={sexoData} />
              <BarList title="Distribución por hospitalización" data={hospitalizadoData} />

              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 md:col-span-2 print:break-inside-avoid">
                <h4 className="text-sm font-semibold text-gray-900">Riesgo por sexo</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <BarList title="Masculino" data={riesgoMasculino} />
                  <BarList title="Femenino" data={riesgoFemenino} />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 md:col-span-2 print:break-inside-avoid">
                <h4 className="text-sm font-semibold text-gray-900">Riesgo por hospitalización</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <BarList title="Hospitalizados" data={riesgoHospitalizado} />
                  <BarList title="No hospitalizados" data={riesgoNoHospitalizado} />
                </div>
              </div>

              <div className="md:col-span-2">
                <BarList
                  title={
                    <>
                      Distribución por puntos (cantidad de pacientes){' '}
                      <span className="print:hidden">— clic en una barra para ver el detalle</span>
                    </>
                  }
                  data={puntosData}
                  onItemClick={(item) => setPuntosSeleccionados(item.puntos)}
                  leftLabel="Puntos totales del test"
                  rightLabel="N.º de pacientes"
                />
              </div>
            </div>
          )}

          <div className="print:hidden">
            <DataTable registros={filtrados} />
          </div>

          {puntosSeleccionados != null && (
            <PuntosDetalleModal
              puntos={puntosSeleccionados}
              registros={registrosPuntosSeleccionados}
              onClose={() => setPuntosSeleccionados(null)}
            />
          )}
        </>
      )}
    </div>
  )
}

function Dashboard() {
  const [autenticado, setAutenticado] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'true')

  if (!autenticado) {
    return <DashboardLogin onSuccess={() => setAutenticado(true)} />
  }

  return <DashboardContent onLogout={() => setAutenticado(false)} />
}

export default Dashboard
