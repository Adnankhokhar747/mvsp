import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  TokenStorage() : _storage = const FlutterSecureStorage();

  final FlutterSecureStorage _storage;
  static const _tokenKey = 'auth_token';

  // Cached in memory so concurrent requests (e.g. a screen that watches
  // several providers at once) don't all fire a separate async read against
  // the underlying secure-storage plugin at the same time — on web that
  // plugin serializes through IndexedDB and concurrent reads were observed
  // to hang indefinitely rather than resolve one after another.
  String? _cachedToken;
  Future<String?>? _pendingRead;

  Future<String?> readToken() {
    if (_cachedToken != null) return Future.value(_cachedToken);
    return _pendingRead ??= _storage.read(key: _tokenKey).then((token) {
      _cachedToken = token;
      _pendingRead = null;
      return token;
    });
  }

  Future<void> saveToken(String token) async {
    _cachedToken = token;
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<void> clearToken() async {
    _cachedToken = null;
    await _storage.delete(key: _tokenKey);
  }
}
