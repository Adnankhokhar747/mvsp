import 'package:flutter/material.dart';

import '../../../shared/widgets/placeholder_screen.dart';

class MessagesPlaceholderScreen extends StatelessWidget {
  const MessagesPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(title: 'Messages', icon: Icons.chat_bubble_outline_rounded);
  }
}
