import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class StudentShell extends StatelessWidget {
  final Widget child;
  const StudentShell({super.key, required this.child});

  static const _tabs = [
    {'path': '/student',              'icon': Icons.home_rounded,        'label': 'Home'},
    {'path': '/student/attendance',   'icon': Icons.check_circle_outline, 'label': 'Attendance'},
    {'path': '/student/notifications','icon': Icons.notifications_outlined,'label': 'Alerts'},
    {'path': '/student/profile',      'icon': Icons.person_outline,       'label': 'Profile'},
  ];

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).uri.path;
    for (int i = 0; i < _tabs.length; i++) {
      if (loc == _tabs[i]['path']) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final current = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Color(0x12000000), blurRadius: 16, offset: Offset(0, -4))],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_tabs.length, (i) {
                final selected = current == i;
                return GestureDetector(
                  onTap: () => context.go(_tabs[i]['path'] as String),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primaryLight : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_tabs[i]['icon'] as IconData, size: 22, color: selected ? AppColors.primary : AppColors.grayLight),
                        const SizedBox(height: 3),
                        Text(_tabs[i]['label'] as String, style: TextStyle(fontSize: 10, fontWeight: selected ? FontWeight.w700 : FontWeight.w500, color: selected ? AppColors.primary : AppColors.grayLight)),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}
