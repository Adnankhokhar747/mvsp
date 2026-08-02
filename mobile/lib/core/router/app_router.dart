import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/domain/auth_controller.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/otp_verify_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/bookings/presentation/booking_detail_screen.dart';
import '../../features/messaging/presentation/conversation_thread_screen.dart';
import '../../features/services/presentation/service_form_screen.dart';
import '../../features/shell/presentation/home_shell.dart';

class _AuthRefreshNotifier extends ChangeNotifier {
  _AuthRefreshNotifier(Ref ref) {
    ref.listen(authControllerProvider, (_, __) => notifyListeners());
  }
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = _AuthRefreshNotifier(ref);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final authState = ref.read(authControllerProvider);
      final isLoggedIn = authState.value != null;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation == '/otp-verify';

      if (authState.isLoading) return null;
      if (!isLoggedIn && !isAuthRoute) return '/login';
      if (isLoggedIn && isAuthRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(
        path: '/otp-verify',
        builder: (context, state) => OtpVerifyScreen(email: state.extra as String? ?? ''),
      ),
      GoRoute(path: '/', builder: (context, state) => const HomeShell()),
      GoRoute(
        path: '/bookings/:id',
        builder: (context, state) => BookingDetailScreen(bookingId: int.parse(state.pathParameters['id']!)),
      ),
      GoRoute(path: '/services/new', builder: (context, state) => const ServiceFormScreen()),
      GoRoute(
        path: '/services/:id',
        builder: (context, state) => ServiceFormScreen(serviceId: int.parse(state.pathParameters['id']!)),
      ),
      GoRoute(
        path: '/messages/:id',
        builder: (context, state) => ConversationThreadScreen(conversationId: int.parse(state.pathParameters['id']!)),
      ),
    ],
  );
});
