import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../shared/utils/date_format.dart';
import '../../../shared/utils/money.dart';
import '../domain/wallet.dart';
import '../domain/wallet_providers.dart';

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(walletProvider);
    final bankAccountsAsync = ref.watch(bankAccountsProvider);
    final ledgerAsync = ref.watch(ledgerProvider(1));

    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(walletProvider);
          ref.invalidate(bankAccountsProvider);
          ref.invalidate(ledgerProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            walletAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (error, _) => const Text("Couldn't load your wallet."),
              data: (wallet) => _BalanceCard(
                wallet: wallet,
                onRequestPayout: () => _showRequestPayoutDialog(context, ref, wallet, bankAccountsAsync.value ?? []),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Bank accounts', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                TextButton.icon(
                  onPressed: () => _showAddBankAccountDialog(context, ref),
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: const Text('Add'),
                ),
              ],
            ),
            bankAccountsAsync.when(
              loading: () => const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator())),
              error: (error, _) => const Text("Couldn't load bank accounts."),
              data: (accounts) => accounts.isEmpty
                  ? const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Text('No bank accounts yet.'))
                  : Column(
                      children: [
                        for (final account in accounts)
                          Card(
                            child: ListTile(
                              title: Text(account.bankName),
                              subtitle: Text('${account.accountHolderName} · ${account.accountNumber}'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (account.isDefault)
                                    const Padding(
                                      padding: EdgeInsets.only(right: 8),
                                      child: Chip(label: Text('Default'), visualDensity: VisualDensity.compact),
                                    ),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline_rounded),
                                    onPressed: () => _deleteBankAccount(context, ref, account.id),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
            ),
            const SizedBox(height: 24),
            Text('Recent activity', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            ledgerAsync.when(
              loading: () => const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator())),
              error: (error, _) => const Text("Couldn't load activity."),
              data: (ledger) => ledger.data.isEmpty
                  ? const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Text('No activity yet.'))
                  : Column(
                      children: [
                        for (final entry in ledger.data)
                          _LedgerTile(entry: entry, currencyCode: walletAsync.value?.currencyCode ?? 'USD'),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _deleteBankAccount(BuildContext context, WidgetRef ref, int id) async {
    try {
      await ref.read(walletRepositoryProvider).deleteBankAccount(id);
      ref.invalidate(bankAccountsProvider);
    } catch (error) {
      if (context.mounted) {
        final message = error is ApiException ? error.message : 'Something went wrong. Please try again.';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      }
    }
  }

  Future<void> _showAddBankAccountDialog(BuildContext context, WidgetRef ref) async {
    final holderController = TextEditingController();
    final numberController = TextEditingController();
    final bankController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final submitted = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add bank account'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: holderController,
                decoration: const InputDecoration(labelText: 'Account holder name'),
                validator: (value) => (value == null || value.isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: numberController,
                decoration: const InputDecoration(labelText: 'Account number'),
                validator: (value) => (value == null || value.isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: bankController,
                decoration: const InputDecoration(labelText: 'Bank name'),
                validator: (value) => (value == null || value.isEmpty) ? 'Required' : null,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              if (formKey.currentState!.validate()) Navigator.pop(context, true);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (submitted != true || !context.mounted) return;

    try {
      await ref.read(walletRepositoryProvider).createBankAccount(
            accountHolderName: holderController.text.trim(),
            accountNumber: numberController.text.trim(),
            bankName: bankController.text.trim(),
          );
      ref.invalidate(bankAccountsProvider);
    } catch (error) {
      if (context.mounted) {
        final message = error is ApiException ? error.message : 'Something went wrong. Please try again.';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      }
    }
  }

  Future<void> _showRequestPayoutDialog(
    BuildContext context,
    WidgetRef ref,
    Wallet wallet,
    List<BankAccount> bankAccounts,
  ) async {
    final amountController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    int? selectedBankAccountId = bankAccounts.isNotEmpty
        ? (bankAccounts.firstWhere((a) => a.isDefault, orElse: () => bankAccounts.first)).id
        : null;

    final submitted = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Request payout'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Available balance: ${formatMoney(wallet.balance, wallet.currencyCode)}'),
                const SizedBox(height: 12),
                TextFormField(
                  controller: amountController,
                  decoration: InputDecoration(labelText: 'Amount (${wallet.currencyCode})'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (value) =>
                      (value == null || double.tryParse(value) == null) ? 'Enter a valid amount' : null,
                ),
                if (bankAccounts.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    value: selectedBankAccountId,
                    decoration: const InputDecoration(labelText: 'Bank account'),
                    items: [
                      for (final account in bankAccounts)
                        DropdownMenuItem(value: account.id, child: Text(account.bankName)),
                    ],
                    onChanged: (value) => setDialogState(() => selectedBankAccountId = value),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            FilledButton(
              onPressed: () {
                if (formKey.currentState!.validate()) Navigator.pop(context, true);
              },
              child: const Text('Request'),
            ),
          ],
        ),
      ),
    );

    if (submitted != true || !context.mounted) return;

    try {
      final amountMinorUnits = (double.parse(amountController.text.trim()) * 100).round();
      await ref.read(walletRepositoryProvider).requestPayout(amount: amountMinorUnits, bankAccountId: selectedBankAccountId);
      ref.invalidate(walletProvider);
      ref.invalidate(ledgerProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payout requested.')));
      }
    } catch (error) {
      if (context.mounted) {
        final message = error is ApiException ? error.message : 'Something went wrong. Please try again.';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      }
    }
  }
}

class _BalanceCard extends StatelessWidget {
  const _BalanceCard({required this.wallet, required this.onRequestPayout});

  final Wallet wallet;
  final VoidCallback onRequestPayout;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Available balance', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 4),
            Text(
              formatMoney(wallet.balance, wallet.currencyCode),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            if (wallet.heldBalance > 0) ...[
              const SizedBox(height: 4),
              Text(
                '${formatMoney(wallet.heldBalance, wallet.currencyCode)} held',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
            const SizedBox(height: 16),
            FilledButton(onPressed: onRequestPayout, child: const Text('Request payout')),
          ],
        ),
      ),
    );
  }
}

class _LedgerTile extends StatelessWidget {
  const _LedgerTile({required this.entry, required this.currencyCode});

  final LedgerEntry entry;
  final String currencyCode;

  @override
  Widget build(BuildContext context) {
    final isCredit = entry.type == 'credit' || entry.type == 'release';
    final icon = switch (entry.type) {
      'credit' => Icons.add_circle_outline_rounded,
      'debit' => Icons.remove_circle_outline_rounded,
      'hold' => Icons.lock_clock_outlined,
      'release' => Icons.lock_open_outlined,
      _ => Icons.circle_outlined,
    };

    return ListTile(
      leading: Icon(icon, color: isCredit ? Colors.green : Colors.orange),
      title: Text(entry.description ?? entry.type),
      subtitle: Text(formatDateTime(entry.createdAt)),
      trailing: Text(
        '${isCredit ? '+' : '-'}${formatMoney(entry.amount.abs(), currencyCode)}',
        style: TextStyle(fontWeight: FontWeight.w600, color: isCredit ? Colors.green : Colors.orange),
      ),
    );
  }
}
