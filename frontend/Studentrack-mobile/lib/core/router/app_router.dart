import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/student/screens/student_shell.dart';
import '../../features/student/screens/student_home_screen.dart';
import '../../features/student/screens/student_attendance_screen.dart';
import '../../features/student/screens/student_notifications_screen.dart';
import '../../features/student/screens/student_profile_screen.dart';
import '../../features/lecturer/screens/lecturer_shell.dart';
import '../../features/lecturer/screens/lecturer_home_screen.dart';
import '../../features/lecturer/screens/take_attendance_screen.dart';
import '../../features/lecturer/screens/attendance_history_screen.dart';
import '../../features/lecturer/screens/student_list_screen.dart';
import '../../features/lecturer/screens/attendance_summary_screen.dart';

class AppRouter {
  static GoRouter createRouter(AuthProvider auth) {
    return GoRouter(
      initialLocation: '/splash',
      refreshListenable: auth,
      redirect: (context, state) {
        final loggedIn = auth.isLoggedIn;
        final role = auth.user?.role;
        final path = state.uri.path;

        if (path == '/splash') return null;
        if (!loggedIn && path != '/login' && path != '/register') return '/login';
        if (loggedIn && (path == '/login' || path == '/register')) {
          return role == 'student' ? '/student' : '/lecturer';
        }
        return null;
      },
      routes: [
        GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
        GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
        GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),

        // Student shell with bottom nav
        ShellRoute(
          builder: (_, __, child) => StudentShell(child: child),
          routes: [
            GoRoute(path: '/student', builder: (_, __) => const StudentHomeScreen()),
            GoRoute(path: '/student/attendance', builder: (_, __) => const StudentAttendanceScreen()),
            GoRoute(path: '/student/notifications', builder: (_, __) => const StudentNotificationsScreen()),
            GoRoute(path: '/student/profile', builder: (_, __) => const StudentProfileScreen()),
          ],
        ),

        // Lecturer shell
        ShellRoute(
          builder: (_, __, child) => LecturerShell(child: child),
          routes: [
            GoRoute(path: '/lecturer', builder: (_, __) => const LecturerHomeScreen()),
            GoRoute(path: '/lecturer/take-attendance', builder: (_, __) => const TakeAttendanceScreen()),
            GoRoute(path: '/lecturer/history', builder: (_, __) => const AttendanceHistoryScreen()),
            GoRoute(path: '/lecturer/students', builder: (_, __) => const StudentListScreen()),
            GoRoute(path: '/lecturer/summary', builder: (_, __) => const AttendanceSummaryScreen()),
          ],
        ),
      ],
    );
  }
}
