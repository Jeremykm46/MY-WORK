import { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { auditAPI } from '../../services/api';
import { useDeferredEffect } from '../../hooks/useDeferredEffect';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'all',      label: '📋 All Logs',       api: (p) => auditAPI.getLogs(p)       },
  { key: 'security', label: '🔒 Security',        api: (p) => auditAPI.getSecurity(p)   },
  { key: 'activity', label: '⚡ Activity',         api: (p) => auditAPI.getActivity(p)   },
];

const STATUS_COLOR = { 200: '#10B981', 201: '#10B981', 400: '#F59E0B', 401: '#EF4444', 403: '#EF4444', 404: '#F59E0B', 409: '#F59E0B', 422: '#F59E0B', 429: '#EF4444', 500: '#EF4444' };

export default function SystemMonitoring() {
  const [tab, setTab]             = useState('all');
  const [logs, setLogs]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const fn = TABS.find(t => t.key === tab)?.api;
      const { data } = await fn({ page, limit: 20 });
      setLogs(data.data);
      setPagination(data.meta);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  };

  useDeferredEffect(() => { load(); }, [tab, page]);
  useDeferredEffect(() => { setPage(1); }, [tab]);

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">System Monitoring</h1>
          <p className="page-subtitle">Audit logs — {pagination?.total ?? 0} total entries</p>
        </div>
        <button onClick={load} className="btn btn-outline btn-sm" disabled={loading}><FiRefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '9px 18px', borderRadius: 10, border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            background: tab === t.key ? '#1E293B' : 'white', color: tab === t.key ? 'white' : '#64748B',
            borderColor: tab === t.key ? '#1E293B' : '#E2E8F0',
          }}>{t.label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No log entries found</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Resource</th><th>IP</th><th>Status</th></tr></thead>
            <tbody>
              {logs.map(log => {
                const color = STATUS_COLOR[log.status_code] || '#64748B';
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>{log.user_name || 'System'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{log.email || ''}</div>
                    </td>
                    <td>{log.role ? <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'capitalize' }}>{log.role}</span> : '—'}</td>
                    <td><code style={{ background: '#F8FAFC', padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem', color: '#334155' }}>{log.action}</code></td>
                    <td style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.resource || '—'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>{log.ip_address || '—'}</td>
                    <td><span style={{ background: color + '20', color, padding: '2px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>{log.status_code}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} className="btn btn-outline btn-sm">← Prev</button>
          <span style={{ padding: '8px 16px', background: '#F1F5F9', borderRadius: 8, fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage} className="btn btn-outline btn-sm">Next →</button>
        </div>
      )}
    </div>
  );
}
