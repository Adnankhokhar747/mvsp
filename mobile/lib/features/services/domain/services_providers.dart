import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../data/services_repository.dart';
import 'service.dart';

final servicesRepositoryProvider = Provider<ServicesRepository>((ref) {
  return ServicesRepository(ref.watch(dioProvider));
});

final categoriesProvider = FutureProvider.autoDispose<List<Category>>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchCategories();
});

typedef VendorServicesParams = ({int page, String status});

final vendorServicesListProvider =
    FutureProvider.autoDispose.family<PaginatedServices, VendorServicesParams>((ref, params) {
  return ref.watch(servicesRepositoryProvider).fetchVendorServices(page: params.page, status: params.status);
});

final vendorServiceDetailProvider = FutureProvider.autoDispose.family<Service, int>((ref, id) {
  return ref.watch(servicesRepositoryProvider).fetchVendorService(id);
});
