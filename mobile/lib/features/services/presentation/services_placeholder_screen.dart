import 'package:flutter/material.dart';

import '../../../shared/widgets/placeholder_screen.dart';

class ServicesPlaceholderScreen extends StatelessWidget {
  const ServicesPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(title: 'Services', icon: Icons.miscellaneous_services_outlined);
  }
}
