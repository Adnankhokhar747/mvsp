class AppUser {
  AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.userType,
    required this.status,
    this.avatarPath,
    this.emailVerifiedAt,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'] as int,
        name: json['name'] as String,
        email: json['email'] as String,
        phone: json['phone'] as String?,
        userType: json['user_type'] as String,
        status: json['status'] as String,
        avatarPath: json['avatar_path'] as String?,
        emailVerifiedAt: json['email_verified_at'] as String?,
      );

  final int id;
  final String name;
  final String email;
  final String? phone;
  final String userType;
  final String status;
  final String? avatarPath;
  final String? emailVerifiedAt;

  bool get isVendor => userType == 'vendor';
  bool get isVerified => emailVerifiedAt != null;
}
