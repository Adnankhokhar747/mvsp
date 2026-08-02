import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/domain/auth_controller.dart';
import '../../shell/presentation/home_shell.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).value;
    final isVendorMode = ref.watch(vendorModeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: user == null
          ? const SizedBox.shrink()
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                    style: TextStyle(fontSize: 24, color: Theme.of(context).colorScheme.onPrimary),
                  ),
                ),
                const SizedBox(height: 16),
                Text(user.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(user.email, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 24),
                if (user.isVendor)
                  Card(
                    child: SwitchListTile(
                      title: const Text('Vendor mode'),
                      subtitle: const Text('Switch between browsing as a customer and managing your business.'),
                      value: isVendorMode,
                      onChanged: (_) => ref.read(vendorModeProvider.notifier).toggle(),
                    ),
                  ),
                const SizedBox(height: 24),
                OutlinedButton.icon(
                  onPressed: () => ref.read(authControllerProvider.notifier).logout(),
                  icon: const Icon(Icons.logout_outlined),
                  label: const Text('Log out'),
                ),
              ],
            ),
    );
  }
}
