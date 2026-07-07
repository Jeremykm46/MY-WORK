import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiCheckSquare, FiBell, FiUser, FiLogOut, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { MdOutlineSchool } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/student', label: 'Home', icon: <FiHome />, end: true },
  { to: '/student/attendance', label: 'My Attendance', icon: <FiCheckSquare /> },
  { to: '/student/notifications', label: 'Notifications', icon: <FiBell /> },
  { to: '/student/profile', label: 'Profile', icon: <FiUser /> },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';

  return (
    <div className="dashboard-layout">
      {/* Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, display: 'none' }} className="sidebar-overlay" />}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MdOutlineSchool size={22} color="white" />
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#1E293B', lineHeight: 1 }}>
                Student<span style={{ color: '#2563EB' }}>Track</span>
              </p>
              <p style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500, marginTop: 2 }}>Student Portal</p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar avatar-md avatar-placeholder" style={{ fontSize: '0.85rem', background: '#DBEAFE', color: '#2563EB' }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.studentId || 'Student'}</p>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: '5px 10px', background: '#D1FAE5', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 600 }}>Active</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 4px', marginBottom: 8 }}>Main Menu</p>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ marginBottom: 2 }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px' }}>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', background: '#FEE2E2', color: '#EF4444', border: 'none' }}>
            <FiLogOut className="nav-icon" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', padding: 4 }}>
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>Student Dashboard</p>
              <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavLink to="/student/notifications" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 6 }}>
              <FiBell size={20} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid white' }} />
            </NavLink>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
                <div className="avatar avatar-sm avatar-placeholder" style={{ background: '#DBEAFE', color: '#2563EB', fontSize: '0.75rem', fontWeight: 700 }}>{initials}</div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{user?.name?.split(' ')[0]}</span>
                <FiChevronDown size={14} color="#94A3B8" />
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 180, zIndex: 200, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>{user?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{user?.email}</p>
                  </div>
                  <NavLink to="/student/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', color: '#334155', textDecoration: 'none', fontSize: '0.875rem' }}>
                    <FiUser size={14} /> My Profile
                  </NavLink>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', borderTop: '1px solid #E2E8F0' }}>
                    <FiLogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
