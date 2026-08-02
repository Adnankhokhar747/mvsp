import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/utils/date_format.dart';
import '../../shell/presentation/home_shell.dart';
import '../domain/messaging_providers.dart';

class ConversationsListScreen extends ConsumerWidget {
  const ConversationsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversationsAsync = ref.watch(conversationsListProvider(1));
    final isVendorMode = ref.watch(effectiveVendorModeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Messages')),
      body: conversationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("Couldn't load messages."),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () => ref.invalidate(conversationsListProvider(1)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (result) {
          if (result.data.isEmpty) {
            return const Center(child: Text('No conversations yet.'));
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(conversationsListProvider(1)),
            child: ListView.separated(
              itemCount: result.data.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final conversation = result.data[index];
                final title = isVendorMode ? (conversation.customerName ?? 'Customer') : (conversation.vendorName ?? 'Vendor');
                return ListTile(
                  onTap: () => context.push('/messages/${conversation.id}'),
                  title: Text(
                    title,
                    style: TextStyle(fontWeight: conversation.unreadCount > 0 ? FontWeight.w700 : FontWeight.w500),
                  ),
                  subtitle: Text(
                    conversation.lastMessageAt != null ? formatDateTime(conversation.lastMessageAt!) : 'No messages yet',
                  ),
                  trailing: conversation.unreadCount > 0
                      ? Chip(
                          label: Text('${conversation.unreadCount}'),
                          visualDensity: VisualDensity.compact,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        )
                      : const Icon(Icons.chevron_right_rounded),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
