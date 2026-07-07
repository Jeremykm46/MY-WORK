import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import StudentLayout from './pages/Student/StudentLayout';
import StudentHome from './pages/Student/StudentHome';
import StudentAttendance from './pages/Student/StudentAttendance';
import StudentNotifications from './pages/Student/StudentNotifications';
import StudentProfile from './pages/Student/StudentProfile';

import LecturerLayout from './pages/Lecturer/LecturerLayout';
import LecturerHome from './pages/Lecturer/LecturerHome';
import AttendanceTaking from './pages/Lecturer/AttendanceTaking';
import AttendanceHistory from './pages/Lecturer/AttendanceHistory';
import StudentList from './pages/Lecturer/StudentList';
import AttendanceSummary from './pages/Lecturer/AttendanceSummary';

import AdminLayout from './pages/Admin/AdminLayout';
import AdminHome from './pages/Admin/AdminHome';
import StudentManagement from './pages/Admin/StudentManagement';
import LecturerManagement from './pages/Admin/LecturerManagement';
import CourseManagement from './pages/Admin/CourseManagement';
import AttendanceRecords from './pages/Admin/AttendanceRecords';
import ReportsAnalytics from './pages/Admin/ReportsAnalytics';
import SystemMonitoring from './pages/Admin/SystemMonitoring';
import AdminSettings from './pages/Admin/AdminSettings';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F1F5F9' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:'4px solid #DBEAFE', borderTopColor:'#2563EB', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'#64748B', fontSize:'0.9rem', fontFamily:'Inter,sans-serif' }}>Loading StudentTrack...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} replace /> : <Register />} />

      <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentHome />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route path="/lecturer" element={<ProtectedRoute allowedRole="lecturer"><LecturerLayout /></ProtectedRoute>}>
        <Route index element={<LecturerHome />} />
        <Route path="take-attendance" element={<AttendanceTaking />} />
        <Route path="history" element={<AttendanceHistory />} />
        <Route path="students" element={<StudentList />} />
        <Route path="summary" element={<AttendanceSummary />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminHome />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="lecturers" element={<LecturerManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="attendance" element={<AttendanceRecords />} />
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route path="monitoring" element={<SystemMonitoring />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: { fontFamily: 'Inter,sans-serif', fontSize: '0.875rem', borderRadius: '10px', padding: '12px 16px' },
          success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: 'white' } },
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
