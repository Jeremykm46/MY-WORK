import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { MdOutlineSchool } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = {
  admin:    { label: 'Administrator', color: '#10B981' },
  lecturer: { label: 'Lecturer',       color: '#7C3AED' },
  student:  { label: 'Student',        color: '#2563EB' },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      navigate(`/${user.role}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cfg = ROLES[role];

  return (
    <div className="auth-wrapper">
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, background: 'rgba(124,58,237,0.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 240, height: 240, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div className="auth-card" style={{ position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <MdOutlineSchool size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>
            Student<span style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Track</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Landmark Metropolitan University</p>
        </div>

        {/* Role Tabs */}
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24, gap: 2 }}>
          {Object.entries(ROLES).map(([key, d]) => (
            <button key={key} onClick={() => { setRole(key); setEmail(''); setPassword(''); }} style={{
              flex: 1, padding: '9px 8px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              background: role === key ? 'white' : 'transparent',
              color: role === key ? d.color : '#64748B',
              boxShadow: role === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
              {d.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email" style={{ paddingLeft: 40, width: '100%' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input type={showPass ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" style={{ paddingLeft: 40, paddingRight: 44, width: '100%' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 }}>
            <Link to="/forgot-password" style={{ color: '#2563EB', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}
            style={{ background: loading ? '#93C5FD' : `linear-gradient(135deg, ${cfg.color}, #7C3AED)` }}>
            {loading ? (
              <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Signing in...</>
            ) : (
              <>Sign In <FiArrowRight /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
