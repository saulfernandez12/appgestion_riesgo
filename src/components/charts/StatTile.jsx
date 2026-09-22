function StatTile({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  )
}

export default StatTile
