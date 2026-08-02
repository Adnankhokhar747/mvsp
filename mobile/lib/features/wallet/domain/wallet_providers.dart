import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../data/wallet_repository.dart';
import 'wallet.dart';

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  return WalletRepository(ref.watch(dioProvider));
});

final walletProvider = FutureProvider.autoDispose<Wallet>((ref) {
  return ref.watch(walletRepositoryProvider).fetchWallet();
});

final ledgerProvider = FutureProvider.autoDispose.family<PaginatedLedger, int>((ref, page) {
  return ref.watch(walletRepositoryProvider).fetchLedger(page: page);
});

final bankAccountsProvider = FutureProvider.autoDispose<List<BankAccount>>((ref) {
  return ref.watch(walletRepositoryProvider).fetchBankAccounts();
});
