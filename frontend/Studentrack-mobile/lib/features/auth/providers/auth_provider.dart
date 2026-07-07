import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'dart:convert';
import '../../../core/network/api_client.dart';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? studentId;
  final String? course;
  final String? department;
  final String? designation;
  final String? phone;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.studentId,
    this.course,
    this.department,
    this.designation,
    this.phone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'].toString(),
    name: json['name'] ?? '',
    email: json['email'] ?? '',
    role: json['role'] ?? '',
    studentId: json['studentId'],
    course: json['course'],
    department: json['department'],
    designation: json['designation'],
    phone: json['phone'],
  );

  /// Maps the shape returned by `GET /auth/profile`, which uses snake_case
  /// column names and splits department across student/lecturer joins.
  factory UserModel.fromProfileResponse(Map<String, dynamic> json) => UserModel(
    id: json['id'].toString(),
    name: json['name'] ?? '',
    email: json['email'] ?? '',
    role: json['role'] ?? '',
    studentId: json['student_id'],
    department: json['role'] == 'student' ? json['student_department'] : json['lecturer_department'],
    phone: json['phone'],
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'email': email, 'role': role,
    'studentId': studentId, 'course': course, 'department': department,
    'designation': designation, 'phone': phone,
  };

  String get initials => name.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();
}

class AuthProvider extends ChangeNotifier {
  final _api = ApiClient.instance;

  UserModel? _user;
  bool _loading = true;
  String? _error;

  UserModel? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isLoading => _loading;
  String? get error => _error;

  AuthProvider() { _loadUser(); }

  Future<void> _loadUser() async {
    final token = await _api.readToken();
    if (token == null) {
      _loading = false;
      notifyListeners();
      return;
    }

    try {
      final res = await _api.dio.get('/auth/profile');
      _user = UserModel.fromProfileResponse(res.data['data']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('edutrack_user', jsonEncode(_user!.toJson()));
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        await _api.clearToken();
      } else {
        // Offline or server unreachable — fall back to the last known profile.
        final prefs = await SharedPreferences.getInstance();
        final saved = prefs.getString('edutrack_user');
        if (saved != null) _user = UserModel.fromJson(jsonDecode(saved));
      }
    } catch (_) {}

    _loading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _error = null;
    notifyListeners();

    try {
      final res = await _api.dio.post('/auth/login', data: {'email': email, 'password': password});
      final data = res.data['data'];
      await _api.saveToken(data['token']);

      // The login response only carries basic fields — fetch the full
      // profile (studentId/department/etc.) for the rest of the app.
      final profileRes = await _api.dio.get('/auth/profile');
      _user = UserModel.fromProfileResponse(profileRes.data['data']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('edutrack_user', jsonEncode(_user!.toJson()));
    } catch (e) {
      _error = ApiClient.messageFrom(e);
    }
    notifyListeners();
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String role,
    String? studentId,
    String? staffId,
    String? department,
    String? phone,
  }) async {
    _error = null;
    notifyListeners();

    try {
      await _api.dio.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        if (studentId != null) 'studentId': studentId,
        if (staffId != null) 'staffId': staffId,
        if (department != null) 'department': department,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      });
    } catch (e) {
      _error = ApiClient.messageFrom(e);
    }
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      await _api.dio.post('/auth/logout');
    } catch (_) {
      // Best-effort — clear the local session regardless of server response.
    }
    _user = null;
    await _api.clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('edutrack_user');
    notifyListeners();
  }

  void clearError() { _error = null; notifyListeners(); }
}
