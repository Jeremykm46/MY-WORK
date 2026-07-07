import { useEffect, useState } from 'react';
import { FiSearch, FiDownload, FiCalendar, FiEye } from 'react-icons/fi';
import { reportsAPI } from '../../services/api';

const RANGE_DAYS = { today: 0, week: 7, month: 30, semester: 180 };

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const days = RANGE_DAYS[dateRange];
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    setLoading(true);
    reportsAPI.records({ from, to })
      .then(({ data }) => setRecords(data.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const filtered = records.filter(r => {
    if (deptFilter !== 'all' && r.department !== deptFilter) return false;
    if (search && !r.course.toLowerCase().includes(search.toLowerCase()) && !(r.lecturer || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totals = { present: filtered.reduce((s, r) => s + r.present, 0), absent: filtered.reduce((s, r) => s + r.absent, 0), late: filtered.reduce((s, r) => s + r.late, 0), total: filtered.reduce((s, r) => s + r.total, 0) };
  const avgRate = Math.round(filtered.reduce((s, r) => s + (r.rate || 0), 0) / (filtered.length || 1));

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Attendance Records</h1>
          <p className="page-subtitle">Complete attendance data across all classes and departments.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-input form-select" value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ width: 140 }}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">Semester</option>
          </select>
          <button className="btn btn-outline btn-sm"><FiDownload size={14} /> Export</button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: filtered.length, color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Avg Rate', value: `${avgRate}%`, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Total Present', value: totals.present, color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Total Absent', value: totals.absent, color: '#EF4444', bg: '#FEE2E2' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <FiSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search course or lecturer..." />
        </div>
        <select className="form-input form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 140 }}>
          <option value="all">All Depts</option>
          {['CS', 'IT', 'ENG', 'BUS'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Lecturer</th>
              <th>Dept</th>
              <th>Total</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Rate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>Loading records…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>No attendance records for the selected period.</td></tr>
            ) : filtered.map(r => {
              const rate = r.rate || 0;
              return (
              <tr key={r.session_id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiCalendar size={12} color="#94A3B8" />
                    <span style={{ fontSize: '0.82rem', color: '#334155' }}>{formatDate(r.session_date)}</span>
                  </div>
                </td>
                <td>
                  <p style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>{r.course}</p>
                  <p style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace' }}>{r.code}</p>
                </td>
                <td style={{ fontSize: '0.82rem', color: '#334155' }}>{r.lecturer || '—'}</td>
                <td><span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>{r.department || '—'}</span></td>
                <td style={{ fontWeight: 600, color: '#334155' }}>{r.total}</td>
                <td style={{ fontWeight: 700, color: '#10B981' }}>{r.present}</td>
                <td style={{ fontWeight: 700, color: '#EF4444' }}>{r.absent}</td>
                <td style={{ fontWeight: 700, color: '#F59E0B' }}>{r.late}</td>
                <td>
                  <span style={{ background: rate >= 90 ? '#D1FAE5' : rate >= 75 ? '#DBEAFE' : rate >= 70 ? '#FEF3C7' : '#FEE2E2', color: rate >= 90 ? '#065F46' : rate >= 75 ? '#1E40AF' : rate >= 70 ? '#92400E' : '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>{rate}%</span>
                </td>
                <td>
                  <button onClick={() => setSelected(r)} className="icon-btn icon-btn-sm"><FiEye size={13} /></button>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div style={{ marginTop: 16, background: '#1E293B', borderRadius: 12, padding: '14px 20px', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Classes', value: filtered.length },
          { label: 'Total Students Tracked', value: totals.total },
          { label: 'Overall Present', value: `${totals.present} (${Math.round(totals.present / (totals.total || 1) * 100)}%)` },
          { label: 'Overall Absent', value: `${totals.absent} (${Math.round(totals.absent / (totals.total || 1) * 100)}%)` },
        ].map(s => (
          <div key={s.label}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginBottom: 2 }}>{s.label}</p>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Record Details</h3>
            <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px', marginBottom: 20 }}>
              <p style={{ fontWeight: 700, color: '#1E293B' }}>{selected.course} ({selected.code})</p>
              <p style={{ color: '#64748B', fontSize: '0.82rem' }}>{formatDate(selected.session_date)} · {selected.lecturer || '—'} · Dept: {selected.department || '—'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[{ label: 'Present', v: selected.present, color: '#10B981', bg: '#D1FAE5' }, { label: 'Absent', v: selected.absent, color: '#EF4444', bg: '#FEE2E2' }, { label: 'Late', v: selected.late, color: '#F59E0B', bg: '#FEF3C7' }].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: s.color }}>{s.v}</p>
                  <p style={{ fontSize: '0.75rem', color: s.color, fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', marginBottom: 4 }}>
              <span style={{ color: '#64748B' }}>Total Students</span>
              <span style={{ fontWeight: 700 }}>{selected.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginBottom: 20 }}>
              <span style={{ color: '#64748B' }}>Attendance Rate</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: (selected.rate || 0) >= 75 ? '#10B981' : '#EF4444' }}>{selected.rate || 0}%</span>
            </div>
            <button onClick={() => setSelected(null)} className="btn btn-outline btn-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
