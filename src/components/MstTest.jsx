import { useState } from 'react'
import { APETITO_OPTIONS, CANTIDAD_OPTIONS, PESO_PERDIDA_OPTIONS, calculateMstScore, riskLevelFor } from '../lib/mstScoring'
import { saveMstResult } from '../lib/storage'
import { calculateAge } from '../lib/age'
import { guardarTestMaestro } from '../lib/testMaestroApi'
import {
  ESTADO_ADMISION_OPTIONS,
  SERVICIO_OPTIONS,
  REGIMEN_OPTIONS,
  TIPO_CARGO_OPTIONS,
  ESTADO_CUENTA_OPTIONS,
} from '../lib/adminCatalog'
import CheckOption from './CheckOption'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'
import ChartsModal from './ChartsModal'
import logo from './Img/panel_logo_login.svg'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_ADMIN = {
  estadoAdmision: ESTADO_ADMISION_OPTIONS[0],
  fechaNota: todayIso(),
  agrupa: '',
  servicio: SERVICIO_OPTIONS[0],
  regimen: REGIMEN_OPTIONS[0],
  entidad: '',
  tipoCargo: TIPO_CARGO_OPTIONS[0],
  estadoCuenta: ESTADO_CUENTA_OPTIONS[0],
}

const selectClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none'

function formatFecha(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

function formatSexo(sexo) {
  if (sexo === 'M') return 'Masculino'
  if (sexo === 'F') return 'Femenino'
  return sexo
}

const RISK_META = {
  neutral: {
    container: 'border-gray-200 bg-gray-50',
    text: 'text-gray-700',
    badge: 'text-gray-900',
    message: null,
  },
  warning: {
    container: 'border-amber-300 bg-amber-50',
    text: 'text-amber-800',
    badge: 'text-amber-700',
    message: 'Paciente en riesgo de desnutrición',
  },
  danger: {
    container: 'border-red-300 bg-red-50',
    text: 'text-red-800',
    badge: 'text-red-700',
    message: 'Paciente en riesgo de desnutrición',
  },
}

function MstTest({ patient }) {
  const [pesoPerdida, setPesoPerdida] = useState('')
  const [cantidadPerdida, setCantidadPerdida] = useState('')
  const [apetito, setApetito] = useState('')
  const [admin, setAdmin] = useState(EMPTY_ADMIN)
  const [saved, setSaved] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(null)

  function updateAdmin(field, value) {
    setAdmin((prev) => ({ ...prev, [field]: value }))
  }

  const cantidadHabilitada = pesoPerdida === 'si' || pesoPerdida === 'no_seguro'

  function handlePesoPerdidaSelect(value) {
    setPesoPerdida(value)
    if (value !== 'si' && value !== 'no_seguro') setCantidadPerdida('')
  }

  const total = calculateMstScore({ pesoPerdida, cantidadPerdida, apetito })
  const risk = riskLevelFor(total)
  const meta = RISK_META[risk]

  const formCompleto = pesoPerdida !== '' && apetito !== ''

  async function handleGuardar() {
    if (!formCompleto) return

    setGuardando(true)
    try {
      await guardarTestMaestro({ idPaciente: patient.idPaciente, puntos: total })
      saveMstResult(patient, { pesoPerdida, cantidadPerdida, apetito, total, risk }, admin)
      setSaved(true)
    } catch (error) {
      console.error('No se pudo guardar el test', error)
      setErrorGuardado(error.message || 'No se pudo guardar el test. Intenta nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  function handleAceptar() {
    window.location.reload()
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Datos del paciente</h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Tipo de identificación</dt>
            <dd className="text-sm font-medium text-gray-900">{patient.tipoIdentificacion}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Número de identificación</dt>
            <dd className="text-sm font-medium text-gray-900">{patient.numeroIdentificacion}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Nombres</dt>
            <dd className="text-sm font-medium text-gray-900">{patient.nombres}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Apellidos</dt>
            <dd className="text-sm font-medium text-gray-900">{patient.apellidos}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Sexo</dt>
            <dd className="text-sm font-medium text-gray-900">{formatSexo(patient.sexo)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Fecha de nacimiento</dt>
            <dd className="text-sm font-medium text-gray-900">{formatFecha(patient.fechaNacimiento)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Edad</dt>
            <dd className="text-sm font-medium text-gray-900">{calculateAge(patient.fechaNacimiento)} años</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Correo electrónico</dt>
            <dd className="text-sm font-medium text-gray-900">{patient.correo}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Celular</dt>
            <dd className="text-sm font-medium text-gray-900">{patient.celular}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <img src={logo} alt="Medicall24" className="h-16 w-auto" />
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Herramienta de tamizaje de desnutrición (MST)</h1>
        <p className="max-w-xl text-sm text-gray-600">
          El MST (Malnutrition Screening Tool) es una herramienta rápida de tamizaje nutricional que identifica,
          a partir de la pérdida de peso involuntaria y la disminución del apetito, a los pacientes en riesgo de
          desnutrición. Una sumatoria de 2 puntos o más indica riesgo y amerita una valoración nutricional
          completa.
        </p>
      </div>

      <div className="flex flex-col gap-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-900">¿Ha perdido peso de manera involuntaria?</h3>
          <div className="flex flex-col gap-2">
            {PESO_PERDIDA_OPTIONS.map((option) => (
              <CheckOption
                key={option.value}
                label={option.label}
                points={option.points}
                checked={pesoPerdida === option.value}
                onSelect={() => handlePesoPerdidaSelect(option.value)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
          <h3 className={`text-sm font-semibold ${cantidadHabilitada ? 'text-gray-900' : 'text-gray-400'}`}>
            En caso afirmativo, indique cuánto:
          </h3>
          <div className="flex flex-col gap-2">
            {CANTIDAD_OPTIONS.map((option) => (
              <CheckOption
                key={option.value}
                label={option.label}
                points={option.points}
                checked={cantidadPerdida === option.value}
                disabled={!cantidadHabilitada}
                onSelect={() => setCantidadPerdida(option.value)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-900">¿Come mal por tener menos apetito?</h3>
          <div className="flex flex-col gap-2">
            {APETITO_OPTIONS.map((option) => (
              <CheckOption
                key={option.value}
                label={option.label}
                points={option.points}
                checked={apetito === option.value}
                onSelect={() => setApetito(option.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`flex flex-col gap-1 rounded-lg border p-4 ${meta.container}`}>
        <span className={`text-sm font-semibold ${meta.text}`}>
          Sumatoria: <span className={`text-base font-bold tabular-nums ${meta.badge}`}>{total}</span>{' '}
          {total === 1 ? 'punto' : 'puntos'}
        </span>
        {meta.message && <span className={`text-sm font-medium ${meta.text}`}>{meta.message}</span>}
      </div>


      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleGuardar}
          disabled={!formCompleto || guardando}
          className="w-full rounded bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        {!formCompleto && (
          <p className="text-center text-xs text-gray-500">
            Responda la pregunta de pérdida de peso y la de apetito para guardar.
          </p>
        )}
        
      </div>

      {saved && <SuccessModal onAccept={handleAceptar} />}
      {showCharts && <ChartsModal onClose={() => setShowCharts(false)} />}
      {errorGuardado && (
        <ErrorModal title="No se pudo guardar el test" message={errorGuardado} onClose={() => setErrorGuardado(null)} />
      )}
    </div>
  )
}

export default MstTest
