import 'package:flutter/material.dart';

class _StatusConfig {
  const _StatusConfig(this.label, this.color);
  final String label;
  final Color color;
}

const _statusConfig = {
  'pending': _StatusConfig('Pending', Colors.orange),
  'quoted': _StatusConfig('Quoted', Colors.blue),
  'confirmed': _StatusConfig('Confirmed', Colors.blue),
  'in_progress': _StatusConfig('In Progress', Colors.blue),
  'completed': _StatusConfig('Completed', Colors.green),
  'cancelled': _StatusConfig('Cancelled', Colors.grey),
  'disputed': _StatusConfig('Disputed', Colors.red),
  'refunded': _StatusConfig('Refunded', Colors.grey),
};

class BookingStatusChip extends StatelessWidget {
  const BookingStatusChip({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final config = _statusConfig[status] ?? const _StatusConfig('Unknown', Colors.grey);
    return Chip(
      label: Text(config.label),
      labelStyle: TextStyle(color: config.color, fontWeight: FontWeight.w600),
      backgroundColor: config.color.withValues(alpha: 0.1),
      side: BorderSide(color: config.color.withValues(alpha: 0.4)),
      visualDensity: VisualDensity.compact,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
