import 'package:dio/dio.dart';

import '../../../core/network/api_exception.dart';
import '../domain/service.dart';

class ServicesRepository {
  ServicesRepository(this._dio);

  final Dio _dio;

  Future<List<Category>> fetchCategories() async {
    try {
      final response = await _dio.get('/categories');
      return (response.data['data'] as List<dynamic>)
          .map((c) => Category.fromJson(c as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<PaginatedServices> fetchVendorServices({int page = 1, String? status}) async {
    try {
      final response = await _dio.get('/vendor/services', queryParameters: {
        'page': page,
        if (status != null && status != 'all') 'filter[status]': status,
      });
      return PaginatedServices.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Service> fetchVendorService(int id) async {
    try {
      final response = await _dio.get('/vendor/services/$id');
      return Service.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Service> createService({
    required int categoryId,
    required String title,
    String? shortDescription,
    String? description,
    int? basePrice,
    required String priceType,
    int? durationMinutes,
  }) async {
    try {
      final response = await _dio.post('/vendor/services', data: {
        'category_id': categoryId,
        'title': title,
        if (shortDescription != null && shortDescription.isNotEmpty) 'short_description': shortDescription,
        if (description != null && description.isNotEmpty) 'description': description,
        if (basePrice != null) 'base_price': basePrice,
        'price_type': priceType,
        if (durationMinutes != null) 'duration_minutes': durationMinutes,
      });
      return Service.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Service> updateService(
    int id, {
    int? categoryId,
    String? title,
    String? shortDescription,
    String? description,
    int? basePrice,
    String? priceType,
    int? durationMinutes,
    String? status,
  }) async {
    try {
      final response = await _dio.patch('/vendor/services/$id', data: {
        if (categoryId != null) 'category_id': categoryId,
        if (title != null) 'title': title,
        if (shortDescription != null) 'short_description': shortDescription,
        if (description != null) 'description': description,
        if (basePrice != null) 'base_price': basePrice,
        if (priceType != null) 'price_type': priceType,
        if (durationMinutes != null) 'duration_minutes': durationMinutes,
        if (status != null) 'status': status,
      });
      return Service.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> deleteService(int id) async {
    try {
      await _dio.delete('/vendor/services/$id');
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }
}
