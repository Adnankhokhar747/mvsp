class Conversation {
  Conversation({
    required this.id,
    this.bookingId,
    required this.vendorId,
    required this.customerId,
    this.lastMessageAt,
    this.vendorName,
    this.customerName,
    required this.unreadCount,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    final vendor = json['vendor'] as Map<String, dynamic>?;
    final customer = json['customer'] as Map<String, dynamic>?;
    return Conversation(
      id: json['id'] as int,
      bookingId: json['booking_id'] as int?,
      vendorId: json['vendor_id'] as int,
      customerId: json['customer_id'] as int,
      lastMessageAt: json['last_message_at'] as String?,
      vendorName: vendor?['business_name'] as String?,
      customerName: customer?['name'] as String?,
      unreadCount: json['unread_count'] as int? ?? 0,
    );
  }

  final int id;
  final int? bookingId;
  final int vendorId;
  final int customerId;
  final String? lastMessageAt;
  final String? vendorName;
  final String? customerName;
  final int unreadCount;
}

class PaginatedConversations {
  PaginatedConversations({required this.data, required this.currentPage, required this.lastPage});

  factory PaginatedConversations.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>;
    return PaginatedConversations(
      data: (json['data'] as List<dynamic>).map((c) => Conversation.fromJson(c as Map<String, dynamic>)).toList(),
      currentPage: meta['current_page'] as int,
      lastPage: meta['last_page'] as int,
    );
  }

  final List<Conversation> data;
  final int currentPage;
  final int lastPage;
}

class Message {
  Message({required this.id, required this.conversationId, required this.senderId, this.body, required this.createdAt});

  factory Message.fromJson(Map<String, dynamic> json) => Message(
        id: json['id'] as int,
        conversationId: json['conversation_id'] as int,
        senderId: json['sender_id'] as int,
        body: json['body'] as String?,
        createdAt: json['created_at'] as String,
      );

  final int id;
  final int conversationId;
  final int senderId;
  final String? body;
  final String createdAt;
}
