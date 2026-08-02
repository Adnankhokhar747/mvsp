import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../data/auth_repository.dart';
import 'user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(dioProvider), ref.watch(tokenStorageProvider));
});

class AuthController extends AsyncNotifier<AppUser?> {
  @override
  Future<AppUser?> build() async {
    final token = await ref.watch(tokenStorageProvider).readToken();
    if (token == null) return null;
    return ref.watch(authRepositoryProvider).me();
  }

  Future<void> login({required String login, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(authRepositoryProvider).login(login: login, password: password),
    );
  }

  Future<AppUser> register({
    required String name,
    required String email,
    String? phone,
    required String password,
    required String role,
  }) {
    return ref.read(authRepositoryProvider).register(
          name: name,
          email: email,
          phone: phone,
          password: password,
          role: role,
        );
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(null);
  }
}

final authControllerProvider = AsyncNotifierProvider<AuthController, AppUser?>(AuthController.new);
