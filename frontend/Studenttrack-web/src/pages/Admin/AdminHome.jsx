import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBookOpen, FiCheckSquare, FiAlertCircle, FiBarChart2, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { dashboardAPI, reportsAPI } from '../../services/api';
import { useDeferredEffect } from '../../hooks/useDeferredEffect';
import toast from 'react-hot-toast';

export default function AdminHome() {
  const [stats, setStats]           = useState(null);
  const [sessions, setSessions]     = useState([]);
  const [lowAtt, setLowAtt]         = useState([]);
  const [monthly, setMonthly]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [dashRes, monthRes] = await Promise.all([
        dashboardAPI.get(),
        reportsAPI.monthly({}),
      ]);
      const d = dashRes.data.data;
      setStats(d.stats);
      setSessions(d.recentSessions || []);
      setLowAtt(d.lowAttendance || []);
      setMonthly(monthRes.data.data || []);
    } catch {
      if (!silent) toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useDeferredEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #DBEAFE', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  const chartData = monthly.map(m => ({ course: m.code, rate: parseFloat(m.avg_attendance_pct) || 0 }));

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Live system overview — Landmark Metropolitan University</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #064E3B, #10B981)', borderRadius: 18, padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: 6 }}>System Status</p>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>All Systems Operational ✓</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>👥 {stats?.total_students || 0} Students</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>📚 {stats?.sessions_today || 0} Sessions Today</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>📊 {stats?.avg_attendance_30d ? `${stats.avg_attendance_30d}%` : 'N/A'} (30d avg)</span>
          </div>
        </div>
        <Link to="/admin/reports" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '12px 20px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          View Reports <FiArrowRight />
        </Link>
      </div>

      {/* Main stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: stats?.total_students ?? '—', sub: 'Enrolled students', icon: <FiUsers size={22} />, color: '#2563EB', bg: '#DBEAFE', to: '/admin/students' },
          { label: 'Total Lecturers', value: stats?.total_lecturers ?? '—', sub: 'Active lecturers', icon: <FiBookOpen size={22} />, color: '#7C3AED', bg: '#EDE9FE', to: '/admin/lecturers' },
          { label: 'Present Today', value: stats?.present_today ?? '—', sub: `${stats?.sessions_today || 0} sessions today`, icon: <FiCheckSquare size={22} />, color: '#10B981', bg: '#D1FAE5', to: '/admin/attendance' },
          { label: 'Active Courses', value: stats?.total_courses ?? '—', sub: 'All departments', icon: <FiBarChart2 size={22} />, color: '#F59E0B', bg: '#FEF3C7', to: '/admin/courses' },
        ].map(s => (
          <Link key={s.label} to={s.to} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
                <FiArrowRight size={14} color="#94A3B8" />
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.7rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginTop: 4 }}>{s.label}</p>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Low attendance alerts */}
      {lowAtt.length > 0 && (
        <div style={{ background: '#FEF3C7', borderRadius: 14, padding: '16px 20px', borderLeft: '4px solid #F59E0B', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <FiAlertCircle size={20} color="#F59E0B" />
            <p style={{ fontWeight: 700, color: '#92400E' }}>⚠️ {lowAtt.length} student(s) with low attendance (&lt;75%)</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {lowAtt.slice(0, 5).map((s, i) => (
              <span key={i} style={{ background: 'rgba(245,158,11,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>
                {s.name} — {s.code} ({s.pct}%)
              </span>
            ))}
            {lowAtt.length > 5 && <span style={{ fontSize: '0.78rem', color: '#92400E' }}>+{lowAtt.length - 5} more</span>}
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Monthly course attendance */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Course Attendance</p>
              <p className="card-subtitle">Average % this month per course</p>
            </div>
            <Link to="/admin/reports" className="btn btn-outline btn-sm">Details</Link>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="course" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.8rem' }} formatter={(v) => [`${v}%`, 'Attendance']} />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.rate >= 75 ? '#10B981' : d.rate >= 60 ? '#F59E0B' : '#EF4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>No data yet</div>
          )}
        </div>

        {/* Recent sessions */}
        <div className="card">
          <div className="card-header">
            <p className="card-title">Recent Sessions</p>
            <Link to="/admin/attendance" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {sessions.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No sessions in the last 7 days</p>
          ) : (
            sessions.slice(0, 6).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < Math.min(sessions.length, 6) - 1 ? '1px solid #F1F5F9' : 'none', alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, background: '#F8FAFC', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📋</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>{s.code} — {s.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.session_date} · {s.lecturer} · {s.present}/{s.total_students} present</p>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6, background: s.status === 'closed' ? '#D1FAE5' : '#FEF3C7', color: s.status === 'closed' ? '#065F46' : '#92400E', fontWeight: 600 }}>{s.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Manage Students', to: '/admin/students', color: '#2563EB', bg: '#DBEAFE', icon: '👥' },
          { label: 'Manage Lecturers', to: '/admin/lecturers', color: '#7C3AED', bg: '#EDE9FE', icon: '👨‍🏫' },
          { label: 'Attendance Records', to: '/admin/attendance', color: '#10B981', bg: '#D1FAE5', icon: '📋' },
          { label: 'System Settings', to: '/admin/settings', color: '#F59E0B', bg: '#FEF3C7', icon: '⚙️' },
        ].map(l => (
          <Link key={l.label} to={l.to} style={{ background: l.bg, borderRadius: 12, padding: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${l.color}25`, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <span style={{ fontSize: '1.4rem' }}>{l.icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: l.color }}>{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
