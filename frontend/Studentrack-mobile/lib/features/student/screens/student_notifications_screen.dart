import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class StudentNotificationsScreen extends StatefulWidget {
  const StudentNotificationsScreen({super.key});
  @override
  State<StudentNotificationsScreen> createState() => _StudentNotificationsScreenState();
}

class _StudentNotificationsScreenState extends State<StudentNotificationsScreen> {
  final _notifs = [
    {'type': 'warning', 'title': 'Low Attendance Warning', 'message': 'Your attendance in CS303 has dropped to 80%. Minimum required is 75%.', 'time': '2 hrs ago', 'read': false},
    {'type': 'success', 'title': 'Attendance Marked', 'message': 'Attendance recorded for Operating Systems (CS302) at 10:00 AM.', 'time': '4 hrs ago', 'read': false},
    {'type': 'success', 'title': 'Attendance Marked', 'message': 'Attendance recorded for Data Structures (CS301) at 08:00 AM.', 'time': '6 hrs ago', 'read': true},
    {'type': 'info', 'title': 'Class Rescheduled', 'message': 'Database Mgmt class on May 26 moved to May 27, 02:00 PM (Lab 2B).', 'time': 'Yesterday', 'read': false},
    {'type': 'danger', 'title': 'Absence Recorded', 'message': 'You were marked absent for Database Mgmt (CS303) on May 24, 2024.', 'time': 'Yesterday', 'read': true},
    {'type': 'info', 'title': 'Exam Schedule Released', 'message': 'End-of-semester exam schedule has been published.', 'time': '2 days ago', 'read': true},
  ];

  final _typeConfig = const {
    'warning': {'color': Color(0xFF92400E), 'bg': Color(0xFFFEF3C7), 'border': Color(0xFFF59E0B), 'icon': Icons.warning_amber_rounded},
    'success': {'color': Color(0xFF065F46), 'bg': Color(0xFFD1FAE5), 'border': Color(0xFF10B981), 'icon': Icons.check_circle_outline},
    'info':    {'color': Color(0xFF1E40AF), 'bg': Color(0xFFDBEAFE), 'border': Color(0xFF2563EB), 'icon': Icons.info_outline},
    'danger':  {'color': Color(0xFF991B1B), 'bg': Color(0xFFFEE2E2), 'border': Color(0xFFEF4444), 'icon': Icons.cancel_outlined},
  };

  void _markRead(int i) => setState(() => _notifs[i]['read'] = true);
  void _markAllRead() => setState(() { for (final n in _notifs) { n['read'] = true; } });

  @override
  Widget build(BuildContext context) {
    final unread = _notifs.where((n) => n['read'] == false).length;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (unread > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text('Mark all read', style: TextStyle(color: Colors.white70, fontSize: 12)),
            ),
        ],
      ),
      body: Column(
        children: [
          if (unread > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: AppColors.primaryLight,
              child: Row(children: [
                Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Text('$unread unread notification${unread > 1 ? 's' : ''}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ]),
            ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _notifs.length,
              itemBuilder: (_, i) {
                final n = _notifs[i];
                final cfg = _typeConfig[n['type']]!;
                return GestureDetector(
                  onTap: () => _markRead(i),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white, borderRadius: BorderRadius.circular(12),
                      border: Border(left: BorderSide(color: cfg['border'] as Color, width: 4)),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
                    ),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Container(width: 36, height: 36, decoration: BoxDecoration(color: cfg['bg'] as Color, shape: BoxShape.circle), child: Icon(cfg['icon'] as IconData, color: cfg['color'] as Color, size: 18)),
                      const SizedBox(width: 10),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [
                          Expanded(child: Text(n['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.dark))),
                          if (n['read'] == false)
                            Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.danger, shape: BoxShape.circle)),
                        ]),
                        const SizedBox(height: 4),
                        Text(n['message'] as String, style: const TextStyle(fontSize: 12, color: AppColors.gray, height: 1.5)),
                        const SizedBox(height: 6),
                        Text(n['time'] as String, style: const TextStyle(fontSize: 11, color: AppColors.grayLight)),
                      ])),
                    ]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
