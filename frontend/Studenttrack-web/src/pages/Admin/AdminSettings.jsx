import { useState } from 'react';
import { FiSettings, FiShield, FiBell, FiMail, FiDatabase, FiSave, FiRefreshCw } from 'react-icons/fi';
import { MdOutlineSchool } from 'react-icons/md';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'general', icon: <FiSettings size={15} />, label: 'General' },
  { id: 'attendance', icon: <MdOutlineSchool size={15} />, label: 'Attendance' },
  { id: 'notifications', icon: <FiBell size={15} />, label: 'Notifications' },
  { id: 'security', icon: <FiShield size={15} />, label: 'Security' },
  { id: 'email', icon: <FiMail size={15} />, label: 'Email' },
  { id: 'backup', icon: <FiDatabase size={15} />, label: 'Backup' },
];

export default function AdminSettings() {
  const [tab, setTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General
    institutionName: 'StudentTrack University',
    institutionCode: 'ETU-2024',
    academicYear: '2024/2025',
    semester: 'Semester 1',
    timezone: 'UTC-5',
    language: 'English',
    // Attendance
    minAttendance: 75,
    lateThreshold: 15,
    qrExpiry: 300,
    gpsRadius: 100,
    allowManual: true,
    requireLocation: false,
    // Notifications
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    lowAttendanceThreshold: 75,
    reminderBefore: 30,
    weeklyReport: true,
    // Security
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactor: false,
    passwordExpiry: 90,
    // Email
    smtpHost: 'smtp.studenttrack.edu',
    smtpPort: '587',
    smtpUser: 'noreply@studenttrack.edu',
    emailFooter: 'StudentTrack University — Smart Attendance System',
  });

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  const field = (label, key, type = 'text', opts = null) => (
    <div key={key} className="form-group">
      <label className="form-label">{label}</label>
      {opts ? (
        <select className="form-input form-select" value={settings[key]} onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%' }}>
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : type === 'toggle' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
          <div onClick={() => setSettings(p => ({ ...p, [key]: !p[key] }))} style={{ width: 44, height: 24, background: settings[key] ? '#2563EB' : '#E2E8F0', borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: settings[key] ? 22 : 2, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
          <span style={{ fontSize: '0.875rem', color: settings[key] ? '#2563EB' : '#94A3B8', fontWeight: 600 }}>{settings[key] ? 'Enabled' : 'Disabled'}</span>
        </div>
      ) : (
        <input type={type} className="form-input" value={settings[key]} onChange={e => setSettings(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))} style={{ width: '100%' }} />
      )}
    </div>
  );

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure StudentTrack system preferences and policies.</p>
        </div>
        <button onClick={save} className="btn btn-primary" disabled={saving}>
          {saving ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><FiSave size={15} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar tabs */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div className="card" style={{ padding: 8 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                width: '100%', padding: '10px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9, fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', marginBottom: 2,
                background: tab === t.id ? '#2563EB' : 'transparent',
                color: tab === t.id ? 'white' : '#64748B',
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div className="card">
            {tab === 'general' && (
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #E2E8F0', color: '#1E293B' }}>General Settings</h3>
                <div className="grid-2" style={{ gap: 20 }}>
                  {field('Institution Name', 'institutionName')}
                  {field('Institution Code', 'institutionCode')}
                  {field('Academic Year', 'academicYear')}
                  {field('Current Semester', 'semester', 'text', [
                    { v: 'Semester 1', l: 'Semester 1' }, { v: 'Semester 2', l: 'Semester 2' }, { v: 'Summer', l: 'Summer' }
                  ])}
                  {field('Timezone', 'timezone', 'text', [
                    { v: 'UTC-5', l: 'UTC-5 (EST)' }, { v: 'UTC+0', l: 'UTC+0 (GMT)' }, { v: 'UTC+3', l: 'UTC+3 (EAT)' }, { v: 'UTC+8', l: 'UTC+8 (PHT)' }
                  ])}
                  {field('Language', 'language', 'text', [
                    { v: 'English', l: 'English' }, { v: 'Spanish', l: 'Spanish' }, { v: 'French', l: 'French' }
                  ])}
                </div>
              </div>
            )}

            {tab === 'attendance' && (
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #E2E8F0', color: '#1E293B' }}>Attendance Policies</h3>
                <div className="grid-2" style={{ gap: 20 }}>
                  {field('Minimum Attendance (%)', 'minAttendance', 'number')}
                  {field('Late Threshold (minutes)', 'lateThreshold', 'number')}
                  {field('QR Code Expiry (seconds)', 'qrExpiry', 'number')}
                  {field('GPS Radius (meters)', 'gpsRadius', 'number')}
                </div>
                <div className="grid-2" style={{ gap: 20, marginTop: 4 }}>
                  {field('Allow Manual Entry', 'allowManual', 'toggle')}
                  {field('Require Location', 'requireLocation', 'toggle')}
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #E2E8F0', color: '#1E293B' }}>Notification Settings</h3>
                <div className="grid-2" style={{ gap: 20 }}>
                  {field('Email Alerts', 'emailAlerts', 'toggle')}
                  {field('SMS Alerts', 'smsAlerts', 'toggle')}
                  {field('Push Notifications', 'pushAlerts', 'toggle')}
                  {field('Weekly Reports', 'weeklyReport', 'toggle')}
                  {field('Low Attendance Alert Threshold (%)', 'lowAttendanceThreshold', 'number')}
                  {field('Class Reminder (minutes before)', 'reminderBefore', 'number')}
                </div>
              </div>
            )}

            {tab === 'security' && (
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #E2E8F0', color: '#1E293B' }}>Security Settings</h3>
                <div className="grid-2" style={{ gap: 20 }}>
                  {field('Session Timeout (minutes)', 'sessionTimeout', 'number')}
                  {field('Max Login Attempts', 'maxLoginAttempts', 'number')}
                  {field('Two-Factor Authentication', 'twoFactor', 'toggle')}
                  {field('Password Expiry (days)', 'passwordExpiry', 'number')}
                </div>
              </div>
            )}

            {tab === 'email' && (
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #E2E8F0', color: '#1E293B' }}>Email Configuration</h3>
                <div className="grid-2" style={{ gap: 20 }}>
                  {field('SMTP Host', 'smtpHost')}
                  {field('SMTP Port', 'smtpPort')}
                  {field('SMTP Username', 'smtpUser', 'email')}
                </div>
                {field('Email Footer', 'emailFooter')}
                <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }}><FiMail size={13} /> Test Email</button>
              </div>
            )}

            {tab === 'backup' && (
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #E2E8F0', color: '#1E293B' }}>Backup & Recovery</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                  {[
                    { label: 'Last Backup', value: 'Today, 03:00 AM', color: '#10B981', bg: '#D1FAE5' },
                    { label: 'Backup Size', value: '4.8 GB', color: '#2563EB', bg: '#DBEAFE' },
                    { label: 'Next Backup', value: 'Tomorrow 03:00 AM', color: '#7C3AED', bg: '#EDE9FE' },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: s.color, fontSize: '0.95rem' }}>{s.value}</p>
                      <p style={{ fontSize: '0.75rem', color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary btn-sm"><FiDatabase size={13} /> Backup Now</button>
                  <button className="btn btn-outline btn-sm"><FiRefreshCw size={13} /> Restore</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
