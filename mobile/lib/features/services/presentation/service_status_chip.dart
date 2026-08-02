import 'package:flutter/material.dart';

class _StatusConfig {
  const _StatusConfig(this.label, this.color);
  final String label;
  final Color color;
}

const _statusConfig = {
  'draft': _StatusConfig('Draft', Colors.grey),
  'active': _StatusConfig('Active', Colors.green),
  'paused': _StatusConfig('Paused', Colors.orange),
  'rejected': _StatusConfig('Rejected', Colors.red),
};

class ServiceStatusChip extends StatelessWidget {
  const ServiceStatusChip({super.key, required this.status});

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
