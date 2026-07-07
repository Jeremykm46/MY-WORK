import { Link } from 'react-router-dom';
import {
  FiCheckCircle, FiUsers, FiBarChart2, FiBell, FiShield,
  FiSmartphone, FiGlobe, FiArrowRight, FiStar,
  FiClock, FiTrendingUp, FiMapPin
} from 'react-icons/fi';
import { MdOutlineSchool, MdOutlineQrCode2 } from 'react-icons/md';

const FEATURES = [
  { icon: <MdOutlineQrCode2 size={28} />, title: 'QR Code Attendance', desc: 'Students scan QR codes for instant, contactless attendance marking in real-time.', color: '#2563EB', bg: '#DBEAFE' },
  { icon: <FiBell size={28} />, title: 'Smart Notifications', desc: 'Automated alerts for absences, low attendance, and upcoming deadlines sent instantly.', color: '#7C3AED', bg: '#EDE9FE' },
  { icon: <FiBarChart2 size={28} />, title: 'Analytics & Reports', desc: 'Comprehensive dashboards with charts and exportable reports for data-driven decisions.', color: '#10B981', bg: '#D1FAE5' },
  { icon: <FiSmartphone size={28} />, title: 'Mobile App', desc: 'Native Flutter mobile app for Android & iOS — attendance on the go, anytime.', color: '#F59E0B', bg: '#FEF3C7' },
  { icon: <FiShield size={28} />, title: 'Secure & Reliable', desc: 'Enterprise-grade security with role-based access control and audit trails.', color: '#EF4444', bg: '#FEE2E2' },
  { icon: <FiGlobe size={28} />, title: 'Real-time Sync', desc: 'All attendance data syncs instantly across web and mobile platforms.', color: '#0891B2', bg: '#CFFAFE' },
];

const STATS = [
  { value: '10,000+', label: 'Active Students' },
  { value: '500+', label: 'Lecturers' },
  { value: '98.5%', label: 'Accuracy Rate' },
  { value: '50+', label: 'Institutions' },
];

