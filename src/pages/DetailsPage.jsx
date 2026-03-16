import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
const STEPS = ['Employee Info', 'Capture Photo', 'Sign & Verify', 'Audit Image']
export default function DetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)
  const photoCanvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const sigCanvasRef = useRef(null)
  const [isSigning, setIsSigning] = useState(false)
  const [signatureData, setSignatureData] = useState(null)
  const lastPos = useRef({ x: 0, y: 0 })
  const [auditImage, setAuditImage] = useState(null)
  useEffect(() => {
    const fetchEmployee = async () => {
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
        const emp = rows.find(r => String(r.id) === String(id))
        setEmployee(emp)
      } catch {
        
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
    return () => stopStream()
  }, [id])
  const stopStream = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
  }
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        videoRef.current.play()
      }
    } catch {
      alert('Camera access denied')
    }
  }
  useEffect(() => {
    if (step === 1) startCamera()
    if (step !== 1) stopStream()
  }, [step])
  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = photoCanvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 480
    canvas.height = video.videoHeight || 360
    canvas.getContext('2d').drawImage(video, 0, 0)
    setCapturedPhoto(canvas.toDataURL('image/png'))
    stopStream()
    setStep(2)
  }
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }
  const startSign = (e) => {
    e.preventDefault()
    setIsSigning(true)
    lastPos.current = getPos(e, sigCanvasRef.current)
  }
  const drawSign = (e) => {
    e.preventDefault()
    if (!isSigning) return
    const ctx = sigCanvasRef.current.getContext('2d')
    const pos = getPos(e, sigCanvasRef.current)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }
  const endSign = (e) => {
    e.preventDefault()
    setIsSigning(false)
    setSignatureData(sigCanvasRef.current.toDataURL('image/png'))
  }
  const clearSignature = () => {
    const canvas = sigCanvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
  }
  const mergeImages = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 480; canvas.height = 360
    const ctx = canvas.getContext('2d')
    const photo = new Image()
    photo.src = capturedPhoto
    await new Promise(r => { photo.onload = r })
    ctx.drawImage(photo, 0, 0, canvas.width, canvas.height)
    const sig = new Image()
    sig.src = sigCanvasRef.current.toDataURL('image/png')
    await new Promise(r => { sig.onload = r })
    ctx.globalAlpha = 0.85
    ctx.drawImage(sig, 0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1
    ctx.font = 'bold 13px Inter, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 4
    ctx.fillText(`ID: ${id}  ${employee?.name || ''}  ${new Date().toLocaleString()}`, 10, canvas.height - 10)
    const merged = canvas.toDataURL('image/png')
    setAuditImage(merged)
    sessionStorage.setItem('jotish_audit_image', merged)
    setStep(3)
  }
  const downloadAudit = () => {
    const a = document.createElement('a')
    a.href = auditImage
    a.download = `audit_${id}_${Date.now()}.png`
    a.click()
  }
  if (loading) return (
    <div className="app-shell"><Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    </div>
  )
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-content fade-in" style={{ overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                borderRadius: '99px', fontSize: '0.78rem', fontWeight: '600',
                background: i === step ? 'var(--accent)' : i < step ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                color: i === step ? 'white' : i < step ? '#34d399' : 'var(--text-muted)',
                border: `1px solid ${i === step ? 'var(--accent)' : i < step ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                transition: 'all 0.3s'
              }}>
                {i < step ? '✓' : i + 1}. {s}
              </div>
              {i < STEPS.length - 1 && <div style={{ width: '24px', height: '1px', background: 'var(--border)' }} />}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {step === 0 && employee && (
            <div className="card fade-in" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '4px' }}>Employee Profile</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.875rem' }}>Verify identity before proceeding</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                {[
                  { label: 'Full Name', value: employee.name },
                  { label: 'Employee ID', value: `#${employee.id}` },
                  { label: 'Email', value: employee.email },
                  { label: 'Department', value: employee.department },
                  { label: 'City', value: employee.city },
                  { label: 'Salary', value: employee.salary ? `₹${Number(employee.salary).toLocaleString('en-IN')}` : '—' },
                  { label: 'Status', value: employee.status || 'Active' },
                  { label: 'Phone', value: employee.phone || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" onClick={() => navigate('/list')}>← Back to List</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>Proceed to Camera →</button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="card fade-in" style={{ padding: '28px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '4px' }}>Capture Photo</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.875rem' }}>Position your face in the frame</p>
              <div style={{ position: 'relative', display: 'inline-block', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-active)' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ display: 'block', width: '480px', maxWidth: '100%' }} />
                {['0 0', '0 auto auto 0', 'auto 0 0 auto', 'auto auto 0 0'].map((inset, i) => (
                  <div key={i} style={{
                    position: 'absolute', width: '20px', height: '20px', border: '2px solid var(--accent)',
                    borderRight: i === 0||i===2 ? 'none' : undefined, borderLeft: i===1||i===3 ? 'none' : undefined,
                    borderBottom: i === 0||i===1 ? 'none' : undefined, borderTop: i===2||i===3 ? 'none' : undefined,
                    ...Object.fromEntries(inset.split(' ').map((v,j)=>([['top','right','bottom','left'][j],v==='auto'?'auto':'8px']))),
                  }} />
                ))}
              </div>
              <canvas ref={photoCanvasRef} style={{ display: 'none' }} />
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" onClick={capturePhoto}>Capture Photo</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="card fade-in" style={{ padding: '28px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '4px' }}>Sign on Photo</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.875rem' }}>Draw your signature over the captured photo</p>
              <div style={{ position: 'relative', display: 'inline-block', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-active)' }}>
                <img src={capturedPhoto} alt="Captured" style={{ display: 'block', width: '480px', maxWidth: '100%' }} />
                <canvas
                  ref={sigCanvasRef} width={480} height={360}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none' }}
                  onMouseDown={startSign} onMouseMove={drawSign} onMouseUp={endSign} onMouseLeave={endSign}
                  onTouchStart={startSign} onTouchMove={drawSign} onTouchEnd={endSign}
                />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Retake</button>
                <button className="btn btn-ghost btn-sm" onClick={clearSignature}>Clear Signature</button>
                <button className="btn btn-primary" onClick={mergeImages} disabled={!signatureData}>Merge & Generate Audit</button>
              </div>
            </div>
          )}
          {step === 3 && auditImage && (
            <div className="card fade-in" style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Audit Image Generated</h2>
              </div>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(16,185,129,0.4)', display: 'inline-block', boxShadow: '0 0 30px rgba(16,185,129,0.15)' }}>
                <img src={auditImage} alt="Audit" style={{ display: 'block', width: '480px', maxWidth: '100%' }} />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={() => { setStep(0); setAuditImage(null); setCapturedPhoto(null); setSignatureData(null) }}>Start Over</button>
                <button className="btn btn-ghost" onClick={downloadAudit}>Download</button>
                <button className="btn btn-primary" onClick={() => navigate('/analytics')}>View Analytics →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
