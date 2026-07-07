import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiBook } from 'react-icons/fi';
import { MdOutlineSchool } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const COURSES = ['Bachelor of Computer Science', 'Bachelor of Information Technology', 'Bachelor of Engineering', 'Bachelor of Business Administration', 'Bachelor of Education', 'Bachelor of Science'];
const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Engineering', 'Business Administration', 'Education', 'Natural Sciences'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', studentId: '', staffId: '', course: '', department: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (role === 'student' && !form.studentId) {
      toast.error('Student ID is required for student registration.');
      return;
    }
    if (role === 'lecturer' && !form.staffId) {
      toast.error('Staff ID is required for lecturer registration.');
      return;
    }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password)) {
      toast.error('Password must contain an uppercase letter, lowercase letter, number, and special character (@$!%*?&).');
      return;
    }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const result = await register({ ...form, role });
      toast.success(result?.message || 'Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      const detail = Array.isArray(fieldErrors) && fieldErrors.length ? fieldErrors.map(e => e.message).join(' ') : null;
      toast.error(detail || err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '24px' }}>
      <div style={{ position: 'absolute', top: '5%', right: '5%', width: 260, height: 260, background: 'rgba(37,99,235,0.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="auth-card" style={{ maxWidth: 520, padding: '32px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <MdOutlineSchool size={26} color="white" />
          </div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>
            Create <span style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Account</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Join StudentTrack today — it's free!</p>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {['student', 'lecturer'].map(r => (
            <button key={r} onClick={() => {
                setRole(r);
                setForm({ name: '', email: '', password: '', confirmPassword: '', phone: '', studentId: '', staffId: '', course: '', department: '' });
              }} style={{
              flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', textTransform: 'capitalize',
              background: role === r ? (r === 'student' ? '#2563EB' : '#7C3AED') : '#F1F5F9',
              color: role === r ? 'white' : '#64748B', border: 'none',
              boxShadow: role === r ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
            }}>
              {r === 'student' ? '🎓 Student' : '👨‍🏫 Lecturer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input name="name" type="text" className="form-input" value={form.name} onChange={handleChange} placeholder="John Doe" style={{ paddingLeft: 38, width: '100%' }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input name="phone" type="tel" className="form-input" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" style={{ paddingLeft: 38, width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} placeholder={role === 'student' ? 'yourname@student.edutrack.edu' : 'yourname@lecturer.edutrack.edu'} style={{ paddingLeft: 38, width: '100%' }} />
            </div>
          </div>

          {role === 'student' ? (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Student ID *</label>
                <div style={{ position: 'relative' }}>
                  <FiBook style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input name="studentId" type="text" className="form-input" value={form.studentId} onChange={handleChange} placeholder="CS2025001" style={{ paddingLeft: 38, width: '100%' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Course / Programme</label>
                <div style={{ position: 'relative' }}>
                  <FiBook style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <select name="course" className="form-input form-select" value={form.course} onChange={handleChange} style={{ paddingLeft: 38, width: '100%' }}>
                    <option value="">Select your course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Department</label>
                <select name="department" className="form-input form-select" value={form.department} onChange={handleChange} style={{ width: '100%' }}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Staff ID *</label>
                <div style={{ position: 'relative' }}>
                  <FiBook style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input name="staffId" type="text" className="form-input" value={form.staffId} onChange={handleChange} placeholder="STAFF001" style={{ paddingLeft: 38, width: '100%' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department *</label>
                <select name="department" className="form-input form-select" value={form.department} onChange={handleChange} style={{ width: '100%' }}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input name="password" type={showPass ? 'text' : 'password'} className="form-input" value={form.password} onChange={handleChange} placeholder="Min 8 chars" style={{ paddingLeft: 38, paddingRight: 36, width: '100%' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                  {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>Uppercase, lowercase, number &amp; special character (@$!%*?&amp;)</span>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm *</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input name="confirmPassword" type="password" className="form-input" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter" style={{ paddingLeft: 38, width: '100%' }} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-full btn-lg" disabled={loading} style={{
            marginTop: 20, background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB, #7C3AED)',
            color: 'white', border: 'none', fontSize: '0.95rem', fontWeight: 700, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12,
          }}>
            {loading ? (
              <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Creating account...</>
            ) : '🚀 Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: '#64748B' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
