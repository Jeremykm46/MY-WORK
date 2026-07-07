import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:percent_indicator/percent_indicator.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';

class StudentHomeScreen extends StatelessWidget {
  const StudentHomeScreen({super.key});

  static const _courses = [
    {'code': 'CS301', 'name': 'Data Structures', 'present': 22, 'total': 24, 'color': 0xFF2563EB},
    {'code': 'CS302', 'name': 'Operating Systems', 'present': 20, 'total': 24, 'color': 0xFF7C3AED},
    {'code': 'CS303', 'name': 'Database Mgmt', 'present': 18, 'total': 20, 'color': 0xFF10B981},
    {'code': 'CS304', 'name': 'Computer Networks', 'present': 14, 'total': 16, 'color': 0xFFF59E0B},
  ];

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Hero Header
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF1E3A5F), Color(0xFF2563EB)]),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 24, backgroundColor: Colors.white.withValues(alpha: 0.2),
                              child: Text(user?.initials ?? 'S', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('$greeting, ${user?.name.split(' ').first}! 👋',
                                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700, fontFamily: 'Poppins')),
                                  Text(user?.studentId ?? 'Student', style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 12)),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: Stack(children: [
                                const Icon(Icons.notifications_outlined, color: Colors.white, size: 26),
                                Positioned(top: 0, right: 0, child: Container(width: 8, height: 8, decoration: BoxDecoration(color: AppColors.danger, shape: BoxShape.circle, border: Border.all(color: AppColors.primary, width: 1.5)))),
                              ]),
                              onPressed: () => context.go('/student/notifications'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        // Overall stat
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                          child: Row(
                            children: [
                              const Icon(Icons.trending_up_rounded, color: Colors.white, size: 20),
                              const SizedBox(width: 8),
                              const Text('Overall Attendance: 91.4%', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                              const Spacer(),
                              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: AppColors.accentLight, borderRadius: BorderRadius.circular(8)), child: const Text('Good', style: TextStyle(color: AppColors.accent, fontSize: 11, fontWeight: FontWeight.w700))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Quick stats
                const Row(
                  children: [
                    _StatCard(value: '74', label: 'Classes\nAttended', color: AppColors.primary, bg: AppColors.primaryLight),
                    SizedBox(width: 12),
                    _StatCard(value: '7', label: 'Classes\nMissed', color: AppColors.danger, bg: AppColors.dangerLight),
                    SizedBox(width: 12),
                    _StatCard(value: '4', label: 'Active\nCourses', color: AppColors.secondary, bg: AppColors.secondaryLight),
                  ],
                ),
                const SizedBox(height: 20),

                // QR Scan button
                GestureDetector(
                  onTap: () => _showQRDialog(context),
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: AppColors.primaryGradient),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6))],
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 36),
                        SizedBox(width: 16),
                        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('Scan QR Code', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16, fontFamily: 'Poppins')),
                          Text('Mark your attendance now', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        ]),
                        Spacer(),
                        Icon(Icons.arrow_forward_ios_rounded, color: Colors.white70, size: 16),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Course attendance
                const Text('Course Attendance', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, fontFamily: 'Poppins', color: AppColors.dark)),
                const SizedBox(height: 12),
                ..._courses.map((c) {
                  final pct = (c['present'] as int) / (c['total'] as int);
                  final color = Color(c['color'] as int);
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)]),
                    child: Row(
                      children: [
                        CircularPercentIndicator(
                          radius: 28, lineWidth: 5, percent: pct,
                          center: Text('${(pct * 100).round()}%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: color)),
                          progressColor: color, backgroundColor: color.withValues(alpha: 0.15),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(c['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.dark)),
                            Text('${c['code']} · ${c['present']}/${c['total']} classes', style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                          ]),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(color: pct >= 0.75 ? AppColors.accentLight : AppColors.dangerLight, borderRadius: BorderRadius.circular(8)),
                          child: Text(pct >= 0.75 ? 'Good' : 'Low', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: pct >= 0.75 ? AppColors.accent : AppColors.danger)),
                        ),
                      ],
                    ),
                  );
                }),

                const SizedBox(height: 20),
                // Today's schedule
                const Text("Today's Schedule", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, fontFamily: 'Poppins', color: AppColors.dark)),
                const SizedBox(height: 12),
                ...[
                  {'time': '08:00 AM', 'course': 'Data Structures', 'room': 'Hall A', 'done': true},
                  {'time': '10:00 AM', 'course': 'Operating Systems', 'room': 'Lab 1A', 'done': true},
                  {'time': '02:00 PM', 'course': 'Database Mgmt', 'room': 'Lab 2B', 'done': false},
                  {'time': '04:00 PM', 'course': 'Computer Networks', 'room': 'Hall C', 'done': false},
                ].map((s) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white, borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: s['done'] == true ? AppColors.accentLight : AppColors.border),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6)],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 48, padding: const EdgeInsets.symmetric(vertical: 6),
                        decoration: BoxDecoration(color: s['done'] == true ? AppColors.accentLight : AppColors.background, borderRadius: BorderRadius.circular(8)),
                        child: Text(s['time'] as String, textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: s['done'] == true ? AppColors.accent : AppColors.gray)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(s['course'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.dark)),
                          Text(s['room'] as String, style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                        ]),
                      ),
                      if (s['done'] == true)
                        const Icon(Icons.check_circle_rounded, color: AppColors.accent, size: 20)
                      else
                        const Icon(Icons.schedule_rounded, color: AppColors.warning, size: 20),
                    ],
                  ),
                )),
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  void _showQRDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.all(28),
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            const Text('Scan QR Code', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 20)),
            const SizedBox(height: 8),
            const Text('Point your camera at the QR code\ndisplayed by your lecturer.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.gray, fontSize: 14)),
            const SizedBox(height: 24),
            Container(
              width: 180, height: 180, decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.qr_code_scanner_rounded, size: 80, color: AppColors.primary),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(color: AppColors.accentLight, borderRadius: BorderRadius.circular(10)),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.check_circle_rounded, color: AppColors.accent, size: 16),
                SizedBox(width: 8),
                Text('Camera active — Waiting for QR', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.w700, fontSize: 13)),
              ]),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value, label;
  final Color color, bg;
  const _StatCard({required this.value, required this.label, required this.color, required this.bg});

  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)]),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 22, color: color)),
          const SizedBox(height: 4),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.gray)),
        ],
      ),
    ),
  );
}
