import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiBook, FiCheckCircle, FiClock, FiRefreshCw, FiTrendingUp, FiXCircle } from 'react-icons/fi';
import { MdOutlineQrCode2 } from 'react-icons/md';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import { getSocket, joinCourse } from '../../services/socket';

function AttendanceBadge({ type }) {
  const cfg = {
    present: { bg: '#D1FAE5', color: '#065F46', icon: <FiCheckCircle size={13} />, label: 'Present' },
    absent: { bg: '#FEE2E2', color: '#991B1B', icon: <FiXCircle size={13} />, label: 'Absent' },
    late: { bg: '#FEF3C7', color: '#92400E', icon: <FiAlertCircle size={13} />, label: 'Late' },
    excused: { bg: '#DBEAFE', color: '#1D4ED8', icon: <FiClock size={13} />, label: 'Excused' },
  }[type] || { bg: '#F1F5F9', color: '#64748B', icon: <FiClock size={13} />, label: 'Pending' };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 600 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function StudentHome() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const { data } = await dashboardAPI.get();
      const payload = data.data || {};
      setCourses(payload.courses || []);
      setRecentAttendance(payload.recentAttendance || []);
      setUnreadNotifications(payload.unreadNotifications || 0);
    } catch {
      if (!silent) toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => load());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    courses.forEach((course) => joinCourse(course.id));
  }, [courses]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const refresh = () => load(true);
    socket.on('attendance:marked', refresh);
    socket.on('attendance:session_started', refresh);
    socket.on('attendance:session_closed', refresh);
    socket.on('notification:new', refresh);

    return () => {
      socket.off('attendance:marked', refresh);
      socket.off('attendance:session_started', refresh);
      socket.off('attendance:session_closed', refresh);
      socket.off('notification:new', refresh);
    };
  }, []);

  const totals = useMemo(() => {
    const sessions = courses.reduce((sum, course) => sum + Number(course.sessions_held || 0), 0);
    const attended = courses.reduce((sum, course) => sum + Number(course.attended || 0), 0);
    const missed = Math.max(0, sessions - attended);
    const overallRate = sessions ? Math.round((attended / sessions) * 100) : 0;
    return { sessions, attended, missed, overallRate };
  }, [courses]);

  const chartData = courses.map((course) => ({
    course: course.code,
    rate: Number(course.percentage || 0),
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #DBEAFE', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Good {time.getHours() < 12 ? 'Morning' : time.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Your live attendance overview for this semester.</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1E3A5F, #2563EB)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: 4 }}>Current Time</p>
          <p style={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: '1.8rem', fontWeight: 700 }}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: 4 }}>
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/student/attendance" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', padding: '12px 20px', borderRadius: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.875rem' }}>
          <MdOutlineQrCode2 size={22} /> Mark Attendance
        </Link>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Overall Rate', value: `${totals.overallRate}%`, icon: <FiTrendingUp size={22} />, color: totals.overallRate >= 75 ? '#10B981' : '#EF4444', bg: totals.overallRate >= 75 ? '#D1FAE5' : '#FEE2E2', sub: totals.sessions ? `${totals.attended}/${totals.sessions} attended` : 'No records yet' },
          { label: 'Classes Attended', value: totals.attended, icon: <FiCheckCircle size={22} />, color: '#2563EB', bg: '#DBEAFE', sub: 'Total this semester' },
          { label: 'Classes Missed', value: totals.missed, icon: <FiXCircle size={22} />, color: '#EF4444', bg: '#FEE2E2', sub: 'Absences recorded' },
          { label: 'Notifications', value: unreadNotifications, icon: <FiAlertCircle size={22} />, color: '#7C3AED', bg: '#EDE9FE', sub: 'Unread alerts' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div style={{ width: 44, height: 44, background: stat.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: 12 }}>{stat.icon}</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.7rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginTop: 4 }}>{stat.label}</p>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Course Attendance Trend</p>
              <p className="card-subtitle">Current percentage per enrolled course</p>
            </div>
          </div>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="studentAttendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="course" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.8rem' }} formatter={(value) => [`${value}%`, 'Attendance']} />
                <Area type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2.5} fill="url(#studentAttendanceGradient)" dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>No attendance data yet</div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <p className="card-title">Recent Activity</p>
            <Link to="/student/attendance" className="btn btn-outline btn-sm">View History</Link>
          </div>
          {recentAttendance.length ? recentAttendance.map((item, index) => (
            <div key={`${item.code}-${item.marked_at}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: index < recentAttendance.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: item.status === 'present' ? '#D1FAE5' : item.status === 'absent' ? '#FEE2E2' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.status === 'present' ? <FiCheckCircle color="#10B981" size={16} /> : item.status === 'absent' ? <FiXCircle color="#EF4444" size={16} /> : <FiAlertCircle color="#F59E0B" size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{item.course}</p>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.code} - {item.session_date}</p>
              </div>
              <AttendanceBadge type={item.status} />
            </div>
          )) : (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: '24px 0', fontSize: '0.875rem' }}>No attendance activity yet</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <p className="card-title">Course Attendance Breakdown</p>
            <p className="card-subtitle">Attendance per subject this semester</p>
          </div>
          <Link to="/student/attendance" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {courses.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {courses.map((course) => {
              const pct = Number(course.percentage || 0);
              return (
                <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, background: '#DBEAFE', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FiBook size={18} color="#2563EB" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{course.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{course.code} - {course.lecturer || 'Lecturer pending'}</p>
                      </div>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', color: pct >= 75 ? '#10B981' : '#EF4444' }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 75 ? '#10B981' : '#EF4444' }} />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 4 }}>{course.attended || 0}/{course.sessions_held || 0} classes attended</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '24px 0', fontSize: '0.875rem' }}>No active course enrollments found</p>
        )}
      </div>
    </div>
  );
}
