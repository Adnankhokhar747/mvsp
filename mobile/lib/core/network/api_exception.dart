import 'package:dio/dio.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.fieldErrors});

  final String message;
  final Map<String, List<String>>? fieldErrors;

  @override
  String toString() => message;
}

ApiException mapDioError(DioException error) {
  final data = error.response?.data;
  if (data is Map<String, dynamic>) {
    final message = data['message'] as String?;
    final rawErrors = data['errors'];
    Map<String, List<String>>? fieldErrors;
    if (rawErrors is Map<String, dynamic>) {
      fieldErrors = rawErrors.map(
        (key, value) => MapEntry(key, (value as List).map((e) => e.toString()).toList()),
      );
    }
    if (message != null) {
      return ApiException(message, fieldErrors: fieldErrors);
    }
  }
  return ApiException('Something went wrong. Please try again.');
}
