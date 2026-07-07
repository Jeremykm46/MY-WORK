import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class LecturerShell extends StatelessWidget {
  final Widget child;
  const LecturerShell({super.key, required this.child});

  static const _tabs = [
    {'path': '/lecturer',                'icon': Icons.dashboard_rounded,      'label': 'Home'},
    {'path': '/lecturer/take-attendance','icon': Icons.qr_code_scanner_rounded,'label': 'Attend'},
    {'path': '/lecturer/students',       'icon': Icons.people_rounded,          'label': 'Students'},
    {'path': '/lecturer/summary',        'icon': Icons.bar_chart_rounded,       'label': 'Summary'},
  ];

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).uri.path;
    for (int i = 0; i < _tabs.length; i++) {
      if (loc.startsWith(_tabs[i]['path'] as String)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final current = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Color(0x12000000), blurRadius: 16, offset: Offset(0, -4))]),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_tabs.length, (i) {
                final sel = current == i;
                return GestureDetector(
                  onTap: () => context.go(_tabs[i]['path'] as String),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(color: sel ? AppColors.secondaryLight : Colors.transparent, borderRadius: BorderRadius.circular(12)),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(_tabs[i]['icon'] as IconData, size: 22, color: sel ? AppColors.secondary : AppColors.grayLight),
                      const SizedBox(height: 3),
                      Text(_tabs[i]['label'] as String, style: TextStyle(fontSize: 10, fontWeight: sel ? FontWeight.w700 : FontWeight.w500, color: sel ? AppColors.secondary : AppColors.grayLight)),
                    ]),
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
