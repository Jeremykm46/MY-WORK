import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class TakeAttendanceScreen extends StatefulWidget {
  const TakeAttendanceScreen({super.key});
  @override
  State<TakeAttendanceScreen> createState() => _TakeAttendanceScreenState();
}

class _TakeAttendanceScreenState extends State<TakeAttendanceScreen> {
  String? _selectedCourse;
  bool _sessionActive = false;
  int _timer = 300;
  Timer? _timerRef;
  final Map<String, String> _attendance = {};

  static const _courses = [
    {'code': 'CS301', 'name': 'Data Structures & Algorithms', 'room': 'Hall A', 'time': '08:00 AM', 'count': 45},
    {'code': 'CS302', 'name': 'Operating Systems', 'room': 'Lab 1A', 'time': '10:00 AM', 'count': 38},
    {'code': 'CS305', 'name': 'Algorithm Analysis', 'room': 'Hall B', 'time': '02:00 PM', 'count': 52},
    {'code': 'CS306', 'name': 'Software Engineering', 'room': 'Hall C', 'time': '04:00 PM', 'count': 40},
  ];

  static const _students = [
    {'id': 'STU001', 'name': 'Alice Johnson'}, {'id': 'STU002', 'name': 'Bob Martinez'},
    {'id': 'STU003', 'name': 'Carol Lee'}, {'id': 'STU004', 'name': 'David Chen'},
    {'id': 'STU005', 'name': 'Emma Wilson'}, {'id': 'STU006', 'name': 'Frank Davis'},
    {'id': 'STU007', 'name': 'Grace Kim'}, {'id': 'STU008', 'name': 'Henry Brown'},
  ];

