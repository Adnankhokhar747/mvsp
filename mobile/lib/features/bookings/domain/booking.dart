class BookingQuote {
  BookingQuote({
    required this.id,
    required this.bookingId,
    required this.quotedPrice,
    this.quotedDuration,
    this.message,
    required this.status,
    this.expiresAt,
    required this.createdAt,
  });

  factory BookingQuote.fromJson(Map<String, dynamic> json) => BookingQuote(
        id: json['id'] as int,
        bookingId: json['booking_id'] as int,
        quotedPrice: json['quoted_price'] as int,
        quotedDuration: json['quoted_duration'] as int?,
        message: json['message'] as String?,
        status: json['status'] as String,
        expiresAt: json['expires_at'] as String?,
        createdAt: json['created_at'] as String,
      );

  final int id;
  final int bookingId;
  final int quotedPrice;
  final int? quotedDuration;
  final String? message;
  final String status;
  final String? expiresAt;
  final String createdAt;
}

class BookingStatusEvent {
  BookingStatusEvent({required this.toStatus, this.note, required this.createdAt});

  factory BookingStatusEvent.fromJson(Map<String, dynamic> json) => BookingStatusEvent(
        toStatus: json['to_status'] as String,
        note: json['note'] as String?,
        createdAt: json['created_at'] as String,
      );

  final String toStatus;
  final String? note;
  final String createdAt;
}

class NamedRef {
  NamedRef({required this.id, required this.name});

  final int id;
  final String name;
}

class Booking {
  Booking({
    required this.id,
    required this.bookingNumber,
    required this.customerId,
    required this.vendorId,
    required this.serviceId,
    required this.bookingMode,
    this.scheduledAt,
    this.durationMinutes,
    required this.status,
    this.price,
    required this.currencyCode,
    this.notes,
    required this.quotes,
    this.serviceTitle,
    this.customer,
    this.vendorName,
    required this.statusHistory,
    required this.createdAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    final service = json['service'] as Map<String, dynamic>?;
    final customer = json['customer'] as Map<String, dynamic>?;
    final vendor = json['vendor'] as Map<String, dynamic>?;
    final quotes = (json['quotes'] as List<dynamic>? ?? [])
        .map((q) => BookingQuote.fromJson(q as Map<String, dynamic>))
        .toList();
    final history = (json['status_history'] as List<dynamic>? ?? [])
        .map((h) => BookingStatusEvent.fromJson(h as Map<String, dynamic>))
        .toList();

    return Booking(
      id: json['id'] as int,
      bookingNumber: json['booking_number'] as String,
      customerId: json['customer_id'] as int,
      vendorId: json['vendor_id'] as int,
      serviceId: json['service_id'] as int,
      bookingMode: json['booking_mode'] as String,
      scheduledAt: json['scheduled_at'] as String?,
      durationMinutes: json['duration_minutes'] as int?,
      status: json['status'] as String,
      price: json['price'] as int?,
      currencyCode: json['currency_code'] as String,
      notes: json['notes'] as String?,
      quotes: quotes,
      serviceTitle: service?['title'] as String?,
      customer: customer != null ? NamedRef(id: customer['id'] as int, name: customer['name'] as String) : null,
      vendorName: vendor?['business_name'] as String?,
      statusHistory: history,
      createdAt: json['created_at'] as String,
    );
  }

  final int id;
  final String bookingNumber;
  final int customerId;
  final int vendorId;
  final int serviceId;
  final String bookingMode;
  final String? scheduledAt;
  final int? durationMinutes;
  final String status;
  final int? price;
  final String currencyCode;
  final String? notes;
  final List<BookingQuote> quotes;
  final String? serviceTitle;
  final NamedRef? customer;
  final String? vendorName;
  final List<BookingStatusEvent> statusHistory;
  final String createdAt;

  BookingQuote? get pendingQuote {
    for (final q in quotes) {
      if (q.status == 'pending') return q;
    }
    return null;
  }
}

class PaginatedBookings {
  PaginatedBookings({required this.data, required this.currentPage, required this.lastPage, required this.total});

  factory PaginatedBookings.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>;
    return PaginatedBookings(
      data: (json['data'] as List<dynamic>).map((b) => Booking.fromJson(b as Map<String, dynamic>)).toList(),
      currentPage: meta['current_page'] as int,
      lastPage: meta['last_page'] as int,
      total: meta['total'] as int,
    );
  }

  final List<Booking> data;
  final int currentPage;
  final int lastPage;
  final int total;
}
