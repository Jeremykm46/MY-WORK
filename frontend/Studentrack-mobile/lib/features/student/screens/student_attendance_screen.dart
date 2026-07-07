import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class StudentAttendanceScreen extends StatefulWidget {
  const StudentAttendanceScreen({super.key});
  @override
  State<StudentAttendanceScreen> createState() => _StudentAttendanceScreenState();
}

class _StudentAttendanceScreenState extends State<StudentAttendanceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  String _filter = 'all';

  static const _records = [
    {'date': 'May 25, 2024', 'course': 'Data Structures', 'code': 'CS301', 'time': '08:00 AM', 'status': 'present'},
    {'date': 'May 25, 2024', 'course': 'Operating Systems', 'code': 'CS302', 'time': '10:00 AM', 'status': 'present'},
    {'date': 'May 24, 2024', 'course': 'Database Mgmt', 'code': 'CS303', 'time': '02:00 PM', 'status': 'absent'},
    {'date': 'May 23, 2024', 'course': 'Computer Networks', 'code': 'CS304', 'time': '09:00 AM', 'status': 'late'},
    {'date': 'May 23, 2024', 'course': 'Data Structures', 'code': 'CS301', 'time': '08:00 AM', 'status': 'present'},
    {'date': 'May 22, 2024', 'course': 'Operating Systems', 'code': 'CS302', 'time': '10:00 AM', 'status': 'present'},
    {'date': 'May 21, 2024', 'course': 'Computer Networks', 'code': 'CS304', 'time': '09:00 AM', 'status': 'absent'},
  ];

  static const _summary = [
    {'code': 'CS301', 'name': 'Data Structures', 'present': 22, 'absent': 1, 'late': 0, 'total': 24},
    {'code': 'CS302', 'name': 'Operating Systems', 'present': 20, 'absent': 1, 'late': 2, 'total': 24},
    {'code': 'CS303', 'name': 'Database Mgmt', 'present': 18, 'absent': 2, 'late': 0, 'total': 20},
    {'code': 'CS304', 'name': 'Computer Networks', 'present': 14, 'absent': 2, 'late': 1, 'total': 16},
  ];

  @override
  void initState() { super.initState(); _tabs = TabController(length: 2, vsync: this); }
  @override
  void dispose() { _tabs.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final filtered = _filter == 'all' ? _records : _records.where((r) => r['status'] == _filter).toList();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Attendance', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabs,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: const [Tab(text: 'Records'), Tab(text: 'Summary')],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          // Records tab
          Column(children: [
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.white,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['all', 'present', 'absent', 'late'].map((f) => GestureDetector(
                    onTap: () => setState(() => _filter = f),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                      decoration: BoxDecoration(
                        color: _filter == f ? AppColors.primary : AppColors.background,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: _filter == f ? AppColors.primary : AppColors.border),
                      ),
                      child: Text(f[0].toUpperCase() + f.substring(1), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: _filter == f ? Colors.white : AppColors.gray)),
                    ),
                  )).toList(),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: filtered.length,
                itemBuilder: (_, i) {
                  final r = filtered[i];
                  final statusConfig = {
                    'present': {'color': AppColors.accent, 'bg': AppColors.accentLight, 'icon': Icons.check_circle_rounded},
                    'absent':  {'color': AppColors.danger, 'bg': AppColors.dangerLight,  'icon': Icons.cancel_rounded},
                    'late':    {'color': AppColors.warning, 'bg': AppColors.warningLight, 'icon': Icons.watch_later_rounded},
                  }[r['status']]!;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6)]),
                    child: Row(
                      children: [
                        Container(width: 44, height: 44, decoration: BoxDecoration(color: statusConfig['bg'] as Color, shape: BoxShape.circle), child: Icon(statusConfig['icon'] as IconData, color: statusConfig['color'] as Color, size: 22)),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(r['course'] as String, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.dark)),
                          Text('${r['code']} · ${r['time']}', style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                          Text(r['date'] as String, style: const TextStyle(fontSize: 11, color: AppColors.grayLight)),
                        ])),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(color: statusConfig['bg'] as Color, borderRadius: BorderRadius.circular(20)),
                          child: Text((r['status'] as String)[0].toUpperCase() + (r['status'] as String).substring(1), style: TextStyle(color: statusConfig['color'] as Color, fontSize: 12, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ]),

          // Summary tab
          ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: _summary.length,
            itemBuilder: (_, i) {
              final c = _summary[i];
              final rate = (c['present'] as int) / (c['total'] as int);
              final rateInt = (rate * 100).round();
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)]),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(c['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.dark, fontFamily: 'Poppins')),
                      Text(c['code'] as String, style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                    ])),
                    Text('$rateInt%', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 22, color: rateInt >= 75 ? AppColors.accent : AppColors.danger)),
                  ]),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: rate, minHeight: 8,
                      backgroundColor: AppColors.border,
                      valueColor: AlwaysStoppedAnimation(rateInt >= 75 ? AppColors.accent : AppColors.danger),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                    _SummaryChip(label: 'Present', value: c['present'].toString(), color: AppColors.accent, bg: AppColors.accentLight),
                    _SummaryChip(label: 'Absent', value: c['absent'].toString(), color: AppColors.danger, bg: AppColors.dangerLight),
                    _SummaryChip(label: 'Late', value: c['late'].toString(), color: AppColors.warning, bg: AppColors.warningLight),
                    _SummaryChip(label: 'Total', value: c['total'].toString(), color: AppColors.primary, bg: AppColors.primaryLight),
                  ]),
                  if (rateInt < 75) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(color: AppColors.warningLight, borderRadius: BorderRadius.circular(8)),
                      child: Row(children: [
                        const Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 16),
                        const SizedBox(width: 8),
                        Expanded(child: Text('Attend ${((0.75 * (c['total'] as int)) - (c['present'] as int)).ceil()} more classes to reach 75%', style: const TextStyle(color: Color(0xFF92400E), fontSize: 12, fontWeight: FontWeight.w600))),
                      ]),
                    ),
                  ],
                ]),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _SummaryChip extends StatelessWidget {
  final String label, value;
  final Color color, bg;
  const _SummaryChip({required this.label, required this.value, required this.color, required this.bg});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
    child: Column(children: [
      Text(value, style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 16, color: color)),
      Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    ]),
  );
}
