import { useState, useEffect, useMemo } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiSearch, FiUsers, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { dashboardAPI, attendanceAPI } from '../../services/api';

const STATUS_BTN = [
  { key: 'present', icon: <FiCheckCircle size={14} />, color: '#10B981', bg: '#D1FAE5' },
  { key: 'late', icon: <FiAlertCircle size={14} />, color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'absent', icon: <FiXCircle size={14} />, color: '#EF4444', bg: '#FEE2E2' },
];

const todayISO = () => new Date().toISOString().split('T')[0];
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

export default function AttendanceTaking() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [session, setSession] = useState(null); // { sessionId, qrDataUrl, expiresAt }
  const [records, setRecords] = useState([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('manual');
  const [busyIds, setBusyIds] = useState(new Set());
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    dashboardAPI.get()
      .then(({ data }) => setCourses(data.data?.courses || []))
      .catch(() => toast.error('Failed to load your courses'))
      .finally(() => setLoadingCourses(false));
  }, []);

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    setLoadingSession(true);
    try {
      const { data } = await attendanceAPI.startSession({ courseId: course.id, sessionDate: todayISO(), startTime: nowHHMM() });
      setSession(data.data);
      await loadRoster(data.data.sessionId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session');
      setSelectedCourse(null);
    } finally {
      setLoadingSession(false);
    }
  };

  const loadRoster = async (sessionId) => {
    const { data } = await attendanceAPI.getSession(sessionId);
    setRecords(data.data.records || []);
  };

  const refreshQR = async () => {
    if (!session) return;
    try {
      const { data } = await attendanceAPI.refreshQR(session.sessionId);
      setSession((s) => ({ ...s, ...data.data }));
      toast.success('QR code refreshed');
    } catch {
      toast.error('Failed to refresh QR code');
    }
  };

  const setStatus = async (studentId, status) => {
    setBusyIds((s) => new Set(s).add(studentId));
    setRecords((prev) => prev.map((r) => (r.student_id === studentId ? { ...r, status } : r)));
    try {
      await attendanceAPI.markByLecturer(session.sessionId, studentId, status);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update attendance');
      loadRoster(session.sessionId);
    } finally {
      setBusyIds((s) => { const next = new Set(s); next.delete(studentId); return next; });
    }
  };

  const markAll = async (status) => {
    const targets = records.filter((r) => r.status !== status);
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
    await Promise.all(targets.map((r) => attendanceAPI.markByLecturer(session.sessionId, r.student_id, status).catch(() => {})));
    loadRoster(session.sessionId);
  };

  const endSession = async () => {
    if (!window.confirm('Close this session? Any student who has not been marked will be recorded as absent.')) return;
    setClosing(true);
    try {
      await attendanceAPI.closeSession(session.sessionId);
      toast.success('Session closed. Absent records generated.');
      setSelectedCourse(null);
      setSession(null);
      setRecords([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close session');
    } finally {
      setClosing(false);
    }
  };

  const filtered = records.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.student_code.toLowerCase().includes(search.toLowerCase())
  );

  const counts = useMemo(() => ({
    present: records.filter((r) => r.status === 'present').length,
    late: records.filter((r) => r.status === 'late').length,
    absent: records.filter((r) => r.status === 'absent').length,
  }), [records]);

  const qrCountdown = useQrCountdown(session?.expiresAt);

  if (loadingCourses) {
    return <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8' }}>Loading your courses…</div>;
  }

  if (!selectedCourse) {
    return (
      <div className="page-enter">
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title">Take Attendance</h1>
          <p className="page-subtitle">Select a class to begin marking attendance.</p>
        </div>
        {courses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
            <FiUsers size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>You have no assigned courses yet</p>
          </div>
        ) : (
          <div className="grid-2">
            {courses.map((c) => (
              <div key={c.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', border: '2px solid #E2E8F0' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                onClick={() => selectCourse(c)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, background: '#EDE9FE', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiUsers size={24} color="#7C3AED" />
                  </div>
                  <span style={{ background: '#F1F5F9', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{c.enrolled} enrolled</span>
                </div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>{c.name}</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.82rem' }}>{c.code} · avg. attendance {c.avg_attendance ?? '—'}%</p>
                <div style={{ marginTop: 14, padding: '8px 12px', background: '#EDE9FE', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiUsers size={14} color="#7C3AED" />
                  <span style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 600 }}>Click to start attendance</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => { setSelectedCourse(null); setSession(null); setRecords([]); }} style={{ background: '#F1F5F9', border: 'none', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div>
          <h1 className="page-title">{selectedCourse.name}</h1>
          <p className="page-subtitle">{selectedCourse.code} · {todayISO()}</p>
        </div>
      </div>

      {loadingSession ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>Starting session…</div>
      ) : (
        <>
          {/* Method toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { key: 'manual', label: '✏️ Manual Entry' },
              { key: 'qr', label: '📱 QR Code' },
            ].map(m => (
              <button key={m.key} onClick={() => setMethod(m.key)} style={{
                padding: '9px 18px', borderRadius: 10, border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                background: method === m.key ? '#7C3AED' : 'white',
                color: method === m.key ? 'white' : '#64748B',
                borderColor: method === m.key ? '#7C3AED' : '#E2E8F0',
              }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* QR Panel */}
          {method === 'qr' && session && (
            <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
              <img src={session.qrDataUrl} alt="Attendance QR code" style={{ width: 220, height: 220, margin: '0 auto', display: 'block' }} />
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.4rem', fontWeight: 800, margin: '12px 0 4px', color: qrCountdown === 'Expired' ? '#EF4444' : '#1E293B' }}>
                {qrCountdown}
              </p>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: 16 }}>Students scan this code to mark themselves present</p>
              <button onClick={refreshQR} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiRefreshCw size={14} /> Refresh QR Code
              </button>
            </div>
          )}

          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Present', count: counts.present, color: '#10B981', bg: '#D1FAE5' },
              { label: 'Late', count: counts.late, color: '#F59E0B', bg: '#FEF3C7' },
              { label: 'Absent', count: counts.absent, color: '#EF4444', bg: '#FEE2E2' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: s.color }}>{s.count}</p>
                <p style={{ fontSize: '0.78rem', color: s.color, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
              <FiSearch className="search-icon" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => markAll('present')} className="btn btn-success btn-sm">✓ All Present</button>
              <button onClick={() => markAll('absent')} className="btn btn-danger btn-sm">✗ All Absent</button>
            </div>
          </div>

          {/* Student list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.student_id}>
                    <td style={{ color: '#94A3B8', width: 40 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: '#1E293B' }}>{r.name}</td>
                    <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{r.student_code}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, opacity: busyIds.has(r.student_id) ? 0.5 : 1 }}>
                        {STATUS_BTN.map(b => (
                          <button key={b.key} disabled={busyIds.has(r.student_id)} onClick={() => setStatus(r.student_id, b.key)} style={{
                            width: 32, height: 32, borderRadius: 8, border: '2px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                            background: r.status === b.key ? b.color : 'white',
                            color: r.status === b.key ? 'white' : b.color,
                            borderColor: r.status === b.key ? b.color : b.color + '60',
                          }}>
                            {b.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={endSession} className="btn btn-danger" disabled={closing}>
              {closing ? 'Closing…' : 'Close Session'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function useQrCountdown(expiresAt) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setLabel(diff <= 0 ? 'Expired' : `${Math.floor(diff / 60)}:${String(diff % 60).padStart(2, '0')}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return label;
}
