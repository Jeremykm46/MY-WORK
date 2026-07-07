import { useState } from 'react';
import { FiDownload, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsAPI, downloadBlob } from '../../services/api';
import { useDeferredEffect } from '../../hooks/useDeferredEffect';
import toast from 'react-hot-toast';

export default function ReportsAnalytics() {
  const [tab, setTab]             = useState('daily');
  const [data, setData]           = useState([]);
  const [lowAtt, setLowAtt]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [exporting, setExporting] = useState('');
  const [dateParam, setDateParam] = useState(new Date().toISOString().split('T')[0]);

  const load = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'daily')   res = await reportsAPI.daily({ date: dateParam });
      if (tab === 'weekly')  res = await reportsAPI.weekly({});
      if (tab === 'monthly') res = await reportsAPI.monthly({});
      setData(res?.data?.data || []);

      const lowRes = await reportsAPI.lowAttendance(75);
      setLowAtt(lowRes.data.data || []);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  useDeferredEffect(() => { load(); }, [tab]);

  const exportFile = async (format) => {
    setExporting(format);
    try {
      let res;
      if (format === 'pdf')   res = await reportsAPI.exportPDF(tab, tab === 'daily' ? { date: dateParam } : {});
      if (format === 'excel') res = await reportsAPI.exportExcel(tab, tab === 'daily' ? { date: dateParam } : {});
      if (format === 'csv')   res = await reportsAPI.exportCSV(tab, tab === 'daily' ? { date: dateParam } : {});
      downloadBlob(res.data, `${tab}-report.${format === 'excel' ? 'xlsx' : format}`);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch { toast.error('Export failed'); }
    finally { setExporting(''); }
  };

  const TABS = [
    { key: 'daily',   label: 'Daily' },
    { key: 'weekly',  label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  const chartData = data.map(d => ({
    label: d.code || d.week || d.course,
    present: Number(d.present || d.total_present || 0),
    absent:  Number(d.absent  || d.total_absent  || 0),
    pct:     Number(d.avg_attendance_pct || 0),
  }));

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Attendance data for all courses</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline btn-sm" disabled={loading}><FiRefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /></button>
          {['pdf','excel','csv'].map(f => (
            <button key={f} onClick={() => exportFile(f)} disabled={!!exporting} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <FiDownload size={13} /> {exporting === f ? '...' : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 20, gap: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#2563EB' : '#64748B',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'daily' && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Date:</label>
          <input type="date" value={dateParam} onChange={e => setDateParam(e.target.value)} className="form-input" style={{ width: 'auto' }} />
          <button onClick={load} className="btn btn-primary btn-sm">Load</button>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <p className="card-title" style={{ marginBottom: 16 }}>Attendance Overview</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.8rem' }} />
              <Bar dataKey="present" fill="#10B981" radius={[6,6,0,0]} name="Present" />
              <Bar dataKey="absent"  fill="#EF4444" radius={[6,6,0,0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Data table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <p className="card-title">{tab.charAt(0).toUpperCase() + tab.slice(1)} Report</p>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No data for selected period</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map(k => <th key={k} style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j} style={{ fontSize: '0.875rem', color: '#334155' }}>{v ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Low attendance */}
      {lowAtt.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FiAlertCircle size={18} color="#F59E0B" />
            <p className="card-title">Students Below 75% Attendance</p>
            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700 }}>{lowAtt.length}</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Student</th><th>Student ID</th><th>Course</th><th>Attendance %</th></tr></thead>
            <tbody>
              {lowAtt.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>{s.student_id}</code></td>
                  <td>{s.code}</td>
                  <td>
                    <span style={{ background: s.percentage < 60 ? '#FEE2E2' : '#FEF3C7', color: s.percentage < 60 ? '#991B1B' : '#92400E', padding: '3px 10px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700 }}>
                      {s.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
