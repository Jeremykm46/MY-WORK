import { useEffect, useState } from 'react';
import { FiSearch, FiDownload, FiEye, FiCalendar } from 'react-icons/fi';
import { reportsAPI } from '../../services/api';

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    reportsAPI.records()
      .then(({ data }) => setHistory(data.data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const courses = [...new Set(history.map(h => h.code))];
  const filtered = history.filter(h => {
    if (courseFilter !== 'all' && h.code !== courseFilter) return false;
    if (search && !h.course.toLowerCase().includes(search.toLowerCase()) && !h.session_date.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const avgAttendance = history.length
    ? Math.round(history.reduce((s, h) => s + (h.total ? (h.present / h.total * 100) : 0), 0) / history.length)
    : 0;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Attendance History</h1>
        <p className="page-subtitle">Review all past attendance sessions for your courses.</p>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Sessions Recorded', value: history.length, color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Avg Attendance', value: `${avgAttendance}%`, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Total Present', value: history.reduce((s, h) => s + Number(h.present || 0), 0), color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Total Absent', value: history.reduce((s, h) => s + Number(h.absent || 0), 0), color: '#EF4444', bg: '#FEE2E2' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <FiSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search course or date..." />
        </div>
        <select className="form-input form-select" value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ width: 180 }}>
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn-outline btn-sm"><FiDownload size={14} /> Export CSV</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Course</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Rate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>Loading history…</td></tr>
            )}
            {!loading && filtered.map(h => {
              const rate = h.rate ?? 0;
              return (
                <tr key={h.session_id}>
                  <td>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{new Date(h.session_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{h.start_time}</p>
                  </td>
                  <td>
                    <p style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>{h.course}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{h.code}</p>
                  </td>
                  <td style={{ fontWeight: 700, color: '#10B981' }}>{h.present}</td>
                  <td style={{ fontWeight: 700, color: '#EF4444' }}>{h.absent}</td>
                  <td style={{ fontWeight: 700, color: '#F59E0B' }}>{h.late}</td>
                  <td>
                    <span style={{ background: rate >= 85 ? '#D1FAE5' : rate >= 75 ? '#FEF3C7' : '#FEE2E2', color: rate >= 85 ? '#065F46' : rate >= 75 ? '#92400E' : '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>{rate}%</span>
                  </td>
                  <td>
                    <button onClick={() => setSelected(h)} className="icon-btn icon-btn-sm" title="View"><FiEye size={13} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
            <FiCalendar size={36} style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No records found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Session Details</h3>
            <div style={{ background: '#EDE9FE', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
              <p style={{ fontWeight: 700, color: '#5B21B6', fontSize: '0.95rem' }}>{selected.course}</p>
              <p style={{ color: '#7C3AED', fontSize: '0.82rem' }}>{new Date(selected.session_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {selected.start_time} · {selected.department || 'General'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Present', value: selected.present, color: '#10B981', bg: '#D1FAE5' },
                { label: 'Absent', value: selected.absent, color: '#EF4444', bg: '#FEE2E2' },
                { label: 'Late', value: selected.late, color: '#F59E0B', bg: '#FEF3C7' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', background: s.bg, borderRadius: 10, padding: 14 }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: '0.75rem', color: s.color, fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Total Students</span>
              <span style={{ fontWeight: 700, color: '#1E293B' }}>{selected.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginBottom: 20 }}>
              <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Attendance Rate</span>
              <span style={{ fontWeight: 700, color: '#7C3AED' }}>{selected.rate ?? 0}%</span>
            </div>
            <button onClick={() => setSelected(null)} className="btn btn-outline btn-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