  void _startSession() {
    setState(() { _sessionActive = true; _timer = 300; });
    _timerRef = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) { t.cancel(); return; }
      setState(() { if (_timer <= 0) { _sessionActive = false; t.cancel(); } else { _timer--; } });
    });
  }

  void _endSession() {
    _timerRef?.cancel();
    setState(() => _sessionActive = false);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Session ended. Attendance saved!'), backgroundColor: AppColors.accent, behavior: SnackBarBehavior.floating));
  }

  String get _timerStr => '${(_timer ~/ 60).toString().padLeft(2, '0')}:${(_timer % 60).toString().padLeft(2, '0')}';

  @override
  void dispose() { _timerRef?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Take Attendance', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _selectedCourse == null ? _courseSelector() : _attendanceSession(),
    );
  }

  Widget _courseSelector() => ListView(
    padding: const EdgeInsets.all(16),
    children: [
      const Text('Select a Class', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700, fontSize: 18, color: AppColors.dark)),
      const SizedBox(height: 4),
      const Text('Tap a course to begin attendance', style: TextStyle(color: AppColors.gray, fontSize: 13)),
      const SizedBox(height: 16),
      ..._courses.map((c) => GestureDetector(
        onTap: () { setState(() { _selectedCourse = c['code'] as String; for (final s in _students) { _attendance[s['id']!] = 'present'; } }); },
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)]),
          child: Row(children: [
            Container(width: 44, height: 44, decoration: BoxDecoration(color: AppColors.secondaryLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.book_rounded, color: AppColors.secondary)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(c['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.dark)),
              Text('${c['code']} · ${c['room']} · ${c['time']}', style: const TextStyle(fontSize: 12, color: AppColors.gray)),
            ])),
            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.grayLight),
          ]),
        ),
      )),
    ],
  );

  Widget _attendanceSession() {
    final course = _courses.firstWhere((c) => c['code'] == _selectedCourse);
    final present = _attendance.values.where((v) => v == 'present').length;
    final late = _attendance.values.where((v) => v == 'late').length;
    final absent = _attendance.values.where((v) => v == 'absent').length;

    return Column(children: [
      Container(
        padding: const EdgeInsets.all(16),
        color: AppColors.secondary,
        child: Column(children: [
          Row(children: [
            GestureDetector(onTap: () => setState(() => _selectedCourse = null), child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 22)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(course['name'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
              Text('${course['code']} · ${course['room']}', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
            ])),
          ]),
          const SizedBox(height: 12),
          if (_sessionActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
              child: Row(children: [
                const Icon(Icons.timer_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Text('Session Active · $_timerStr', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                const Spacer(),
                GestureDetector(onTap: _endSession, child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(8)), child: const Text('End', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)))),
              ]),
            )
          else
            GestureDetector(
              onTap: _startSession,
              child: Container(
                width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.qr_code_rounded, color: AppColors.secondary),
                  SizedBox(width: 8),
                  Text('Generate QR Session', style: TextStyle(color: AppColors.secondary, fontWeight: FontWeight.w700)),
                ]),
              ),
            ),
        ]),
      ),

      // Counts
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        color: Colors.white,
        child: Row(children: [
          _CountBadge('P', present, AppColors.accent, AppColors.accentLight),
          const SizedBox(width: 8),
          _CountBadge('L', late, AppColors.warning, AppColors.warningLight),
          const SizedBox(width: 8),
          _CountBadge('A', absent, AppColors.danger, AppColors.dangerLight),
          const Spacer(),
          GestureDetector(onTap: () => setState(() { for (final s in _students) { _attendance[s['id']!] = 'present'; } }), child: const Text('All Present', style: TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.w700))),
        ]),
      ),

      Expanded(
        child: ListView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: _students.length,
          itemBuilder: (_, i) {
            final s = _students[i];
            final status = _attendance[s['id']] ?? 'present';
            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
              child: Row(children: [
                SizedBox(width: 24, child: Text('${i + 1}', style: const TextStyle(fontSize: 12, color: AppColors.grayLight), textAlign: TextAlign.center)),
                const SizedBox(width: 10),
                CircleAvatar(radius: 16, backgroundColor: AppColors.secondaryLight, child: Text(s['name']![0], style: const TextStyle(color: AppColors.secondary, fontWeight: FontWeight.w700, fontSize: 12))),
                const SizedBox(width: 10),
                Expanded(child: Text(s['name']!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.dark))),
                Row(children: [
                  for (final st in ['present', 'late', 'absent'])
                    GestureDetector(
                      onTap: () => setState(() => _attendance[s['id']!] = st),
                      child: Container(
                        width: 32, height: 32, margin: const EdgeInsets.only(left: 4),
                        decoration: BoxDecoration(
                          color: status == st ? (st == 'present' ? AppColors.accent : st == 'late' ? AppColors.warning : AppColors.danger) : AppColors.background,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: st == 'present' ? AppColors.accent : st == 'late' ? AppColors.warning : AppColors.danger, width: status == st ? 0 : 1.5),
                        ),
                        child: Icon(
                          st == 'present' ? Icons.check_rounded : st == 'late' ? Icons.watch_later_rounded : Icons.close_rounded,
                          size: 16, color: status == st ? Colors.white : (st == 'present' ? AppColors.accent : st == 'late' ? AppColors.warning : AppColors.danger),
                        ),
                      ),
                    ),
                ]),
              ]),
            );
          },
        ),
      ),

      // Save button
      Padding(
        padding: const EdgeInsets.all(16),
        child: SizedBox(width: double.infinity, child: ElevatedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Attendance saved successfully!'), backgroundColor: AppColors.accent, behavior: SnackBarBehavior.floating));
            setState(() => _selectedCourse = null);
          },
          icon: const Icon(Icons.save_rounded),
          label: const Text('Save Attendance'),
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.secondary, padding: const EdgeInsets.symmetric(vertical: 14)),
        )),
      ),
    ]);
  }
}

class _CountBadge extends StatelessWidget {
  final String label;
  final int count;
  final Color color, bg;
  const _CountBadge(this.label, this.count, this.color, this.bg);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
    child: Text('$label: $count', style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12)),
  );
}
