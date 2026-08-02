class Category {
  Category({required this.id, required this.name, this.parentId, this.children = const []});

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as int,
        name: json['name'] as String,
        parentId: json['parent_id'] as int?,
        children: (json['children'] as List<dynamic>? ?? [])
            .map((c) => Category.fromJson(c as Map<String, dynamic>))
            .toList(),
      );

  final int id;
  final String name;
  final int? parentId;
  final List<Category> children;

  /// Flattens the category tree into a single pickable list, indenting
  /// children so the hierarchy still reads clearly in a dropdown.
  static List<(int id, String label)> flatten(List<Category> categories, {int depth = 0}) {
    final result = <(int, String)>[];
    for (final category in categories) {
      result.add((category.id, '${'— ' * depth}${category.name}'));
      result.addAll(flatten(category.children, depth: depth + 1));
    }
    return result;
  }
}

class Service {
  Service({
    required this.id,
    required this.vendorId,
    required this.categoryId,
    required this.title,
    this.shortDescription,
    this.description,
    this.basePrice,
    required this.currencyCode,
    required this.priceType,
    this.durationMinutes,
    required this.status,
    required this.avgRating,
    required this.reviewCount,
    this.categoryName,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    final category = json['category'] as Map<String, dynamic>?;
    return Service(
      id: json['id'] as int,
      vendorId: json['vendor_id'] as int,
      categoryId: json['category_id'] as int,
      title: json['title'] as String,
      shortDescription: json['short_description'] as String?,
      description: json['description'] as String?,
      basePrice: json['base_price'] as int?,
      currencyCode: json['currency_code'] as String,
      priceType: json['price_type'] as String,
      durationMinutes: json['duration_minutes'] as int?,
      status: json['status'] as String,
      avgRating: (json['avg_rating'] as num?)?.toDouble() ?? 0,
      reviewCount: json['review_count'] as int? ?? 0,
      categoryName: category?['name'] as String?,
    );
  }

  final int id;
  final int vendorId;
  final int categoryId;
  final String title;
  final String? shortDescription;
  final String? description;
  final int? basePrice;
  final String currencyCode;
  final String priceType;
  final int? durationMinutes;
  final String status;
  final double avgRating;
  final int reviewCount;
  final String? categoryName;
}

class PaginatedServices {
  PaginatedServices({required this.data, required this.currentPage, required this.lastPage, required this.total});

  factory PaginatedServices.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>;
    return PaginatedServices(
      data: (json['data'] as List<dynamic>).map((s) => Service.fromJson(s as Map<String, dynamic>)).toList(),
      currentPage: meta['current_page'] as int,
      lastPage: meta['last_page'] as int,
      total: meta['total'] as int,
    );
  }

  final List<Service> data;
  final int currentPage;
  final int lastPage;
  final int total;
}