const TESTIMONIALS = [
  { name: 'Prof. James Wilson', role: 'Head of CS Department', text: 'StudentTrack transformed our attendance process. What used to take 10 minutes now takes 30 seconds. The analytics are incredibly insightful.', rating: 5 },
  { name: 'Emily Chen', role: 'University Student', text: 'I love how easy it is to check my attendance on my phone. The notifications remind me when I\'m falling below the required percentage.', rating: 5 },
  { name: 'Dr. Maria Santos', role: 'University Registrar', text: 'The admin dashboard gives us a complete picture of attendance across all departments. Reports generation is a breeze now.', rating: 5 },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdOutlineSchool size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'white' }}>
              Student<span style={{ color: '#60A5FA' }}>Track</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/login" style={{ padding: '8px 18px', borderRadius: 8, color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}>
              Sign In
            </Link>
            <Link to="/register" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #1E40AF 100%)', display: 'flex', alignItems: 'center', padding: '100px 5% 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Floating blobs */}
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 320, height: 320, background: 'rgba(124,58,237,0.18)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 240, height: 240, background: 'rgba(16,185,129,0.12)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div style={{ animation: 'fadeInUp 0.7s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#93C5FD', fontSize: '0.82rem', fontWeight: 600 }}>Real-time Attendance System</span>
            </div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '3.2rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20 }}>
              Smart Attendance,<br />
              <span style={{ background: 'linear-gradient(135deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Smarter Education
              </span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 36, maxWidth: 500 }}>
              StudentTrack is a hybrid attendance management platform combining QR-based web check-ins with a seamless mobile app — giving schools real-time visibility and control.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 6px 24px rgba(37,99,235,0.4)' }}>
                Start Free Today <FiArrowRight />
              </Link>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
            {/* Trust badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {['QR Scan', 'GPS Verify', 'Face ID'].map(tag => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiCheckCircle size={14} color="#10B981" />
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview Cards */}
          <div style={{ position: 'relative', animation: 'fadeInUp 0.9s ease both' }}>
            {/* Main card */}
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginBottom: 4 }}>Today's Attendance</p>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '1.6rem', fontFamily: 'Poppins, sans-serif' }}>94.2%</p>
                </div>
                <div style={{ width: 48, height: 48, background: 'rgba(16,185,129,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiTrendingUp size={24} color="#10B981" />
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                <div style={{ width: '94.2%', height: '100%', background: 'linear-gradient(90deg, #10B981, #06B6D4)', borderRadius: 8 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ color: '#10B981', fontSize: '0.78rem', fontWeight: 600 }}>▲ 3.2% from last week</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>847 / 899 students</span>
              </div>
            </div>
            {/* Mini cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Classes Today', value: '24', icon: <FiClock size={18} />, color: '#60A5FA' },
                { label: 'Live Sessions', value: '8', icon: <FiUsers size={18} />, color: '#A78BFA' },
                { label: 'Alerts Sent', value: '12', icon: <FiBell size={18} />, color: '#FCD34D' },
                { label: 'Departments', value: '6', icon: <FiMapPin size={18} />, color: '#6EE7B7' },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: item.color }}>{item.icon}</div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{item.value}</p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'linear-gradient(135deg, #1E3A5F, #1E40AF)', padding: '48px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: '#60A5FA', marginBottom: 4 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 5%', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ background: '#DBEAFE', color: '#2563EB', padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>FEATURES</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 14 }}>Everything You Need</h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>A complete attendance ecosystem designed for modern educational institutions.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: 'white', borderRadius: 18, padding: 28, border: '1px solid #E2E8F0', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: 56, height: 56, background: f.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 5%', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ background: '#D1FAE5', color: '#10B981', padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>HOW IT WORKS</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 14 }}>Three Simple Steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            {[
              { step: '01', title: 'Lecturer Starts Session', desc: 'Lecturer opens the app, selects the course, and generates a unique QR code or attendance pin for the class.', color: '#2563EB', bg: '#DBEAFE' },
              { step: '02', title: 'Students Check In', desc: 'Students scan the QR code via mobile app or enter the pin on web — attendance is marked instantly and verified.', color: '#7C3AED', bg: '#EDE9FE' },
              { step: '03', title: 'Admin Gets Insights', desc: 'All data flows into the admin dashboard in real-time with automated reports, alerts, and analytics.', color: '#10B981', bg: '#D1FAE5' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ width: 72, height: 72, background: s.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.step}</div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.9rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '100px 5%', background: '#F1F5F9' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ background: '#FEF3C7', color: '#F59E0B', padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>TESTIMONIALS</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.4rem', fontWeight: 800, color: '#1E293B' }}>Trusted by Educators</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: 'white', borderRadius: 18, padding: 28, border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[...Array(t.rating)].map((_, i) => <FiStar key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div>
                  <p style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{t.name}</p>
                  <p style={{ color: '#64748B', fontSize: '0.8rem' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 5%', background: 'linear-gradient(135deg, #0F172A, #1E3A5F)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.6rem', fontWeight: 800, color: 'white', marginBottom: 16 }}>
            Ready to Transform Attendance?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', marginBottom: 40, lineHeight: 1.8 }}>
            Join 50+ institutions already using StudentTrack. Get started free today — no credit card required.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '15px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 6px 24px rgba(37,99,235,0.45)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Create Free Account <FiArrowRight />
            </Link>
            <Link to="/login" style={{ padding: '15px 36px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
              Admin Login →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0F172A', padding: '48px 5% 28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MdOutlineSchool size={20} color="white" />
              </div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: 'white' }}>
                Student<span style={{ color: '#60A5FA' }}>Track</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {['About', 'Features', 'Contact'].map(l => (
                <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>© 2024 StudentTrack. All rights reserved.</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Smart Attendance · Smarter Education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
