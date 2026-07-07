import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiBell, FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import { notificationsAPI } from '../../services/api';

const TYPE_CONFIG = {
  warning: { icon: <FiAlertCircle size={18} />, bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  success: { icon: <FiCheckCircle size={18} />, bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  info:    { icon: <FiInfo size={18} />, bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  danger:  { icon: <FiAlertCircle size={18} />, bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
};

// Backend stores this type as 'error'; the UI treats it as 'danger'.
const mapType = (t) => (t === 'error' ? 'danger' : t);

const formatItem = (n) => ({
  id: n.id,
  type: mapType(n.type),
  title: n.title,
  message: n.message,
  read: !!n.is_read,
  sender: n.sender_name || 'System',
  time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
});

export default function StudentNotifications() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getAll({ limit: 100 })
      .then(({ data }) => setItems((data.data || []).map(formatItem)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = items.filter(n => !n.read).length;

  const markRead = (id) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id) => {
    setItems(prev => prev.filter(n => n.id !== id));
    notificationsAPI.remove(id).catch(() => {});
  };

  const filtered = filter === 'all' ? items : filter === 'unread' ? items.filter(n => !n.read) : items.filter(n => n.type === filter);

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with your attendance and class alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-outline btn-sm">
            <FiCheckCircle size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', value: items.length, color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Unread', value: unreadCount, color: '#EF4444', bg: '#FEE2E2' },
          { label: 'Warnings', value: items.filter(n => n.type === 'warning').length, color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'Info', value: items.filter(n => n.type === 'info').length, color: '#7C3AED', bg: '#EDE9FE' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'unread', 'warning', 'success', 'info', 'danger'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: 8, border: '2px solid', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', transition: 'all 0.2s',
            background: filter === f ? '#2563EB' : 'white',
            color: filter === f ? 'white' : '#64748B',
            borderColor: filter === f ? '#2563EB' : '#E2E8F0',
          }}>
            {f === 'all' ? `All (${items.length})` : f === 'unread' ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>Loading notifications…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <FiBell size={40} style={{ marginBottom: 12, opacity: 0.4, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>No notifications</p>
            <p style={{ fontSize: '0.875rem', marginTop: 4 }}>You're all caught up!</p>
          </div>
        )}
        {!loading && filtered.map(n => {
          const cfg = TYPE_CONFIG[n.type];
          return (
            <div key={n.id} style={{ background: 'white', border: `1px solid ${n.read ? '#E2E8F0' : cfg.border}`, borderLeft: `4px solid ${cfg.color}`, borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14, transition: 'all 0.2s', opacity: n.read ? 0.8 : 1, cursor: 'pointer' }}
              onClick={() => markRead(n.id)}>
              <div style={{ width: 38, height: 38, background: cfg.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{n.title}</p>
                    {!n.read && <span style={{ width: 8, height: 8, background: '#EF4444', borderRadius: '50%', flexShrink: 0 }} />}
                  </div>
                  <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                    <FiX size={15} />
                  </button>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.6, marginBottom: 8 }}>{n.message}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{n.time}</span>
                  <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{n.sender}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
