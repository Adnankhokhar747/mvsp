import 'package:flutter/material.dart';

import '../../../shared/widgets/placeholder_screen.dart';

class BookingsPlaceholderScreen extends StatelessWidget {
  const BookingsPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(title: 'Bookings', icon: Icons.event_note_outlined);
  }
}
