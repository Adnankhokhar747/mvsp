import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/domain/auth_controller.dart';
import '../../bookings/presentation/bookings_list_screen.dart';
import '../../messaging/presentation/messages_placeholder_screen.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../services/presentation/services_placeholder_screen.dart';
import '../../wallet/presentation/wallet_placeholder_screen.dart';
import 'home_placeholder_screen.dart';

/// Whether the current user should see vendor-mode UI: they must actually be
/// a vendor AND have the in-app toggle switched on. Shared by the shell (to
/// pick the tab set) and by feature screens (to gate vendor-only actions).
final effectiveVendorModeProvider = Provider<bool>((ref) {
  final user = ref.watch(authControllerProvider).value;
  return user != null && user.isVendor && ref.watch(vendorModeProvider);
});

const _vendorTabs = [
  _TabSpec('Bookings', Icons.event_note_outlined, BookingsListScreen()),
  _TabSpec('Services', Icons.miscellaneous_services_outlined, ServicesPlaceholderScreen()),
  _TabSpec('Wallet', Icons.account_balance_wallet_outlined, WalletPlaceholderScreen()),
  _TabSpec('Messages', Icons.chat_bubble_outline_rounded, MessagesPlaceholderScreen()),
  _TabSpec('Profile', Icons.person_outline_rounded, ProfileScreen()),
];

const _customerTabs = [
  _TabSpec('Home', Icons.home_outlined, HomePlaceholderScreen()),
  _TabSpec('Bookings', Icons.event_note_outlined, BookingsListScreen()),
  _TabSpec('Messages', Icons.chat_bubble_outline_rounded, MessagesPlaceholderScreen()),
  _TabSpec('Profile', Icons.person_outline_rounded, ProfileScreen()),
];

final homeTabIndexProvider = NotifierProvider<HomeTabIndexNotifier, int>(HomeTabIndexNotifier.new);

class HomeTabIndexNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void select(int index) => state = index;
}

/// Whether the signed-in vendor is currently browsing in vendor mode.
/// Only meaningful when the current user is a vendor; customers ignore this.
final vendorModeProvider = NotifierProvider<VendorModeNotifier, bool>(VendorModeNotifier.new);

class VendorModeNotifier extends Notifier<bool> {
  @override
  bool build() => false;

  void toggle() {
    state = !state;
    // The two tab sets aren't the same length, so carrying over a raw index
    // would mean a different tab after the switch (e.g. index 3 is Profile
    // in customer mode but Messages in vendor mode). Profile is always last
    // in both sets, so jump there — it's also where this toggle itself lives.
    // Set atomically with the mode flip so there's no other-widget listener
    // ordering to reason about.
    final newTabCount = state ? _vendorTabs.length : _customerTabs.length;
    ref.read(homeTabIndexProvider.notifier).select(newTabCount - 1);
  }
}

class HomeShell extends ConsumerWidget {
  const HomeShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isVendorMode = ref.watch(effectiveVendorModeProvider);
    final tabIndex = ref.watch(homeTabIndexProvider);

    final tabs = isVendorMode ? _vendorTabs : _customerTabs;
    final safeIndex = tabIndex < tabs.length ? tabIndex : 0;

    return Scaffold(
      body: SafeArea(child: IndexedStack(index: safeIndex, children: tabs.map((t) => t.screen).toList())),
      bottomNavigationBar: NavigationBar(
        selectedIndex: safeIndex,
        onDestinationSelected: (index) => ref.read(homeTabIndexProvider.notifier).select(index),
        destinations: [
          for (final tab in tabs) NavigationDestination(icon: Icon(tab.icon), label: tab.label),
        ],
      ),
    );
  }
}

class _TabSpec {
  const _TabSpec(this.label, this.icon, this.screen);

  final String label;
  final IconData icon;
  final Widget screen;
}
