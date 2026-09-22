import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MstTest from './components/MstTest'
import PatientModal from './components/PatientModal'
import Dashboard from './components/Dashboard'
import NotFound from './components/NotFound'
import Footer from './components/Footer'

function Inicio() {
  const [patient, setPatient] = useState(null)

  return (
    <>
      {!patient && <PatientModal onContinue={setPatient} />}
      {patient && <MstTest patient={patient} />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-light via-sky-50 to-white print:bg-none print:bg-white">
        <div className="bg-medical-grid pointer-events-none absolute inset-0 opacity-60 print:hidden" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
          <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute top-1/4 -right-32 h-[26rem] w-[26rem] rounded-full bg-teal-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
        </div>

        <div className="relative flex flex-1 flex-col">
          <div className="flex flex-1 flex-col">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
