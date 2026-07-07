import { useEffect, useState } from 'react';
import { FiSearch, FiMail, FiPhone, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { dashboardAPI, studentsAPI, notificationsAPI } from '../../services/api';

const STATUS_MAP = {
  excellent: { label: 'Excellent', bg: '#D1FAE5', color: '#065F46' },
  good: { label: 'Good', bg: '#DBEAFE', color: '#1E40AF' },
  warning: { label: 'Warning', bg: '#FEF3C7', color: '#92400E' },
  'at-risk': { label: 'At Risk', bg: '#FEE2E2', color: '#991B1B' },
  pending: { label: 'No Data', bg: '#F1F5F9', color: '#64748B' },
};

const classify = (pct) => {
  if (pct === null || pct === undefined) return 'pending';
  if (pct >= 90) return 'excellent';
  if (pct >= 75) return 'good';
  if (pct >= 70) return 'warning';
  return 'at-risk';
};

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [sendingAlert, setSendingAlert] = useState(false);

  const sendAlert = async (student) => {
    setSendingAlert(true);
    try {
      await notificationsAPI.send({
        recipientId: student.userId,
        title: `Attendance Alert — ${student.course}`,
        message: `Your attendance in ${student.course} is currently ${student.attendance === null ? 'unrecorded' : `${student.attendance}%`}. Please speak with your lecturer if you have concerns.`,
        type: 'warning',
      });
      toast.success(`Alert sent to ${student.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setSendingAlert(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: dashboard } = await dashboardAPI.get();
        const courses = dashboard.data?.courses || [];
        const rosters = await Promise.all(
          courses.map((c) => studentsAPI.getAll({ course_id: c.id, limit: 100 }).then(({ data }) =>
            (data.data || []).map((s) => ({
              id: `${c.id}-${s.id}`,
              studentDbId: s.id,
              userId: s.user_id,
              name: s.name,
              studentId: s.student_id,
              course: c.code,
              email: s.email,
              phone: s.phone,
              attendance: s.attendance_percentage === null || s.attendance_percentage === undefined ? null : Number(s.attendance_percentage),
              status: classify(s.attendance_percentage === null || s.attendance_percentage === undefined ? null : Number(s.attendance_percentage)),
            }))
          ))
        );
        setStudents(rosters.flat());
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = students.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.studentId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Student List</h1>
        <p className="page-subtitle">Manage and monitor all enrolled students.</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: students.length, color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Excellent (≥90%)', value: students.filter(s => s.status === 'excellent').length, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Warning (70-75%)', value: students.filter(s => s.status === 'warning').length, color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'At Risk (<70%)', value: students.filter(s => s.status === 'at-risk').length, color: '#EF4444', bg: '#FEE2E2' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <FiSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student name or ID..." />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'excellent', 'good', 'warning', 'at-risk'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: '7px 12px', borderRadius: 8, border: '2px solid', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s', textTransform: 'capitalize',
              background: statusFilter === f ? '#7C3AED' : 'white',
              color: statusFilter === f ? 'white' : '#64748B',
              borderColor: statusFilter === f ? '#7C3AED' : '#E2E8F0',
            }}>
              {f === 'all' ? 'All' : f.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student ID</th>
              <th>Course</th>
              <th>Attendance</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>Loading students…</td></tr>
            )}
            {!loading && filtered.map(s => {
              const st = STATUS_MAP[s.status];
              const initials = s.name.split(' ').map(n => n[0]).join('');
              const pct = s.attendance ?? 0;
              return (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm avatar-placeholder" style={{ background: '#EDE9FE', color: '#7C3AED', fontSize: '0.7rem', fontWeight: 700 }}>{initials}</div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>{s.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748B', fontFamily: 'monospace' }}>{s.studentId}</td>
                  <td><span style={{ background: '#F1F5F9', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>{s.course}</span></td>
                  <td style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: s.attendance === null ? '#94A3B8' : s.attendance >= 75 ? '#10B981' : '#EF4444', fontSize: '1rem' }}>{s.attendance === null ? '—' : `${s.attendance}%`}</td>
                  <td style={{ minWidth: 100 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 85 ? '#10B981' : pct >= 75 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                  </td>
                  <td><span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>{st.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setSelected(s)} className="icon-btn icon-btn-sm" title="View"><FiEye size={13} /></button>
                      <a href={`mailto:${s.email}`} className="icon-btn icon-btn-sm" title="Email"><FiMail size={13} /></a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>No students found</div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div className="avatar avatar-xl avatar-placeholder" style={{ background: '#EDE9FE', color: '#7C3AED', fontSize: '1.4rem', fontWeight: 700, margin: '0 auto 12px' }}>
                {selected.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>{selected.name}</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', fontFamily: 'monospace' }}>{selected.studentId}</p>
            </div>
            {[
              { label: 'Email', value: selected.email, icon: <FiMail size={14} /> },
              { label: 'Phone', value: selected.phone || '—', icon: <FiPhone size={14} /> },
              { label: 'Course', value: selected.course },
              { label: 'Attendance Rate', value: selected.attendance === null ? 'No data yet' : `${selected.attendance}%` },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>{f.icon}{f.label}</span>
                <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>{f.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={() => sendAlert(selected)} disabled={sendingAlert} className="btn btn-primary btn-full">{sendingAlert ? 'Sending…' : '📧 Send Alert'}</button>
              <button onClick={() => setSelected(null)} className="btn btn-outline-gray btn-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
