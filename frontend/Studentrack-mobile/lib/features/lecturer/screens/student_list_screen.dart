import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class StudentListScreen extends StatefulWidget {
  const StudentListScreen({super.key});
  @override
  State<StudentListScreen> createState() => _StudentListScreenState();
}

class _StudentListScreenState extends State<StudentListScreen> {
  String _search = '';
  String _filter = 'all';
  String? _selectedCourse;

  static const _courses = ['All Courses', 'CS301', 'CS302', 'CS305', 'CS306'];

  static const _students = [
    {'id': 'STU001', 'name': 'Alice Johnson', 'email': 'alice@student.edu', 'course': 'CS301', 'rate': 95, 'present': 19, 'total': 20, 'status': 'good'},
    {'id': 'STU002', 'name': 'Bob Martinez',  'email': 'bob@student.edu',   'course': 'CS301', 'rate': 80, 'present': 16, 'total': 20, 'status': 'average'},
    {'id': 'STU003', 'name': 'Carol Lee',      'email': 'carol@student.edu', 'course': 'CS302', 'rate': 70, 'present': 14, 'total': 20, 'status': 'at-risk'},
    {'id': 'STU004', 'name': 'David Chen',     'email': 'david@student.edu', 'course': 'CS302', 'rate': 90, 'present': 18, 'total': 20, 'status': 'good'},
    {'id': 'STU005', 'name': 'Emma Wilson',    'email': 'emma@student.edu',  'course': 'CS305', 'rate': 65, 'present': 13, 'total': 20, 'status': 'at-risk'},
    {'id': 'STU006', 'name': 'Frank Davis',    'email': 'frank@student.edu', 'course': 'CS305', 'rate': 85, 'present': 17, 'total': 20, 'status': 'good'},
    {'id': 'STU007', 'name': 'Grace Kim',      'email': 'grace@student.edu', 'course': 'CS306', 'rate': 75, 'present': 15, 'total': 20, 'status': 'average'},
    {'id': 'STU008', 'name': 'Henry Brown',    'email': 'henry@student.edu', 'course': 'CS306', 'rate': 55, 'present': 11, 'total': 20, 'status': 'at-risk'},
    {'id': 'STU009', 'name': 'Iris Taylor',    'email': 'iris@student.edu',  'course': 'CS301', 'rate': 100,'present': 20, 'total': 20, 'status': 'good'},
    {'id': 'STU010', 'name': 'Jack White',     'email': 'jack@student.edu',  'course': 'CS302', 'rate': 60, 'present': 12, 'total': 20, 'status': 'at-risk'},
  ];

  List<Map<String, dynamic>> get _filtered {
    return _students.where((s) {
      final matchSearch = _search.isEmpty ||
          (s['name'] as String).toLowerCase().contains(_search.toLowerCase()) ||
          (s['id'] as String).toLowerCase().contains(_search.toLowerCase());
      final matchFilter = _filter == 'all' || s['status'] == _filter;
      final matchCourse = _selectedCourse == null || _selectedCourse == 'All Courses' || s['course'] == _selectedCourse;
      return matchSearch && matchFilter && matchCourse;
    }).cast<Map<String, dynamic>>().toList();
  }

  Color _statusColor(String status) {
    if (status == 'good') return AppColors.accent;
    if (status == 'average') return AppColors.warning;
    return AppColors.danger;
  }

  Color _statusBg(String status) {
    if (status == 'good') return AppColors.accentLight;
    if (status == 'average') return AppColors.warningLight;
    return AppColors.dangerLight;
  }

  String _statusLabel(String status) {
    if (status == 'good') return 'Good';
    if (status == 'average') return 'Average';
    return 'At Risk';
  }

