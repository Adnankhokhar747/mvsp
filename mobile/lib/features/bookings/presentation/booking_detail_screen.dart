import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../shared/utils/date_format.dart';
import '../../../shared/utils/money.dart';
import '../../shell/presentation/home_shell.dart';
import '../domain/booking.dart';
import '../domain/bookings_providers.dart';
import 'booking_status_chip.dart';

class BookingDetailScreen extends ConsumerWidget {
  const BookingDetailScreen({super.key, required this.bookingId});

  final int bookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(bookingDetailProvider(bookingId));
    final isVendorMode = ref.watch(effectiveVendorModeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Booking details')),
      body: bookingAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("Couldn't load this booking."),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () => ref.invalidate(bookingDetailProvider(bookingId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (booking) => _BookingDetailBody(booking: booking, isVendorMode: isVendorMode),
      ),
    );
  }
}

class _BookingDetailBody extends ConsumerWidget {
  const _BookingDetailBody({required this.booking, required this.isVendorMode});

  final Booking booking;
  final bool isVendorMode;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingQuote = booking.pendingQuote;
    final canCancel = ['pending', 'quoted', 'confirmed'].contains(booking.status);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                booking.serviceTitle ?? 'Booking #${booking.bookingNumber}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
            BookingStatusChip(status: booking.status),
          ],
        ),
        const SizedBox(height: 4),
        Text('#${booking.bookingNumber}', style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _InfoRow(label: 'With', value: isVendorMode ? (booking.customer?.name ?? '—') : (booking.vendorName ?? '—')),
                _InfoRow(
                  label: 'Scheduled',
                  value: booking.scheduledAt != null ? formatDateTime(booking.scheduledAt!) : 'Not scheduled',
                ),
                _InfoRow(
                  label: 'Price',
                  value: booking.price != null ? formatMoney(booking.price!, booking.currencyCode) : 'Awaiting quote',
                ),
                if (booking.notes != null && booking.notes!.isNotEmpty) _InfoRow(label: 'Notes', value: booking.notes!),
              ],
            ),
          ),
        ),

        if (pendingQuote != null) ...[
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Quote', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text(formatMoney(pendingQuote.quotedPrice, booking.currencyCode)),
                  if (pendingQuote.message != null) ...[
                    const SizedBox(height: 4),
                    Text(pendingQuote.message!, style: Theme.of(context).textTheme.bodyMedium),
                  ],
                  if (!isVendorMode) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        FilledButton(
                          onPressed: () => _acceptQuote(context, ref),
                          child: const Text('Accept'),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          onPressed: () => _rejectQuote(context, ref),
                          child: const Text('Decline'),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],

        if (isVendorMode && booking.bookingMode == 'request' && booking.status == 'pending' && pendingQuote == null) ...[
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => _showSubmitQuoteDialog(context, ref),
            icon: const Icon(Icons.request_quote_outlined),
            label: const Text('Submit a quote'),
          ),
        ],

        if (isVendorMode && booking.status == 'confirmed') ...[
          const SizedBox(height: 16),
          FilledButton(onPressed: () => _updateStatus(context, ref, 'start'), child: const Text('Start service')),
        ],

        if (isVendorMode && booking.status == 'in_progress') ...[
          const SizedBox(height: 16),
          FilledButton(onPressed: () => _updateStatus(context, ref, 'complete'), child: const Text('Mark complete')),
        ],

        if (canCancel) ...[
          const SizedBox(height: 12),
          OutlinedButton(
            style: OutlinedButton.styleFrom(foregroundColor: Theme.of(context).colorScheme.error),
            onPressed: () => _confirmCancel(context, ref),
            child: const Text('Cancel booking'),
          ),
        ],

        if (booking.statusHistory.isNotEmpty) ...[
          const SizedBox(height: 24),
          Text('History', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          for (final event in booking.statusHistory)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  BookingStatusChip(status: event.toStatus),
                  const SizedBox(width: 8),
                  Text(formatDateTime(event.createdAt), style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
        ],
      ],
    );
  }

  void _showError(BuildContext context, Object error) {
    final message = error is ApiException ? error.message : 'Something went wrong. Please try again.';
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _acceptQuote(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(bookingsRepositoryProvider).acceptQuote(booking.id);
      ref.invalidate(bookingDetailProvider(booking.id));
    } catch (error) {
      if (context.mounted) _showError(context, error);
    }
  }

  Future<void> _rejectQuote(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(bookingsRepositoryProvider).rejectQuote(booking.id);
      ref.invalidate(bookingDetailProvider(booking.id));
    } catch (error) {
      if (context.mounted) _showError(context, error);
    }
  }

  Future<void> _updateStatus(BuildContext context, WidgetRef ref, String action) async {
    try {
      await ref.read(bookingsRepositoryProvider).updateStatus(booking.id, action);
      ref.invalidate(bookingDetailProvider(booking.id));
    } catch (error) {
      if (context.mounted) _showError(context, error);
    }
  }

  Future<void> _confirmCancel(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel this booking?'),
        content: const Text('This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Keep booking')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Cancel booking')),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;

    try {
      await ref.read(bookingsRepositoryProvider).cancelBooking(booking.id);
      ref.invalidate(bookingDetailProvider(booking.id));
    } catch (error) {
      if (context.mounted) _showError(context, error);
    }
  }

  Future<void> _showSubmitQuoteDialog(BuildContext context, WidgetRef ref) async {
    final priceController = TextEditingController();
    final messageController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final submitted = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit a quote'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: priceController,
                decoration: InputDecoration(labelText: 'Price (${booking.currencyCode})'),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) =>
                    (value == null || double.tryParse(value) == null) ? 'Enter a valid amount' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: messageController,
                decoration: const InputDecoration(labelText: 'Message (optional)'),
                maxLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              if (formKey.currentState!.validate()) Navigator.pop(context, true);
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );

    if (submitted != true || !context.mounted) return;

    try {
      final priceMinorUnits = (double.parse(priceController.text) * 100).round();
      await ref.read(bookingsRepositoryProvider).submitQuote(
            booking.id,
            quotedPrice: priceMinorUnits,
            message: messageController.text.trim().isEmpty ? null : messageController.text.trim(),
          );
      ref.invalidate(bookingDetailProvider(booking.id));
    } catch (error) {
      if (context.mounted) _showError(context, error);
    }
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 90, child: Text(label, style: Theme.of(context).textTheme.bodySmall)),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}
