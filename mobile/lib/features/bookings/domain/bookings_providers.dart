import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../data/bookings_repository.dart';
import 'booking.dart';

final bookingsRepositoryProvider = Provider<BookingsRepository>((ref) {
  return BookingsRepository(ref.watch(dioProvider));
});

typedef BookingsListParams = ({int page, String status});

final bookingsListProvider =
    FutureProvider.autoDispose.family<PaginatedBookings, BookingsListParams>((ref, params) {
  return ref.watch(bookingsRepositoryProvider).fetchBookings(page: params.page, status: params.status);
});

final bookingDetailProvider = FutureProvider.autoDispose.family<Booking, int>((ref, id) {
  return ref.watch(bookingsRepositoryProvider).fetchBooking(id);
});
