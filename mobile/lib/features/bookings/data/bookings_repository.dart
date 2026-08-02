import 'package:dio/dio.dart';

import '../../../core/network/api_exception.dart';
import '../domain/booking.dart';

class BookingsRepository {
  BookingsRepository(this._dio);

  final Dio _dio;

  Future<PaginatedBookings> fetchBookings({int page = 1, String? status}) async {
    try {
      final response = await _dio.get('/bookings', queryParameters: {
        'page': page,
        if (status != null && status != 'all') 'filter[status]': status,
      });
      return PaginatedBookings.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Booking> fetchBooking(int id) async {
    try {
      final response = await _dio.get('/bookings/$id');
      return Booking.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> acceptQuote(int bookingId) async {
    try {
      await _dio.post('/bookings/$bookingId/quote/accept');
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> rejectQuote(int bookingId) async {
    try {
      await _dio.post('/bookings/$bookingId/quote/reject');
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> cancelBooking(int id, {String? reason}) async {
    try {
      await _dio.post('/bookings/$id/cancel', data: {if (reason != null && reason.isNotEmpty) 'reason': reason});
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> submitQuote(int bookingId, {required int quotedPrice, int? quotedDuration, String? message}) async {
    try {
      await _dio.post('/vendor/bookings/$bookingId/quote', data: {
        'quoted_price': quotedPrice,
        if (quotedDuration != null) 'quoted_duration': quotedDuration,
        if (message != null && message.isNotEmpty) 'message': message,
      });
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> updateStatus(int bookingId, String action) async {
    try {
      await _dio.post('/vendor/bookings/$bookingId/status', data: {'action': action});
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }
}
