import 'package:flutter/foundation.dart';

class AttendanceRecord {
  final String date, course, code, status;
  const AttendanceRecord({required this.date, required this.course, required this.code, required this.status});
}

class AttendanceProvider extends ChangeNotifier {
  final List<AttendanceRecord> _records = const [
    AttendanceRecord(date: 'May 25, 2024', course: 'Data Structures', code: 'CS301', status: 'present'),
    AttendanceRecord(date: 'May 25, 2024', course: 'Operating Systems', code: 'CS302', status: 'present'),
    AttendanceRecord(date: 'May 24, 2024', course: 'Database Mgmt', code: 'CS303', status: 'absent'),
    AttendanceRecord(date: 'May 23, 2024', course: 'Computer Networks', code: 'CS304', status: 'late'),
  ];

  List<AttendanceRecord> get records => _records;
  double get overallRate => _records.isEmpty ? 0 : _records.where((r) => r.status == 'present').length / _records.length;
}
