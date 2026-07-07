import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiBook, FiEdit2, FiSave, FiCamera, FiShield, FiBell, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authAPI, dashboardAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentProfile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: '', yearOfStudy: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [stats, setStats] = useState({ overallRate: null, activeCourses: 0, enrolledSince: null, studentId: null });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';

  useEffect(() => {
    authAPI.getProfile().then(({ data }) => {
      const p = data.data;
      setForm({ name: p.name || '', phone: p.phone || '', department: p.student_department || p.lecturer_department || '', yearOfStudy: '' });
      setStats((s) => ({ ...s, studentId: p.student_id, enrolledSince: p.created_at ? new Date(p.created_at).getFullYear() : null }));
    }).catch(() => {});

    dashboardAPI.get().then(({ data }) => {
      const courses = data.data?.courses || [];
      const sessions = courses.reduce((sum, c) => sum + Number(c.sessions_held || 0), 0);
      const attended = courses.reduce((sum, c) => sum + Number(c.attended || 0), 0);
      setStats((s) => ({ ...s, activeCourses: courses.length, overallRate: sessions ? Math.round((attended / sessions) * 100) : 0 }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: form.name, phone: form.phone || undefined, department: form.department || undefined, yearOfStudy: form.yearOfStudy || undefined });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current) { toast.error('Enter current password'); return; }
    if (passwords.newPass.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      await authAPI.changePassword(passwords.current, passwords.newPass);
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and settings.</p>
      </div>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #1E3A5F, #2563EB)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div className="avatar avatar-xl avatar-placeholder" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>{initials}</div>
            <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, background: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <FiCamera size={13} />
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: 8 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {stats.studentId && <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{stats.studentId}</span>}
              <span style={{ background: 'rgba(16,185,129,0.3)', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
            </div>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              <FiEdit2 size={14} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} className="btn btn-sm btn-success" disabled={saving}><FiSave size={14} /> {saving ? 'Saving…' : 'Save'}</button>
              <button onClick={() => setEditing(false)} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Overall Attendance', value: stats.overallRate === null ? '—' : `${stats.overallRate}%`, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Active Courses', value: stats.activeCourses, color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Enrolled Since', value: stats.enrolledSince || '—', color: '#F59E0B', bg: '#FEF3C7' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {[
          { id: 'info', icon: <FiUser size={14} />, label: 'Personal Info' },
          { id: 'security', icon: <FiLock size={14} />, label: 'Security' },
          { id: 'notifications', icon: <FiBell size={14} />, label: 'Notifications' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            background: activeTab === t.id ? 'white' : 'transparent',
            color: activeTab === t.id ? '#2563EB' : '#64748B',
            boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="card">
          <div className="card-header">
            <p className="card-title">Personal Information</p>
          </div>
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><FiUser /></span>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  disabled={!editing} style={{ paddingLeft: 38, width: '100%', background: editing ? 'white' : '#F8FAFC' }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><FiMail /></span>
                <input type="email" className="form-input" value={user?.email || ''} disabled style={{ paddingLeft: 38, width: '100%', background: '#F8FAFC' }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><FiPhone /></span>
                <input type="tel" className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  disabled={!editing} style={{ paddingLeft: 38, width: '100%', background: editing ? 'white' : '#F8FAFC' }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year of Study</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><FiBook /></span>
                <input type="number" min="1" max="8" className="form-input" value={form.yearOfStudy} onChange={e => setForm(f => ({ ...f, yearOfStudy: e.target.value }))}
                  disabled={!editing} style={{ paddingLeft: 38, width: '100%', background: editing ? 'white' : '#F8FAFC' }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Department</label>
              <input type="text" className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                disabled={!editing} style={{ width: '100%', background: editing ? 'white' : '#F8FAFC' }} />
            </div>
          </div>
          {editing && (
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}><FiSave size={15} /> {saving ? 'Saving…' : 'Save Changes'}</button>
              <button onClick={() => setEditing(false)} className="btn btn-outline-gray">Cancel</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <FiShield size={22} color="#2563EB" />
            <p className="card-title">Change Password</p>
          </div>
          <form onSubmit={handlePasswordChange} style={{ maxWidth: 420 }}>
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'newPass' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input type="password" className="form-input" value={passwords[f.key]} onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder="••••••••" style={{ paddingLeft: 38, width: '100%' }} />
                </div>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={changingPassword}>{changingPassword ? 'Updating…' : 'Update Password'}</button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <p className="card-title" style={{ marginBottom: 20 }}>Notification Preferences</p>
          {[
            { label: 'Attendance Alerts', desc: 'Notify when attendance is marked', enabled: true },
            { label: 'Low Attendance Warning', desc: 'Alert when attendance drops below threshold', enabled: true },
            { label: 'Class Reminders', desc: 'Remind 30 minutes before class starts', enabled: false },
            { label: 'Schedule Changes', desc: 'Notify on class cancellations or reschedules', enabled: true },
            { label: 'Email Notifications', desc: 'Send notifications to your email', enabled: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 4 ? '1px solid #F1F5F9' : 'none' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1E293B' }}>{item.label}</p>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 2 }}>{item.desc}</p>
              </div>
              <div style={{ width: 44, height: 24, background: item.enabled ? '#2563EB' : '#E2E8F0', borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, left: item.enabled ? 22 : 2, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
