import 'package:flutter/material.dart';

import '../../../shared/widgets/placeholder_screen.dart';

class HomePlaceholderScreen extends StatelessWidget {
  const HomePlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(title: 'Home', icon: Icons.home_outlined);
  }
}
