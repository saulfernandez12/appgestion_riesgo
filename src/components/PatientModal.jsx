import { useRef, useState } from 'react'
import { esMenorDeEdad, requiereAcompanante } from '../lib/age'
import { buscarPacientePorIdentificacion, crearPaciente } from '../lib/pacienteApi'
import ErrorModal from './ErrorModal'
import logo from './Img/panel_logo_login.svg'

const TIPO_IDENTIFICACION_OPTIONS = [
  { value: 'CC', label: 'Cédula Ciudadanía' },
  { value: 'CD', label: 'Carné Diplomático' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'DE', label: 'Documento Extranjero' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'PE', label: 'Permiso Especial del Permanencia' },
  { value: 'PT', label: 'Permiso por protección temporal' },
  { value: 'RC', label: 'Registro Civil de Nacimiento' },
  { value: 'SC', label: 'Salvoconducto de Permanencia' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
]

const EMPTY_FORM = {
  idPaciente: null,
  hospitalizado: '',
  ips: '',
  tipoIdentificacion: '',
  numeroIdentificacion: '',
  nombres: '',
  apellidos: '',
  sexo: '',
  fechaNacimiento: '',
  correo: '',
  celular: '',
  registrarAcompanante: false,
  acudienteParentesco: '',
  acudienteNombre: '',
  acudienteCelular: '',
  aceptaTratamientoDatos: false,
}

const PARENTESCO_OPTIONS = [
  'Abuelo (a)',
  'Compañero (a)',
  'Esposo (a)',
  'Hermano (a)',
  'Hijo (a)',
  'Madre',
  'Nieto (a)',
  'Ninguno',
  'Nuera',
  'Padre',
  'Primo (a)',
  'Sobrino (a)',
  'Tio (a)',
  'Yerno',
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DIAS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

const MESES = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

const CURRENT_YEAR = new Date().getFullYear()
const ANIOS = Array.from({ length: CURRENT_YEAR - 1910 + 1 }, (_, i) => String(CURRENT_YEAR - i))

function isFormComplete(form) {
  return (
    form.hospitalizado !== '' &&
    form.tipoIdentificacion !== '' &&
    form.numeroIdentificacion.trim() !== '' &&
    form.nombres.trim() !== '' &&
    form.apellidos.trim() !== '' &&
    form.sexo !== '' &&
    form.fechaNacimiento !== '' &&
    (!(requiereAcompanante(form.fechaNacimiento) || form.registrarAcompanante) ||
      (form.acudienteParentesco !== '' &&
        form.acudienteNombre.trim() !== '' &&
        form.acudienteCelular.length === 10)) &&
    EMAIL_REGEX.test(form.correo.trim()) &&
    form.celular.length === 10 &&
    form.aceptaTratamientoDatos
  )
}

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none'

function normalizarSexo(valor) {
  const normalizado = valor.trim().toUpperCase()
  if (normalizado === 'M' || normalizado === 'MASCULINO') return 'M'
  if (normalizado === 'F' || normalizado === 'FEMENINO') return 'F'
  return ''
}

function construirPayloadPaciente(form) {
  return {
    tipo_id: form.tipoIdentificacion,
    num_id: form.numeroIdentificacion.trim(),
    nombres: form.nombres.trim(),
    apellidos: form.apellidos.trim(),
    sexo: form.sexo,
    fecha_nacimiento: form.fechaNacimiento,
    email: form.correo.trim(),
    celular: form.celular.trim(),
    nombre_acudiente: form.acudienteNombre.trim(),
    parentesco: form.acudienteParentesco,
    telefono_acudiente: form.acudienteCelular.trim(),
    hospitalizado: form.hospitalizado === 'Sí',
    nit_ips: form.ips,
  }
}

function PatientModal({ onContinue }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [dia, setDia] = useState('')
  const [mes, setMes] = useState('')
  const [anio, setAnio] = useState('')
  const [buscandoPaciente, setBuscandoPaciente] = useState(false)
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null)
  const [guardandoPaciente, setGuardandoPaciente] = useState(false)
  const [errorPaciente, setErrorPaciente] = useState(null)
  const ultimaBusquedaRef = useRef('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleCelularChange(field, value) {
    update(field, value.replace(/\D/g, '').slice(0, 10))
  }

  function handleNumeroIdentificacionChange(value) {
    update('numeroIdentificacion', value)
    setPacienteEncontrado(null)
  }

  function aplicarPacienteEncontrado(paciente) {
    update('idPaciente', paciente.id)
    if (paciente.nombres) update('nombres', paciente.nombres)
    if (paciente.apellidos) update('apellidos', paciente.apellidos)
    if (paciente.sexo) update('sexo', normalizarSexo(paciente.sexo))
    if (paciente.fecha_nacimiento) {
      const [anioEncontrado, mesEncontrado, diaEncontrado] = paciente.fecha_nacimiento.slice(0, 10).split('-')
      setDia(diaEncontrado)
      setMes(mesEncontrado)
      setAnio(anioEncontrado)
      update('fechaNacimiento', `${anioEncontrado}-${mesEncontrado}-${diaEncontrado}`)
    }
    if (paciente.email) update('correo', paciente.email)
    if (paciente.celular) handleCelularChange('celular', paciente.celular)
  }

  async function buscarPaciente() {
    const numeroId = form.numeroIdentificacion.trim()
    if (numeroId === '' || numeroId === ultimaBusquedaRef.current) return
    ultimaBusquedaRef.current = numeroId

    setBuscandoPaciente(true)
    try {
      const paciente = await buscarPacientePorIdentificacion(numeroId)
      if (form.numeroIdentificacion.trim() !== numeroId) return
      if (paciente) {
        aplicarPacienteEncontrado(paciente)
        setPacienteEncontrado(true)
      } else {
        setPacienteEncontrado(false)
      }
    } catch (error) {
      console.error('No se pudo consultar el paciente', error)
    } finally {
      setBuscandoPaciente(false)
    }
  }

  function updateFecha(nextDia, nextMes, nextAnio) {
    const fecha = nextDia && nextMes && nextAnio ? `${nextAnio}-${nextMes}-${nextDia}` : ''
    update('fechaNacimiento', fecha)
  }

  function handleDiaChange(value) {
    setDia(value)
    updateFecha(value, mes, anio)
  }

  function handleMesChange(value) {
    setMes(value)
    updateFecha(dia, value, anio)
  }

  function handleAnioChange(value) {
    setAnio(value)
    updateFecha(dia, mes, value)
  }

  const acompananteObligatorio = form.fechaNacimiento !== '' && requiereAcompanante(form.fechaNacimiento)
  const registrarAcompanante = acompananteObligatorio || form.registrarAcompanante

  const complete = isFormComplete(form)

  function esIdPacienteValido(idPaciente) {
    return typeof idPaciente === 'number' && idPaciente >= 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!complete) return

    if (pacienteEncontrado === true) {
      if (esIdPacienteValido(form.idPaciente)) {
        onContinue(form)
      } else {
        setErrorPaciente('No se pudo validar el identificador del paciente. Verifica el número de identificación e intenta nuevamente.')
      }
      return
    }

    if (pacienteEncontrado === false) {
      setGuardandoPaciente(true)
      try {
        const creado = await crearPaciente(construirPayloadPaciente(form))
        if (esIdPacienteValido(creado?.id)) {
          onContinue({ ...form, idPaciente: creado.id })
        } else {
          setErrorPaciente('No se pudo crear el paciente. Intenta nuevamente.')
        }
      } catch (error) {
        console.error('No se pudo crear el paciente', error)
        setErrorPaciente('No se pudo crear el paciente. Intenta nuevamente.')
      } finally {
        setGuardandoPaciente(false)
      }
      return
    }

    setErrorPaciente('No se pudo validar el número de identificación. Verifica el dato e intenta nuevamente.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/10 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={logo} alt="Medicall24" className="h-16 w-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Herramienta de tamizaje de desnutrición (MST)</h1>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h2 className="text-lg font-semibold text-gray-900">Datos del paciente</h2>
          <p className="text-sm text-gray-500">Completá todos los campos para continuar con el test.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">¿Estás hospitalizado?</span>
          <select
            value={form.hospitalizado}
            onChange={(event) => update('hospitalizado', event.target.value)}
            className={inputClass}
            required
          >
            <option value="" disabled>
              Seleccione
            </option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </label>

        {form.hospitalizado === 'Sí' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Nombre de la IPS</span>
            <select
              value={form.ips}
              onChange={(event) => update('ips', event.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Seleccionar...
              </option>
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Tipo de identificación</span>
          <select
            value={form.tipoIdentificacion}
            onChange={(event) => update('tipoIdentificacion', event.target.value)}
            className={inputClass}
            required
          >
            <option value="" disabled>
              Seleccionar...
            </option>
            {TIPO_IDENTIFICACION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Número de identificación</span>
          <input
            type="text"
            value={form.numeroIdentificacion}
            onChange={(event) => handleNumeroIdentificacionChange(event.target.value)}
            onBlur={buscarPaciente}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                buscarPaciente()
              }
            }}
            className={inputClass}
            required
          />
          {buscandoPaciente && <span className="text-xs text-gray-500">Buscando paciente...</span>}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Nombres</span>
          <input
            type="text"
            value={form.nombres}
            onChange={(event) => update('nombres', event.target.value)}
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Apellidos</span>
          <input
            type="text"
            value={form.apellidos}
            onChange={(event) => update('apellidos', event.target.value)}
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Sexo</span>
          <select
            value={form.sexo}
            onChange={(event) => update('sexo', event.target.value)}
            className={inputClass}
            required
          >
            <option value="" disabled>
              Seleccionar...
            </option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Fecha de nacimiento</span>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={dia}
              onChange={(event) => handleDiaChange(event.target.value)}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Día
              </option>
              {DIAS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              value={mes}
              onChange={(event) => handleMesChange(event.target.value)}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Mes
              </option>
              {MESES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={anio}
              onChange={(event) => handleAnioChange(event.target.value)}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Año
              </option>
              {ANIOS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={registrarAcompanante}
            disabled={acompananteObligatorio}
            onChange={(event) => update('registrarAcompanante', event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
          />
          <span>Registrar datos de un acompañante.</span>
        </label>

        {registrarAcompanante && (
          <div className="flex flex-col gap-3 rounded border border-gray-200 bg-gray-50 p-3">
            <span className="text-sm font-medium text-gray-700">
              {esMenorDeEdad(form.fechaNacimiento) ? 'Datos del acudiente' : 'Datos del acompañante'}
            </span>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500">Parentesco con el paciente</span>
              <select
                value={form.acudienteParentesco}
                onChange={(event) => update('acudienteParentesco', event.target.value)}
                className={inputClass}
                required
              >
                <option value="" disabled>
                  Seleccionar...
                </option>
                {PARENTESCO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500">Nombres y apellidos</span>
              <input
                type="text"
                value={form.acudienteNombre}
                onChange={(event) => update('acudienteNombre', event.target.value)}
                className={inputClass}
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500">Celular acudiente</span>
              <input
                type="tel"
                inputMode="numeric"
                value={form.acudienteCelular}
                onChange={(event) => handleCelularChange('acudienteCelular', event.target.value)}
                className={inputClass}
                required
              />
              {form.acudienteCelular.length > 0 && form.acudienteCelular.length < 10 && (
                <span className="text-xs text-red-600">Faltan {10 - form.acudienteCelular.length} dígitos.</span>
              )}
            </label>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Correo electrónico</span>
          <input
            type="email"
            value={form.correo}
            onChange={(event) => update('correo', event.target.value)}
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Celular</span>
          <input
            type="tel"
            inputMode="numeric"
            value={form.celular}
            onChange={(event) => handleCelularChange('celular', event.target.value)}
            className={inputClass}
            required
          />
          {form.celular.length > 0 && form.celular.length < 10 && (
            <span className="text-xs text-red-600">Faltan {10 - form.celular.length} dígitos.</span>
          )}
        </label>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.aceptaTratamientoDatos}
            onChange={(event) => update('aceptaTratamientoDatos', event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand/30"
            required
          />
          <span>Acepto el tratamiento de mis datos personales.</span>
        </label>

        <button
          type="submit"
          disabled={!complete || guardandoPaciente}
          className="mt-2 w-full rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardandoPaciente ? 'Guardando...' : 'Continuar con test'}
        </button>
      </form>

      {errorPaciente && <ErrorModal message={errorPaciente} onClose={() => setErrorPaciente(null)} />}
    </div>
  )
}

export default PatientModal
