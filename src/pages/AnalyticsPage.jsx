import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
const CITY_COORDS = {
  'Mumbai':    [19.0760, 72.8777],
  'Delhi':     [28.6139, 77.2090],
  'Bangalore': [12.9716, 77.5946],
  'Chennai':   [13.0827, 80.2707],
  'Kolkata':   [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Pune':      [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur':    [26.9124, 75.7873],
  'Lucknow':   [26.8467, 80.9462],
  'Surat':     [21.1702, 72.8311],
  'Chandigarh':[30.7333, 76.7794],
  'Bhopal':    [23.2599, 77.4126],
  'Nagpur':    [21.1458, 79.0882],
  'Indore':    [22.7196, 75.8577],
  'Kochi':     [9.9312,  76.2673],
  'Patna':     [25.5941, 85.1376],
  'Vadodara':  [22.3072, 73.1812],
  'Goa':       [15.2993, 74.1240],
  'Visakhapatnam': [17.6868, 83.2185],
}
function SalaryBarChart({ data }) {
  const maxSalary = Math.max(...data.map(d => d.totalSalary), 1)
  const chartW = 600
  const chartH = 260
  const padL = 80
  const padB = 60
  const padT = 20
  const padR = 20
  const innerW = chartW - padL - padR
  const innerH = chartH - padB - padT
  const barWidth = Math.floor(innerW / data.length) - 8
  const formatK = (v) => v >= 1000000 ? `₹${(v/1000000).toFixed(1)}M` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`
  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(frac => {
        const y = padT + innerH * (1 - frac)
        return (
          <g key={frac}>
            <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
            <text x={padL - 8} y={y + 4} textAnchor="end" style={{ fontSize: '9px', fill: 'rgba(148,163,184,0.8)', fontFamily: 'Inter,sans-serif' }}>
              {formatK(Math.round(maxSalary * frac))}
            </text>
          </g>
        )
      })}
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1={padL} y1={padT + innerH} x2={chartW - padR} y2={padT + innerH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {data.map((d, i) => {
        const barH = Math.max(2, (d.totalSalary / maxSalary) * innerH)
        const x = padL + i * (innerW / data.length) + 4
        const y = padT + innerH - barH
        return (
          <g key={d.city}>
            <rect x={x + 2} y={y + 2} width={barWidth} height={barH} rx="4" fill="rgba(0,0,0,0.3)" />
            <rect x={x} y={y} width={barWidth} height={barH} rx="4" fill="url(#barGrad)" style={{ transition: 'all 0.3s' }} />
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" style={{ fontSize: '7px', fill: '#c7d2fe', fontFamily: 'Inter,sans-serif', fontWeight: '600' }}>
              {formatK(d.totalSalary)}
            </text>
            <text x={x + barWidth / 2} y={padT + innerH + 14} textAnchor="middle" style={{ fontSize: '8.5px', fill: 'rgba(148,163,184,0.9)', fontFamily: 'Inter,sans-serif', fontWeight: '500' }}>
              {d.city.length > 9 ? d.city.slice(0, 8) + '…' : d.city}
            </text>
            <text x={x + barWidth / 2} y={padT + innerH + 26} textAnchor="middle" style={{ fontSize: '7px', fill: 'rgba(99,102,241,0.8)', fontFamily: 'Inter,sans-serif' }}>
              ({d.count})
            </text>
          </g>
        )
      })}
      <text x={chartW / 2} y={12} textAnchor="middle" style={{ fontSize: '10px', fill: 'rgba(241,245,249,0.6)', fontFamily: 'Inter,sans-serif', letterSpacing: '0.05em' }}>
        TOTAL SALARY DISTRIBUTION PER CITY (₹)
      </text>
    </svg>
  )
}
export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [auditImage, setAuditImage] = useState(null)
  useEffect(() => {
    setAuditImage(sessionStorage.getItem('jotish_audit_image'))
    const fetchData = async () => {
      try {
        const res = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test', password: '123456' }),
        })
        const json = await res.json()
        const rawData = json.TABLE_DATA?.data || []
        const rows = rawData.map((d, i) => ({
          id: i + 1,
          name: d[0] || 'Unknown',
          department: d[1] || 'Unknown',
          city: d[2] || 'Unknown',
          age: d[3] || '0',
          joined: d[4] || '',
          salary: (d[5] || '').replace(/[\$,]/g, '') || '0',
          email: `${(d[0] || 'user').toLowerCase().replace(/\s+/g, '.')}@company.com`,
          status: 'Active'
        }))
        setEmployees(rows)
      } catch {
        
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  const cityData = useMemo(() => {
    const map = {}
    employees.forEach(emp => {
      const city = emp.city || 'Unknown'
      const salary = Number(emp.salary) || 0
      if (!map[city]) map[city] = { city, totalSalary: 0, count: 0 }
      map[city].totalSalary += salary
      map[city].count++
    })
    return Object.values(map).sort((a, b) => b.totalSalary - a.totalSalary).slice(0, 12)
  }, [employees])
  const stats = useMemo(() => {
    if (!employees.length) return {}
    const salaries = employees.map(e => Number(e.salary)).filter(Boolean)
    const avg = salaries.reduce((a, b) => a + b, 0) / (salaries.length || 1)
    const max = Math.max(...salaries)
    const activePct = Math.round((employees.filter(e => e.status === 'Active' || e.status === '1').length / employees.length) * 100)
    return { total: employees.length, avg: Math.round(avg), max, activePct }
  }, [employees])
  const mapCenter = [20.5937, 78.9629]
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-content fade-in" style={{ overflowY: 'auto', padding: '16px 20px', gap: '16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Analytics Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{employees.length} employees</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/list')}>← Back to Grid</button>
        </div>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
              {[
                { label: 'Total Employees', value: stats.total?.toLocaleString(), color: '#6366f1', icon: '👥' },
                { label: 'Avg. Salary', value: `₹${stats.avg?.toLocaleString('en-IN')}`, color: '#10b981', icon: '💰' },
                { label: 'Max Salary', value: `₹${stats.max?.toLocaleString('en-IN')}`, color: '#f59e0b', icon: '🏆' },
                { label: 'Active Rate', value: `${stats.activePct}%`, color: '#ec4899', icon: '✅' },
              ].map(kpi => (
                <div key={kpi.label} className="card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{kpi.icon}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: kpi.color }}>{kpi.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{kpi.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: auditImage ? '1fr 2fr' : '1fr', gap: '16px' }}>
              {auditImage && (
                <div className="card" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Image</h3>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <img src={auditImage} alt="Audit" style={{ width: '100%', display: 'block' }} />
                  </div>
                </div>
              )}
              <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salary Distribution</h3>
                <SalaryBarChart data={cityData} />
              </div>
            </div>
            <div className="card" style={{ padding: '16px', minHeight: '320px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Geospatial Distribution</h3>
              <div style={{ borderRadius: '10px', overflow: 'hidden', height: '270px' }}>
                <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {cityData.map(d => {
                    const coords = CITY_COORDS[d.city]
                    if (!coords) return null
                    return (
                      <Marker key={d.city} position={coords}>
                        <Popup>
                          <div style={{ fontFamily: 'Inter,sans-serif', minWidth: '140px' }}>
                            <strong style={{ fontSize: '13px' }}>{d.city}</strong><br />
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Employees: {d.count}</span><br />
                            <span style={{ fontSize: '11px', color: '#6366f1' }}>Total: ₹{d.totalSalary.toLocaleString('en-IN')}</span>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  })}
                </MapContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
