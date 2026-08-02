import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../data/messaging_repository.dart';
import 'message.dart';

final messagingRepositoryProvider = Provider<MessagingRepository>((ref) {
  return MessagingRepository(ref.watch(dioProvider));
});

final conversationsListProvider = FutureProvider.autoDispose.family<PaginatedConversations, int>((ref, page) {
  return ref.watch(messagingRepositoryProvider).fetchConversations(page: page);
});

final messagesProvider = FutureProvider.autoDispose.family<List<Message>, int>((ref, conversationId) {
  return ref.watch(messagingRepositoryProvider).fetchMessages(conversationId);
});
