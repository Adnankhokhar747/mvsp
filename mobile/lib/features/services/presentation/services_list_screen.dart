import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/utils/money.dart';
import '../domain/services_providers.dart';
import 'service_status_chip.dart';

const _statusOptions = [
  ('all', 'All'),
  ('draft', 'Draft'),
  ('active', 'Active'),
  ('paused', 'Paused'),
  ('rejected', 'Rejected'),
];

class ServicesListScreen extends ConsumerStatefulWidget {
  const ServicesListScreen({super.key});

  @override
  ConsumerState<ServicesListScreen> createState() => _ServicesListScreenState();
}

class _ServicesListScreenState extends ConsumerState<ServicesListScreen> {
  int _page = 1;
  String _status = 'all';

  @override
  Widget build(BuildContext context) {
    final servicesAsync = ref.watch(vendorServicesListProvider((page: _page, status: _status)));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Services'),
        actions: [
          IconButton(
            onPressed: () => context.push('/services/new'),
            icon: const Icon(Icons.add_rounded),
            tooltip: 'New service',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                for (final option in _statusOptions)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                    child: ChoiceChip(
                      label: Text(option.$2),
                      selected: _status == option.$1,
                      onSelected: (_) => setState(() {
                        _status = option.$1;
                        _page = 1;
                      }),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
      body: servicesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("Couldn't load your services."),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () => ref.invalidate(vendorServicesListProvider((page: _page, status: _status))),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (result) {
          if (result.data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('No services yet.'),
                  const SizedBox(height: 8),
                  FilledButton(onPressed: () => context.push('/services/new'), child: const Text('New service')),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(vendorServicesListProvider((page: _page, status: _status))),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: result.data.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final service = result.data[index];
                return ListTile(
                  onTap: () => context.push('/services/${service.id}'),
                  title: Row(
                    children: [
                      Expanded(
                        child: Text(
                          service.title,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      ServiceStatusChip(status: service.status),
                    ],
                  ),
                  subtitle: Row(
                    children: [
                      if (service.categoryName != null) ...[
                        Flexible(child: Text(service.categoryName!, overflow: TextOverflow.ellipsis)),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        service.priceType == 'quote'
                            ? 'Quote on request'
                            : formatMoney(service.basePrice ?? 0, service.currencyCode),
                      ),
                    ],
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                );
              },
            ),
          );
        },
      ),
      bottomNavigationBar: servicesAsync.maybeWhen(
        data: (result) => result.lastPage > 1
            ? SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      onPressed: _page > 1 ? () => setState(() => _page -= 1) : null,
                      icon: const Icon(Icons.chevron_left_rounded),
                    ),
                    Text('Page $_page of ${result.lastPage}'),
                    IconButton(
                      onPressed: _page < result.lastPage ? () => setState(() => _page += 1) : null,
                      icon: const Icon(Icons.chevron_right_rounded),
                    ),
                  ],
                ),
              )
            : null,
        orElse: () => null,
      ),
    );
  }
}
