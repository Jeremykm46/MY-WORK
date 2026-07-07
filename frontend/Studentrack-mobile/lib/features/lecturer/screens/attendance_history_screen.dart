import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class AttendanceHistoryScreen extends StatelessWidget {
  const AttendanceHistoryScreen({super.key});

  static const _history = [
    {'date': 'May 25, 2024', 'course': 'Data Structures', 'code': 'CS301', 'total': 45, 'present': 42, 'absent': 2, 'late': 1, 'method': 'QR Code'},
    {'date': 'May 25, 2024', 'course': 'Operating Systems', 'code': 'CS302', 'total': 38, 'present': 35, 'absent': 3, 'late': 0, 'method': 'QR Code'},
    {'date': 'May 24, 2024', 'course': 'Data Structures', 'code': 'CS301', 'total': 45, 'present': 40, 'absent': 4, 'late': 1, 'method': 'Manual'},
    {'date': 'May 24, 2024', 'course': 'Algorithm Analysis', 'code': 'CS305', 'total': 52, 'present': 48, 'absent': 3, 'late': 1, 'method': 'QR Code'},
    {'date': 'May 23, 2024', 'course': 'Operating Systems', 'code': 'CS302', 'total': 38, 'present': 30, 'absent': 6, 'late': 2, 'method': 'Manual'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Attendance History', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _history.length,
        itemBuilder: (_, i) {
          final h = _history[i];
          final rate = ((h['present'] as int) / (h['total'] as int) * 100).round();
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)]),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(h['course'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.dark)),
                  Text('${h['code']} · ${h['date']}', style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                ])),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(color: rate >= 85 ? AppColors.accentLight : rate >= 75 ? AppColors.primaryLight : AppColors.dangerLight, borderRadius: BorderRadius.circular(20)),
                  child: Text('$rate%', style: TextStyle(fontWeight: FontWeight.w800, color: rate >= 85 ? AppColors.accent : rate >= 75 ? AppColors.primary : AppColors.danger, fontFamily: 'Poppins', fontSize: 14)),
                ),
              ]),
              const SizedBox(height: 10),
              ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: (h['present'] as int) / (h['total'] as int), minHeight: 6, backgroundColor: AppColors.border, valueColor: AlwaysStoppedAnimation(rate >= 75 ? AppColors.accent : AppColors.danger))),
              const SizedBox(height: 10),
              Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                _Stat('Present', '${h['present']}', AppColors.accent),
                _Stat('Absent', '${h['absent']}', AppColors.danger),
                _Stat('Late', '${h['late']}', AppColors.warning),
                _Stat('Method', h['method'] as String, AppColors.primary),
              ]),
            ]),
          );
        },
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label, value;
  final Color color;
  const _Stat(this.label, this.value, this.color);
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(value, style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 15, color: color)),
    Text(label, style: const TextStyle(fontSize: 10, color: AppColors.gray)),
  ]);
}
