import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exception.dart';
import '../domain/service.dart';
import '../domain/services_providers.dart';
import 'service_status_chip.dart';

/// Create when [serviceId] is null, edit otherwise.
class ServiceFormScreen extends ConsumerWidget {
  const ServiceFormScreen({super.key, this.serviceId});

  final int? serviceId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(title: Text(serviceId == null ? 'New service' : 'Edit service')),
      body: categoriesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => const Center(child: Text("Couldn't load categories.")),
        data: (categories) {
          if (serviceId == null) {
            return _ServiceForm(categories: categories);
          }
          final serviceAsync = ref.watch(vendorServiceDetailProvider(serviceId!));
          return serviceAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => const Center(child: Text("Couldn't load this service.")),
            data: (service) => _ServiceForm(categories: categories, existing: service),
          );
        },
      ),
    );
  }
}

class _ServiceForm extends ConsumerStatefulWidget {
  const _ServiceForm({required this.categories, this.existing});

  final List<Category> categories;
  final Service? existing;

  @override
  ConsumerState<_ServiceForm> createState() => _ServiceFormState();
}

class _ServiceFormState extends ConsumerState<_ServiceForm> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController;
  late final TextEditingController _shortDescriptionController;
  late final TextEditingController _descriptionController;
  late final TextEditingController _priceController;
  late final TextEditingController _durationController;
  late int? _categoryId;
  late String _priceType;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final existing = widget.existing;
    _titleController = TextEditingController(text: existing?.title ?? '');
    _shortDescriptionController = TextEditingController(text: existing?.shortDescription ?? '');
    _descriptionController = TextEditingController(text: existing?.description ?? '');
    _priceController = TextEditingController(text: existing?.basePrice != null ? (existing!.basePrice! / 100).toString() : '');
    _durationController = TextEditingController(text: existing?.durationMinutes?.toString() ?? '');
    _categoryId = existing?.categoryId ?? (widget.categories.isNotEmpty ? Category.flatten(widget.categories).first.$1 : null);
    _priceType = existing?.priceType ?? 'fixed';
  }

  @override
  void dispose() {
    _titleController.dispose();
    _shortDescriptionController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _durationController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _categoryId == null) return;
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final basePrice = _priceType == 'quote' || _priceController.text.trim().isEmpty
        ? null
        : (double.parse(_priceController.text.trim()) * 100).round();
    final durationMinutes = _durationController.text.trim().isEmpty ? null : int.parse(_durationController.text.trim());

    try {
      final repo = ref.read(servicesRepositoryProvider);
      if (widget.existing == null) {
        await repo.createService(
          categoryId: _categoryId!,
          title: _titleController.text.trim(),
          shortDescription: _shortDescriptionController.text.trim(),
          description: _descriptionController.text.trim(),
          basePrice: basePrice,
          priceType: _priceType,
          durationMinutes: durationMinutes,
        );
      } else {
        await repo.updateService(
          widget.existing!.id,
          categoryId: _categoryId,
          title: _titleController.text.trim(),
          shortDescription: _shortDescriptionController.text.trim(),
          description: _descriptionController.text.trim(),
          basePrice: basePrice,
          priceType: _priceType,
          durationMinutes: durationMinutes,
        );
        ref.invalidate(vendorServiceDetailProvider(widget.existing!.id));
      }
      ref.invalidate(vendorServicesListProvider);
      if (mounted) context.pop();
    } catch (error) {
      setState(() {
        _errorMessage = error is ApiException ? error.message : 'Something went wrong. Please try again.';
      });
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _pauseOrResume(String action) async {
    try {
      await ref.read(servicesRepositoryProvider).updateService(widget.existing!.id, status: action);
      ref.invalidate(vendorServiceDetailProvider(widget.existing!.id));
      ref.invalidate(vendorServicesListProvider);
    } catch (error) {
      if (mounted) {
        final message = error is ApiException ? error.message : 'Something went wrong. Please try again.';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final flatCategories = Category.flatten(widget.categories);
    final existing = widget.existing;

    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (existing != null) ...[
            Row(
              children: [
                ServiceStatusChip(status: existing.status),
                const Spacer(),
                if (existing.status == 'active')
                  OutlinedButton(onPressed: () => _pauseOrResume('paused'), child: const Text('Pause')),
              ],
            ),
            const SizedBox(height: 16),
          ],
          if (_errorMessage != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(_errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
            const SizedBox(height: 16),
          ],
          DropdownButtonFormField<int>(
            value: _categoryId,
            decoration: const InputDecoration(labelText: 'Category'),
            items: [
              for (final category in flatCategories) DropdownMenuItem(value: category.$1, child: Text(category.$2)),
            ],
            onChanged: (value) => setState(() => _categoryId = value),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Title'),
            validator: (value) => (value == null || value.isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _shortDescriptionController,
            decoration: const InputDecoration(labelText: 'Short description (optional)'),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _descriptionController,
            decoration: const InputDecoration(labelText: 'Description (optional)'),
            maxLines: 4,
          ),
          const SizedBox(height: 16),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'fixed', label: Text('Fixed')),
              ButtonSegment(value: 'hourly', label: Text('Hourly')),
              ButtonSegment(value: 'quote', label: Text('Quote')),
            ],
            selected: {_priceType},
            onSelectionChanged: (selection) => setState(() => _priceType = selection.first),
          ),
          if (_priceType != 'quote') ...[
            const SizedBox(height: 16),
            TextFormField(
              controller: _priceController,
              decoration: InputDecoration(labelText: _priceType == 'hourly' ? 'Price per hour' : 'Price'),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              validator: (value) =>
                  (value == null || double.tryParse(value) == null) ? 'Enter a valid amount' : null,
            ),
          ],
          const SizedBox(height: 16),
          TextFormField(
            controller: _durationController,
            decoration: const InputDecoration(labelText: 'Duration in minutes (optional)'),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _isSubmitting ? null : _submit,
            child: _isSubmitting
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.5))
                : Text(existing == null ? 'Create service' : 'Save changes'),
          ),
        ],
      ),
    );
  }
}
