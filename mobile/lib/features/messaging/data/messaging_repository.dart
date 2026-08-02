import 'package:dio/dio.dart';

import '../../../core/network/api_exception.dart';
import '../domain/message.dart';

class MessagingRepository {
  MessagingRepository(this._dio);

  final Dio _dio;

  Future<PaginatedConversations> fetchConversations({int page = 1}) async {
    try {
      final response = await _dio.get('/conversations', queryParameters: {'page': page});
      return PaginatedConversations.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<List<Message>> fetchMessages(int conversationId) async {
    try {
      final response = await _dio.get('/conversations/$conversationId/messages');
      return (response.data['data'] as List<dynamic>).map((m) => Message.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Message> sendMessage(int conversationId, String body) async {
    try {
      final response = await _dio.post('/conversations/$conversationId/messages', data: {'body': body});
      return Message.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }
}
