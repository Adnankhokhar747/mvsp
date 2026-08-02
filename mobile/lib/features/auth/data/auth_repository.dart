import 'package:dio/dio.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/user.dart';

class AuthRepository {
  AuthRepository(this._dio, this._tokenStorage);

  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<AppUser> register({
    required String name,
    required String email,
    String? phone,
    required String password,
    required String role,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'name': name,
        'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        'password': password,
        'password_confirmation': password,
        'role': role,
      });
      return AppUser.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> sendOtp({required String email, required String purpose}) async {
    try {
      await _dio.post('/auth/otp/send', data: {'email': email, 'purpose': purpose});
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> verifyOtp({
    required String email,
    required String purpose,
    required String code,
  }) async {
    try {
      await _dio.post('/auth/otp/verify', data: {
        'email': email,
        'purpose': purpose,
        'code': code,
      });
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<AppUser> login({required String login, required String password}) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'login': login,
        'password': password,
        'device_name': 'mobile-app',
      });
      final token = response.data['token'] as String;
      await _tokenStorage.saveToken(token);
      return AppUser.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<AppUser?> me() async {
    try {
      final response = await _dio.get('/me');
      return AppUser.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        return null;
      }
      throw mapDioError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } on DioException {
      // Even if the network call fails, still clear the local token below.
    } finally {
      await _tokenStorage.clearToken();
    }
  }
}
