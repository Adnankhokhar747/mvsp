import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/utils/money.dart';
import '../domain/bookings_providers.dart';
import 'booking_status_chip.dart';

const _statusOptions = [
  ('all', 'All'),
  ('pending', 'Pending'),
  ('quoted', 'Quoted'),
  ('confirmed', 'Confirmed'),
  ('in_progress', 'In Progress'),
  ('completed', 'Completed'),
  ('cancelled', 'Cancelled'),
];

class BookingsListScreen extends ConsumerStatefulWidget {
  const BookingsListScreen({super.key});

  @override
  ConsumerState<BookingsListScreen> createState() => _BookingsListScreenState();
}

class _BookingsListScreenState extends ConsumerState<BookingsListScreen> {
  int _page = 1;
  String _status = 'all';

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(bookingsListProvider((page: _page, status: _status)));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bookings'),
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
      body: bookingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("Couldn't load bookings."),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () => ref.invalidate(bookingsListProvider((page: _page, status: _status))),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (result) {
          if (result.data.isEmpty) {
            return const Center(child: Text('No bookings here yet.'));
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(bookingsListProvider((page: _page, status: _status))),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: result.data.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final booking = result.data[index];
                final needsQuote = booking.bookingMode == 'request' && booking.status == 'pending';
                return ListTile(
                  onTap: () => context.push('/bookings/${booking.id}'),
                  title: Row(
                    children: [
                      Expanded(
                        child: Text(
                          booking.serviceTitle ?? 'Booking #${booking.bookingNumber}',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      BookingStatusChip(status: booking.status),
                    ],
                  ),
                  subtitle: Row(
                    children: [
                      Flexible(
                        child: Text(
                          booking.customer?.name ?? booking.vendorName ?? '',
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(booking.price != null ? formatMoney(booking.price!, booking.currencyCode) : 'Awaiting quote'),
                      if (needsQuote) ...[
                        const SizedBox(width: 8),
                        const Chip(
                          label: Text('Needs quote', style: TextStyle(fontSize: 11)),
                          visualDensity: VisualDensity.compact,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ],
                    ],
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                );
              },
            ),
          );
        },
      ),
      bottomNavigationBar: bookingsAsync.maybeWhen(
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