  void _showDetail(Map<String, dynamic> s) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          CircleAvatar(radius: 32, backgroundColor: AppColors.secondaryLight, child: Text((s['name'] as String)[0], style: const TextStyle(color: AppColors.secondary, fontWeight: FontWeight.w800, fontSize: 22))),
          const SizedBox(height: 12),
          Text(s['name'] as String, style: const TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.dark)),
          Text(s['id'] as String, style: const TextStyle(color: AppColors.gray, fontSize: 13)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(color: _statusBg(s['status'] as String), borderRadius: BorderRadius.circular(20)),
            child: Text(_statusLabel(s['status'] as String), style: TextStyle(color: _statusColor(s['status'] as String), fontWeight: FontWeight.w700)),
          ),
          const SizedBox(height: 20),
          Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
            _DetailStat('Attendance', '${s['rate']}%', _statusColor(s['status'] as String)),
            _DetailStat('Present', '${s['present']}', AppColors.accent),
            _DetailStat('Absent', '${(s['total'] as int) - (s['present'] as int)}', AppColors.danger),
            _DetailStat('Course', s['course'] as String, AppColors.secondary),
          ]),
          const SizedBox(height: 20),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(value: (s['rate'] as int) / 100, minHeight: 8, backgroundColor: AppColors.border, valueColor: AlwaysStoppedAnimation(_statusColor(s['status'] as String))),
          ),
          const SizedBox(height: 24),
          Row(children: [
            Expanded(child: OutlinedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.close_rounded, size: 16),
              label: const Text('Close'),
              style: OutlinedButton.styleFrom(foregroundColor: AppColors.gray, side: const BorderSide(color: AppColors.border), padding: const EdgeInsets.symmetric(vertical: 12)),
            )),
            const SizedBox(width: 12),
            Expanded(child: ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Alert sent to ${s['name']}'), backgroundColor: AppColors.warning, behavior: SnackBarBehavior.floating));
              },
              icon: const Icon(Icons.notification_important_rounded, size: 16),
              label: const Text('Send Alert'),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.warning, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 12)),
            )),
          ]),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = _filtered;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Student List', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
              child: Text('${list.length} students', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
            )),
          ),
        ],
      ),
      body: Column(children: [
        // Search + Filter header
        Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
          child: Column(children: [
            // Search bar
            TextField(
              onChanged: (v) => setState(() => _search = v),
              decoration: InputDecoration(
                hintText: 'Search by name or ID…',
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.gray, size: 20),
                filled: true,
                fillColor: AppColors.background,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.secondary)),
              ),
            ),
            const SizedBox(height: 8),
            // Course dropdown + status filters
            Row(children: [
              Expanded(child: DropdownButtonFormField<String>(
                initialValue: _selectedCourse ?? 'All Courses',
                items: _courses.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (v) => setState(() => _selectedCourse = v),
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.border)),
                  filled: true, fillColor: AppColors.background,
                ),
                style: const TextStyle(fontSize: 13, color: AppColors.dark),
              )),
              const SizedBox(width: 8),
              ...['all', 'good', 'average', 'at-risk'].map((f) {
                final sel = _filter == f;
                final colors = {'all': AppColors.secondary, 'good': AppColors.accent, 'average': AppColors.warning, 'at-risk': AppColors.danger};
                final c = colors[f]!;
                return GestureDetector(
                  onTap: () => setState(() => _filter = f),
                  child: Container(
                    margin: const EdgeInsets.only(left: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    decoration: BoxDecoration(color: sel ? c : Colors.transparent, borderRadius: BorderRadius.circular(8), border: Border.all(color: sel ? c : AppColors.border)),
                    child: Text(f == 'at-risk' ? '⚠' : f == 'all' ? 'All' : f == 'good' ? '✓' : '~', style: TextStyle(fontSize: 11, color: sel ? Colors.white : c, fontWeight: FontWeight.w700)),
                  ),
                );
              }),
            ]),
          ]),
        ),

        // Summary row
        Container(
          color: AppColors.background,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(children: [
            _SummaryChip('Good', _students.where((s) => s['status'] == 'good').length, AppColors.accent, AppColors.accentLight),
            const SizedBox(width: 6),
            _SummaryChip('Average', _students.where((s) => s['status'] == 'average').length, AppColors.warning, AppColors.warningLight),
            const SizedBox(width: 6),
            _SummaryChip('At Risk', _students.where((s) => s['status'] == 'at-risk').length, AppColors.danger, AppColors.dangerLight),
          ]),
        ),

        // List
        Expanded(
          child: list.isEmpty
              ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.people_outline_rounded, size: 64, color: AppColors.grayLight),
                  SizedBox(height: 12),
                  Text('No students found', style: TextStyle(color: AppColors.gray)),
                ]))
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: list.length,
                  itemBuilder: (_, i) {
                    final s = list[i];
                    final rate = s['rate'] as int;
                    final statusColor = _statusColor(s['status'] as String);
                    final statusBg = _statusBg(s['status'] as String);
                    return GestureDetector(
                      onTap: () => _showDetail(s),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6)],
                        ),
                        child: Row(children: [
                          CircleAvatar(radius: 20, backgroundColor: AppColors.secondaryLight, child: Text((s['name'] as String)[0], style: const TextStyle(color: AppColors.secondary, fontWeight: FontWeight.w800))),
                          const SizedBox(width: 12),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(s['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.dark)),
                            Text('${s['id']} · ${s['course']}', style: const TextStyle(fontSize: 11, color: AppColors.gray)),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(value: rate / 100, minHeight: 4, backgroundColor: AppColors.border, valueColor: AlwaysStoppedAnimation(statusColor)),
                            ),
                          ])),
                          const SizedBox(width: 12),
                          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(12)),
                              child: Text('$rate%', style: TextStyle(color: statusColor, fontWeight: FontWeight.w800, fontSize: 13, fontFamily: 'Poppins')),
                            ),
                            const SizedBox(height: 4),
                            Text(_statusLabel(s['status'] as String), style: TextStyle(fontSize: 10, color: statusColor, fontWeight: FontWeight.w600)),
                          ]),
                        ]),
                      ),
                    );
                  },
                ),
        ),
      ]),
    );
  }
}

class _DetailStat extends StatelessWidget {
  final String label, value;
  final Color color;
  const _DetailStat(this.label, this.value, this.color);
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(value, style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 18, color: color)),
    Text(label, style: const TextStyle(fontSize: 11, color: AppColors.gray)),
  ]);
}

class _SummaryChip extends StatelessWidget {
  final String label;
  final int count;
  final Color color, bg;
  const _SummaryChip(this.label, this.count, this.color, this.bg);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(16)),
    child: Text('$label: $count', style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12)),
  );
}
