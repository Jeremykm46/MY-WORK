import 'package:flutter/foundation.dart';

class AppNotification {
  final String id, type, title, message, time;
  bool read;
  AppNotification({required this.id, required this.type, required this.title, required this.message, required this.time, this.read = false});
}

class NotificationProvider extends ChangeNotifier {
  final List<AppNotification> _notifications = [
    AppNotification(id: '1', type: 'warning', title: 'Low Attendance', message: 'CS303 attendance dropped to 80%', time: '2 hrs ago'),
    AppNotification(id: '2', type: 'success', title: 'Attendance Marked', message: 'CS302 attendance recorded', time: '4 hrs ago'),
    AppNotification(id: '3', type: 'info', title: 'Class Rescheduled', message: 'CS303 moved to May 27', time: 'Yesterday'),
  ];

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _notifications.where((n) => !n.read).length;

  void markRead(String id) {
    final n = _notifications.firstWhere((n) => n.id == id, orElse: () => _notifications.first);
    n.read = true;
    notifyListeners();
  }

  void markAllRead() {
    for (final n in _notifications) { n.read = true; }
    notifyListeners();
  }
}
