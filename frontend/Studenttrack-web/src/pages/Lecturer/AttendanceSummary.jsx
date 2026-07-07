import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { FiDownload, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { dashboardAPI, studentsAPI, reportsAPI, notificationsAPI } from '../../services/api';

const monthKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (key) => new Date(`${key}-01`).toLocaleDateString('en-US', { month: 'short' });

export default function AttendanceSummary() {
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState([]);
  const [studentsSummary, setStudentsSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: dashboard }, { data: reportRes }] = await Promise.all([
          dashboardAPI.get(),
          reportsAPI.records(),
        ]);
        const courseList = dashboard.data?.courses || [];
        setCourses(courseList);
        setRecords(reportRes.data || []);

        const rosters = await Promise.all(
          courseList.map((c) => studentsAPI.getAll({ course_id: c.id, limit: 100 }).then(({ data }) =>
            (data.data || []).map((s) => ({ userId: s.user_id, name: s.name, studentId: s.student_id, course: c.code, rate: s.attendance_percentage === null || s.attendance_percentage === undefined ? null : Number(s.attendance_percentage) }))
          ))
        );

        // Average a student's rate across all of this lecturer's courses they're enrolled in.
        const byStudent = new Map();
        rosters.flat().forEach((r) => {
          if (r.rate === null) return;
          if (!byStudent.has(r.userId)) byStudent.set(r.userId, { ...r, rates: [] });
          byStudent.get(r.userId).rates.push(r.rate);
        });
        setStudentsSummary(Array.from(byStudent.values()).map((s) => ({ ...s, rate: Math.round(s.rates.reduce((a, b) => a + b, 0) / s.rates.length) })));
      } catch {
        toast.error('Failed to load attendance summary');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byCourse = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      if (!map.has(r.code)) map.set(r.code, { name: r.code, present: 0, absent: 0, late: 0 });
      const c = map.get(r.code);
      c.present += Number(r.present || 0);
      c.absent += Number(r.absent || 0);
      c.late += Number(r.late || 0);
    }
    return Array.from(map.values());
  }, [records]);

  const totals = useMemo(() => {
    const present = records.reduce((s, r) => s + Number(r.present || 0), 0);
    const absent = records.reduce((s, r) => s + Number(r.absent || 0), 0);
    const late = records.reduce((s, r) => s + Number(r.late || 0), 0);
    const grand = present + absent + late || 1;
    return {
      present, absent, late,
      pcts: {
        present: Math.round((present / grand) * 100),
        absent: Math.round((absent / grand) * 100),
        late: Math.round((late / grand) * 100),
      },
    };
  }, [records]);

  const pieData = [
    { name: 'Present', value: totals.pcts.present, color: '#10B981' },
    { name: 'Absent', value: totals.pcts.absent, color: '#EF4444' },
    { name: 'Late', value: totals.pcts.late, color: '#F59E0B' },
  ];

  const trendData = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      const key = monthKey(r.session_date);
      if (!map.has(key)) map.set(key, { total: 0, present: 0 });
      const m = map.get(key);
      const sessionTotal = Number(r.present || 0) + Number(r.absent || 0) + Number(r.late || 0);
      m.total += sessionTotal;
      m.present += Number(r.present || 0);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({ month: monthLabel(key), rate: v.total ? Math.round((v.present / v.total) * 100) : 0 }));
  }, [records]);

  const topStudents = useMemo(() => [...studentsSummary].sort((a, b) => b.rate - a.rate).slice(0, 5), [studentsSummary]);
  const atRisk = useMemo(() => studentsSummary.filter((s) => s.rate < 75).sort((a, b) => a.rate - b.rate), [studentsSummary]);

  const overallRate = totals.present + totals.absent + totals.late
    ? Math.round((totals.present / (totals.present + totals.absent + totals.late)) * 100)
    : 0;
  const totalStudents = courses.reduce((s, c) => s + Number(c.enrolled || 0), 0);

  const sendAlert = async (student) => {
    setSendingId(student.userId);
    try {
      await notificationsAPI.send({
        recipientId: student.userId,
        title: `Attendance Alert — ${student.course}`,
        message: `Your attendance in ${student.course} is currently ${student.rate}%. Minimum required is 75%. Please attend classes.`,
        type: 'warning',
      });
      toast.success(`Alert sent to ${student.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8' }}>Loading attendance summary…</div>;
  }

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Attendance Summary</h1>
          <p className="page-subtitle">Comprehensive overview of attendance across all your courses.</p>
        </div>
        <button className="btn btn-outline btn-sm"><FiDownload size={14} /> Export</button>
      </div>

      {/* Overall stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Overall Rate', value: `${overallRate}%`, icon: <FiTrendingUp size={20} />, color: '#10B981', bg: '#D1FAE5', trend: 'All sessions' },
          { label: 'Total Sessions', value: records.length, color: '#7C3AED', bg: '#EDE9FE', trend: 'Recorded' },
          { label: 'Total Students', value: totalStudents, color: '#2563EB', bg: '#DBEAFE', trend: 'Enrolled' },
          { label: 'At-Risk Students', value: atRisk.length, color: '#EF4444', bg: '#FEE2E2', trend: 'Need attention' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              {s.icon && <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>}
              <span style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600, background: s.bg, padding: '2px 8px', borderRadius: 20 }}>{s.trend}</span>
            </div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.7rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Course comparison bar chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Attendance by Course</p>
              <p className="card-subtitle">Present vs Absent vs Late</p>
            </div>
          </div>
          {byCourse.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCourse} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.8rem' }} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="present" name="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="Late" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>No sessions recorded yet</div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Overall Distribution</p>
              <p className="card-subtitle">Attendance breakdown (all courses)</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: item.color }}>{item.value}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5, marginTop: 4 }}>
                      <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <p className="card-title">Monthly Attendance Trend</p>
            <p className="card-subtitle">Average attendance rate per month</p>
          </div>
        </div>
        {trendData.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.8rem' }} />
              <Line type="monotone" dataKey="rate" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>No sessions recorded yet</div>
        )}
      </div>

      <div className="grid-2">
        {/* Top performers */}
        <div className="card">
          <p className="card-title" style={{ marginBottom: 16 }}>🏆 Top Performers</p>
          {topStudents.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No attendance data yet</p>}
          {topStudents.map((s, i) => (
            <div key={s.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < topStudents.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <span style={{ width: 24, height: 24, background: i === 0 ? '#FEF3C7' : '#F8FAFC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, color: i === 0 ? '#92400E' : '#94A3B8', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{s.name}</p>
                <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s.studentId}</p>
              </div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#10B981', fontSize: '1rem' }}>{s.rate}%</span>
            </div>
          ))}
        </div>

        {/* At-risk */}
        <div className="card">
          <p className="card-title" style={{ marginBottom: 16 }}>⚠ At-Risk Students</p>
          {atRisk.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No at-risk students 🎉</p>}
          {atRisk.map((s) => (
            <div key={s.userId} style={{ background: '#FFF5F5', borderRadius: 10, padding: '12px 14px', marginBottom: 10, borderLeft: '4px solid #EF4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{s.name}</p>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#EF4444', fontSize: '1rem' }}>{s.rate}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.studentId} · {s.course}</span>
                <button onClick={() => sendAlert(s)} disabled={sendingId === s.userId} style={{ background: '#EF4444', border: 'none', color: 'white', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  {sendingId === s.userId ? 'Sending…' : 'Send Alert'}
                </button>
              </div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill progress-fill-danger" style={{ width: `${s.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
