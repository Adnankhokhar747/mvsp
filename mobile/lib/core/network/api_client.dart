import 'dart:io' show Platform;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

import '../storage/token_storage.dart';

/// Android emulators reach the host machine via 10.0.2.2, not localhost.
/// Web/Windows/iOS-simulator all reach it directly on the loopback address.
String _resolveBaseHost() {
  if (kIsWeb) return '127.0.0.1';
  try {
    if (Platform.isAndroid) return '10.0.2.2';
  } catch (_) {
    // Platform is unavailable in some embedder contexts; fall through.
  }
  return '127.0.0.1';
}

class ApiClient {
  ApiClient(this._tokenStorage) : dio = Dio(BaseOptions(
          baseUrl: 'http://${_resolveBaseHost()}:8000/api/v1',
          headers: {'Accept': 'application/json'},
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        )) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.readToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final Dio dio;
  final TokenStorage _tokenStorage;
}
