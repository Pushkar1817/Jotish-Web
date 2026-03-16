import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useVirtualScroll } from '../hooks/useVirtualScroll'
const ROW_HEIGHT = 52
const VIEWPORT_HEIGHT = window.innerHeight - 60 - 110
const COL_KEYS = [
  { key: 'id',         label: 'ID',         width: '60px' },
  { key: 'name',       label: 'Name',        width: '180px' },
  { key: 'email',      label: 'Email',       width: '220px' },
  { key: 'city',       label: 'City',        width: '120px' },
  { key: 'salary',     label: 'Salary',      width: '110px' },
  { key: 'department', label: 'Department',  width: '150px' },
  { key: 'status',     label: 'Status',      width: '100px' },
]
export default function ListPage() {
  const navigate = useNavigate()
  const [allData, setAllData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' })
  const containerRef = useRef(null)
  const [viewportH, setViewportH] = useState(VIEWPORT_HEIGHT)
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setViewportH(containerRef.current.clientHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  useEffect(() => {
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
          name: d[0],
          department: d[1],
          city: d[2],
          age: d[3],
          joined: d[4],
          salary: d[5]?.replace(/[\$,]/g, '') || '0',
          email: `${d[0].toLowerCase().replace(/\s+/g, '.')}@company.com`,
          status: 'Active'
        }))
        setAllData(rows)
        setFilteredData(rows)
      } catch (e) {
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  useEffect(() => {
    const q = search.toLowerCase()
    let result = !q ? allData : allData.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    )
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const av = a[sortConfig.key] ?? '', bv = b[sortConfig.key] ?? ''
        const cmp = isNaN(av) ? String(av).localeCompare(String(bv)) : Number(av) - Number(bv)
        return sortConfig.dir === 'asc' ? cmp : -cmp
      })
    }
    setFilteredData(result)
  }, [search, allData, sortConfig])
  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }
  const { scrollRef, onScroll, startIndex, endIndex, totalHeight, offsetY } =
    useVirtualScroll({ totalItems: filteredData.length, rowHeight: ROW_HEIGHT, viewportHeight: viewportH })
  const visibleRows = filteredData.slice(startIndex, endIndex + 1)
  const formatSalary = (v) => {
    const n = Number(v)
    return isNaN(n) ? v : `₹${n.toLocaleString('en-IN')}`
  }
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-content fade-in">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          background: 'rgba(15,22,41,0.6)', flexShrink: 0, flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="form-input"
              style={{ paddingLeft: '34px', height: '36px', fontSize: '0.85rem' }}
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="info-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            {filteredData.length.toLocaleString()} records
          </div>
          <div className="info-pill" style={{ fontSize: '0.72rem' }}>
            Virtual rows: {startIndex}–{endIndex}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/analytics')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Analytics →
          </button>
        </div>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div style={{ padding: '16px' }}><div className="error-box">{error}</div></div>
        ) : null}
        {!loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `${COL_KEYS.map(c => c.width).join(' ')} 1fr`,
              padding: '0 16px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(15,22,41,0.9)',
              flexShrink: 0,
            }}>
              {COL_KEYS.map(col => (
                <button
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '10px 8px', color: sortConfig.key === col.key ? 'var(--accent-light)' : 'var(--text-secondary)',
                    fontSize: '0.73rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em',
                    display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit',
                    transition: 'color 0.2s', whiteSpace: 'nowrap'
                  }}
                >
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span style={{ fontSize: '0.8rem' }}>{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ))}
              <div style={{ padding: '10px 8px', color: 'var(--text-secondary)', fontSize: '0.73rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Action
              </div>
            </div>
            <div
              ref={scrollRef}
              onScroll={onScroll}
              style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
            >
              <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${offsetY}px)` }}>
                  {visibleRows.map((row, localIdx) => {
                    const globalIdx = startIndex + localIdx
                    const isEven = globalIdx % 2 === 0
                    return (
                      <div
                        key={row.id ?? globalIdx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `${COL_KEYS.map(c => c.width).join(' ')} 1fr`,
                          padding: '0 16px',
                          height: `${ROW_HEIGHT}px`,
                          alignItems: 'center',
                          background: isEven ? 'rgba(255,255,255,0.02)' : 'transparent',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = isEven ? 'rgba(255,255,255,0.02)' : 'transparent'}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.id}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email}</span>
                        <span className="badge badge-purple" style={{ justifySelf: 'start' }}>{row.city}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#34d399' }}>{formatSalary(row.salary)}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.department}</span>
                        <span className={`badge ${row.status === 'Active' || row.status === '1' || row.status === 'active' ? 'badge-green' : 'badge-amber'}`} style={{ justifySelf: 'start' }}>
                          {row.status === '1' ? 'Active' : row.status === '0' ? 'Inactive' : row.status || 'Active'}
                        </span>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ justifySelf: 'start' }}
                          onClick={() => navigate(`/details/${row.id}`)}
                        >
                          View →
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
