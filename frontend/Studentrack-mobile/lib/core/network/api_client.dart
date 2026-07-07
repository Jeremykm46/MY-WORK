import 'dart:io' show Platform;
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Base URL for the EduTrack backend API.
///
/// The Android emulator can't reach the host machine via `localhost` — it
/// needs the special `10.0.2.2` alias. A physical device needs the host
/// machine's LAN IP instead; override with `--dart-define=API_BASE_URL=...`
/// when running against one.
String get _defaultBaseUrl {
  if (Platform.isAndroid) return 'http://10.0.2.2:5000/api/v1';
  return 'http://localhost:5000/api/v1';
}

const _tokenKey = 'edutrack_token';

class ApiClient {
  ApiClient._internal() {
    dio = Dio(BaseOptions(
      baseUrl: const String.fromEnvironment('API_BASE_URL', defaultValue: ''),
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
    ));
    if (dio.options.baseUrl.isEmpty) dio.options.baseUrl = _defaultBaseUrl;

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: _tokenKey);
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
    ));
  }

  static final ApiClient instance = ApiClient._internal();
  static const _storage = FlutterSecureStorage();

  late final Dio dio;

  Future<void> saveToken(String token) => _storage.write(key: _tokenKey, value: token);
  Future<String?> readToken() => _storage.read(key: _tokenKey);
  Future<void> clearToken() => _storage.delete(key: _tokenKey);

  /// Extracts the backend's `{ success, message }` error envelope from a
  /// failed request, falling back to a generic message.
  static String messageFrom(Object err) {
    if (err is DioException) {
      final data = err.response?.data;
      if (data is Map && data['message'] is String) return data['message'] as String;
      if (err.type == DioExceptionType.connectionTimeout ||
          err.type == DioExceptionType.connectionError) {
        return 'Could not reach the server. Check your connection and try again.';
      }
    }
    return 'Something went wrong. Please try again.';
  }
}
