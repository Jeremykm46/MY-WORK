import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';

class LecturerHomeScreen extends StatelessWidget {
  const LecturerHomeScreen({super.key});

  static const _todayCourses = [
    {'code': 'CS301', 'name': 'Data Structures', 'time': '08:00 AM', 'room': 'Hall A', 'students': 45, 'done': true, 'present': 42},
    {'code': 'CS302', 'name': 'Operating Systems', 'time': '10:00 AM', 'room': 'Lab 1A', 'students': 38, 'done': true, 'present': 35},
    {'code': 'CS305', 'name': 'Algorithm Analysis', 'time': '02:00 PM', 'room': 'Hall B', 'students': 52, 'done': false, 'present': 0},
    {'code': 'CS306', 'name': 'Software Engineering', 'time': '04:00 PM', 'room': 'Hall C', 'students': 40, 'done': false, 'present': 0},
  ];

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: AppColors.secondary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF3B0764), Color(0xFF7C3AED)])),
                child: SafeArea(child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.end, children: [
                    Row(children: [
                      CircleAvatar(radius: 24, backgroundColor: Colors.white.withValues(alpha: 0.2), child: Text(user?.initials ?? 'L', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16))),
                      const SizedBox(width: 12),
                      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Welcome, ${user?.name.split(' ').take(2).join(' ')} 👨‍🏫', style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700, fontFamily: 'Poppins')),
                        Text(user?.designation ?? 'Lecturer', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
                      ]),
                    ]),
                    const SizedBox(height: 14),
                    const Row(children: [
                      _HeroBadge('4 Classes Today'),
                      SizedBox(width: 8),
                      _HeroBadge('175 Students'),
                      SizedBox(width: 8),
                      _HeroBadge('87% Avg Rate', color: AppColors.accent),
                    ]),
                  ]),
                )),
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(delegate: SliverChildListDelegate([
              // Quick action — Start attendance
              GestureDetector(
                onTap: () => context.go('/lecturer/take-attendance'),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF2563EB)]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: AppColors.secondary.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: const Row(children: [
                    Icon(Icons.qr_code_rounded, color: Colors.white, size: 36),
                    SizedBox(width: 14),
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Start Attendance Session', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15, fontFamily: 'Poppins')),
                      Text('Generate QR or manual entry', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    ]),
                    Spacer(),
                    Icon(Icons.arrow_forward_ios_rounded, color: Colors.white70, size: 16),
                  ]),
                ),
              ),
              const SizedBox(height: 20),

              // Stats
              const Row(children: [
                _StatCard2('175', "Students", AppColors.secondary, AppColors.secondaryLight),
                SizedBox(width: 10),
                _StatCard2('77', "Present\nToday", AppColors.accent, AppColors.accentLight),
                SizedBox(width: 10),
                _StatCard2('3', "Alerts", AppColors.danger, AppColors.dangerLight),
              ]),
              const SizedBox(height: 20),

              const Text("Today's Classes", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, fontFamily: 'Poppins', color: AppColors.dark)),
              const SizedBox(height: 12),
              ..._todayCourses.map((c) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: c['done'] == true ? AppColors.accentLight : AppColors.border), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6)]),
                child: Row(children: [
                  Container(
                    width: 48, padding: const EdgeInsets.symmetric(vertical: 6),
                    decoration: BoxDecoration(color: c['done'] == true ? AppColors.accentLight : AppColors.secondaryLight, borderRadius: BorderRadius.circular(8)),
                    child: Text(c['time'] as String, textAlign: TextAlign.center, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: c['done'] == true ? AppColors.accent : AppColors.secondary)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(c['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.dark)),
                    Text('${c['code']} · ${c['room']} · ${c['students']} students', style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                  ])),
                  if (c['done'] == true)
                    Column(children: [
                      Text('${c['present']}/${c['students']}', style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.accent, fontSize: 13)),
                      const Text('present', style: TextStyle(fontSize: 10, color: AppColors.gray)),
                    ])
                  else
                    GestureDetector(
                      onTap: () => context.go('/lecturer/take-attendance'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(color: AppColors.secondary, borderRadius: BorderRadius.circular(8)),
                        child: const Text('Start', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ),
                ]),
              )),
              const SizedBox(height: 80),
            ])),
          ),
        ],
      ),
    );
  }
}

class _HeroBadge extends StatelessWidget {
  final String label;
  final Color? color;
  const _HeroBadge(this.label, {this.color});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
    child: Text(label, style: TextStyle(color: color ?? Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
  );
}

class _StatCard2 extends StatelessWidget {
  final String value, label;
  final Color color, bg;
  const _StatCard2(this.value, this.label, this.color, this.bg);
  @override
  Widget build(BuildContext context) => Expanded(child: Container(
    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
    child: Column(children: [
      Text(value, style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 22, color: color)),
      Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: AppColors.gray, fontWeight: FontWeight.w600)),
    ]),
  ));
}
