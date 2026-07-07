import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCheckSquare, FiRefreshCw, FiClock, FiBook } from 'react-icons/fi';
import { MdOutlineQrCode2 } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useDeferredEffect } from '../../hooks/useDeferredEffect';
import toast from 'react-hot-toast';

export default function LecturerHome() {
  const { user } = useAuth();
  const [courses, setCourses]     = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const { data } = await dashboardAPI.get();
      setCourses(data.data.courses || []);
      setSessions(data.data.todaySessions || []);
    } catch { if (!silent) toast.error('Failed to load dashboard'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useDeferredEffect(() => { load(); }, []);

  const chartData = courses.map(c => ({ code: c.code, pct: parseFloat(c.avg_attendance) || 0 }));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #EDE9FE', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Your teaching overview for today</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'My Courses',     value: courses.length, color: '#7C3AED', bg: '#EDE9FE', icon: <FiBook size={22} /> },
          { label: 'Total Enrolled', value: courses.reduce((a, c) => a + (c.enrolled || 0), 0), color: '#2563EB', bg: '#DBEAFE', icon: <FiUsers size={22} /> },
          { label: "Today's Sessions", value: sessions.length, color: '#10B981', bg: '#D1FAE5', icon: <FiClock size={22} /> },
          { label: 'Sessions Held',  value: courses.reduce((a, c) => a + (c.sessions_held || 0), 0), color: '#F59E0B', bg: '#FEF3C7', icon: <FiCheckSquare size={22} /> },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 12 }}>{s.icon}</div>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1.7rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Course attendance chart */}
        <div className="card">
          <div className="card-header">
            <div><p className="card-title">Course Attendance</p><p className="card-subtitle">Average % per course</p></div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.8rem' }} formatter={v => [`${v}%`, 'Attendance']} />
                <Bar dataKey="pct" radius={[6,6,0,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.pct >= 75 ? '#10B981' : d.pct >= 60 ? '#F59E0B' : '#EF4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>No sessions held yet</div>
          )}
        </div>

        {/* Today's sessions */}
        <div className="card">
          <div className="card-header">
            <p className="card-title">Today's Sessions</p>
            <Link to="/lecturer/take-attendance" className="btn btn-primary btn-sm"><MdOutlineQrCode2 size={14} /> Take Attendance</Link>
          </div>
          {sessions.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#94A3B8' }}>
              <FiClock size={32} color="#CBD5E1" />
              <p style={{ marginTop: 8, fontSize: '0.875rem' }}>No sessions scheduled today</p>
              <Link to="/lecturer/take-attendance" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>Start Session</Link>
            </div>
          ) : sessions.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < sessions.length - 1 ? '1px solid #F1F5F9' : 'none', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, background: s.status === 'open' ? '#D1FAE5' : '#F1F5F9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📋</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>{s.code} — {s.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.start_time}</p>
              </div>
              <span style={{ background: s.status === 'open' ? '#D1FAE5' : '#F1F5F9', color: s.status === 'open' ? '#065F46' : '#64748B', padding: '3px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My courses */}
      <div className="card">
        <div className="card-header">
          <p className="card-title">My Courses</p>
          <Link to="/lecturer/summary" className="btn btn-outline btn-sm">Full Summary</Link>
        </div>
        {courses.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '20px 0', fontSize: '0.875rem' }}>No courses assigned</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {courses.map(c => (
              <div key={c.id} style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px 16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <code style={{ background: '#EDE9FE', color: '#7C3AED', padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 700 }}>{c.code}</code>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: c.avg_attendance >= 75 ? '#10B981' : c.avg_attendance ? '#F59E0B' : '#94A3B8' }}>
                    {c.avg_attendance != null ? `${parseFloat(c.avg_attendance).toFixed(1)}%` : 'No data'}
                  </span>
                </div>
                <p style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem', marginBottom: 4 }}>{c.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{c.enrolled} students · {c.sessions_held} sessions</p>
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, parseFloat(c.avg_attendance) || 0)}%`, background: c.avg_attendance >= 75 ? '#10B981' : '#F59E0B', borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
