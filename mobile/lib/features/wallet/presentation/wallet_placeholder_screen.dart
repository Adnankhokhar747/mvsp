import 'package:flutter/material.dart';

import '../../../shared/widgets/placeholder_screen.dart';

class WalletPlaceholderScreen extends StatelessWidget {
  const WalletPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(title: 'Wallet', icon: Icons.account_balance_wallet_outlined);
  }
}
