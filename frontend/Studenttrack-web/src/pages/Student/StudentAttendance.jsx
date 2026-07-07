import { useEffect, useState } from 'react';
import { FiDownload, FiCheckCircle, FiXCircle, FiAlertCircle, FiSearch, FiCalendar } from 'react-icons/fi';
import { attendanceAPI } from '../../services/api';

const METHOD_LABEL = { qr: 'QR Scan', manual: 'Manual', gps: 'GPS', biometric: 'Biometric', system: '-' };

const formatRecord = (r) => {
  const sessionDate = new Date(r.session_date);
  return {
    date: sessionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    day: sessionDate.toLocaleDateString('en-US', { weekday: 'short' }),
    course: r.course_name,
    code: r.course_code,
    time: new Date(r.marked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: r.status,
    method: METHOD_LABEL[r.method] || r.method,
  };
};

const REQUIRED_RATE = 75;

const summarizeByCourse = (records) => {
  const byCourse = new Map();
  for (const r of records) {
    const key = r.course_code;
    if (!byCourse.has(key)) byCourse.set(key, { code: r.course_code, name: r.course_name, present: 0, absent: 0, late: 0, total: 0 });
    const c = byCourse.get(key);
    c.total += 1;
    if (r.status === 'present') c.present += 1;
    else if (r.status === 'late') c.late += 1;
    else c.absent += 1;
  }
  return Array.from(byCourse.values()).map((c) => ({ ...c, required: REQUIRED_RATE }));
};

function StatusIcon({ status }) {
  const map = {
    present: <span className="badge badge-present"><FiCheckCircle size={11} /> Present</span>,
    absent:  <span className="badge badge-absent"><FiXCircle size={11} /> Absent</span>,
    late:    <span className="badge badge-late"><FiAlertCircle size={11} /> Late</span>,
    excused: <span className="badge badge-excused">Excused</span>,
  };
  return map[status] || null;
}

export default function StudentAttendance() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('records');
  const [rawRecords, setRawRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getHistory({ limit: 100 })
      .then(({ data }) => setRawRecords(data.data?.records || []))
      .catch(() => setRawRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const records = rawRecords.map(formatRecord);
  const coursesSummary = summarizeByCourse(rawRecords);

  const filtered = records.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search && !r.course.toLowerCase().includes(search.toLowerCase()) && !r.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Track your attendance records across all courses.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {['records', 'summary'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', textTransform: 'capitalize',
            background: activeTab === tab ? 'white' : 'transparent',
            color: activeTab === tab ? '#2563EB' : '#64748B',
            boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}>
            {tab === 'records' ? '📋 Attendance Records' : '📊 Course Summary'}
          </button>
        ))}
      </div>

      {activeTab === 'records' ? (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
              <FiSearch className="search-icon" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search course..." />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'present', 'absent', 'late', 'excused'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '8px 14px', borderRadius: 8, border: '2px solid', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', transition: 'all 0.2s',
                  background: filter === f ? '#2563EB' : 'white',
                  color: filter === f ? 'white' : '#64748B',
                  borderColor: filter === f ? '#2563EB' : '#E2E8F0',
                }}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn btn-outline btn-sm" style={{ gap: 6 }}>
              <FiDownload size={14} /> Export
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>Loading records…</td></tr>
                  )}
                  {!loading && filtered.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{r.date}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{r.day}</p>
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{r.course}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{r.code}</p>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>{r.time}</td>
                      <td><StatusIcon status={r.status} /></td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', background: '#F8FAFC', padding: '3px 8px', borderRadius: 6 }}>{r.method}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
                <FiCalendar size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontWeight: 600 }}>No records found</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!loading && coursesSummary.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
              <FiCalendar size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>No attendance data yet</p>
            </div>
          )}
          {coursesSummary.map(c => {
            const rate = Math.round(c.present / c.total * 100);
            const remaining = Math.max(0, Math.ceil(c.required / 100 * c.total) - c.present);
            return (
              <div key={c.code} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>{c.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{c.code}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: rate >= c.required ? '#10B981' : '#EF4444', lineHeight: 1 }}>{rate}%</p>
                    <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Required: {c.required}%</p>
                  </div>
                </div>
                <div className="progress-bar" style={{ marginBottom: 16 }}>
                  <div className="progress-fill" style={{ width: `${rate}%`, background: rate >= c.required ? '#10B981' : '#EF4444' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Present', value: c.present, color: '#10B981', bg: '#D1FAE5' },
                    { label: 'Absent', value: c.absent, color: '#EF4444', bg: '#FEE2E2' },
                    { label: 'Late', value: c.late, color: '#F59E0B', bg: '#FEF3C7' },
                    { label: 'Total', value: c.total, color: '#2563EB', bg: '#DBEAFE' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', background: s.bg, borderRadius: 10, padding: '10px' }}>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                {remaining > 0 && (
                  <div style={{ marginTop: 14, background: '#FEF3C7', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiAlertCircle color="#F59E0B" size={16} />
                    <p style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 500 }}>
                      You need to attend <strong>{remaining} more class(es)</strong> to meet the {c.required}% requirement.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
