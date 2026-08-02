class Wallet {
  Wallet({required this.id, required this.vendorId, required this.balance, required this.heldBalance, required this.currencyCode});

  factory Wallet.fromJson(Map<String, dynamic> json) => Wallet(
        id: json['id'] as int,
        vendorId: json['vendor_id'] as int,
        balance: json['balance'] as int,
        heldBalance: json['held_balance'] as int,
        currencyCode: json['currency_code'] as String,
      );

  final int id;
  final int vendorId;
  final int balance;
  final int heldBalance;
  final String currencyCode;
}

class LedgerEntry {
  LedgerEntry({
    required this.id,
    required this.type,
    required this.amount,
    required this.balanceAfter,
    this.description,
    required this.createdAt,
  });

  factory LedgerEntry.fromJson(Map<String, dynamic> json) => LedgerEntry(
        id: json['id'] as int,
        type: json['type'] as String,
        amount: json['amount'] as int,
        balanceAfter: json['balance_after'] as int,
        description: json['description'] as String?,
        createdAt: json['created_at'] as String,
      );

  final int id;
  final String type; // credit | debit | hold | release
  final int amount;
  final int balanceAfter;
  final String? description;
  final String createdAt;
}

class PaginatedLedger {
  PaginatedLedger({required this.data, required this.currentPage, required this.lastPage});

  factory PaginatedLedger.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>;
    return PaginatedLedger(
      data: (json['data'] as List<dynamic>).map((e) => LedgerEntry.fromJson(e as Map<String, dynamic>)).toList(),
      currentPage: meta['current_page'] as int,
      lastPage: meta['last_page'] as int,
    );
  }

  final List<LedgerEntry> data;
  final int currentPage;
  final int lastPage;
}

class BankAccount {
  BankAccount({
    required this.id,
    required this.accountHolderName,
    required this.accountNumber,
    required this.bankName,
    this.ibanOrRouting,
    required this.isDefault,
  });

  factory BankAccount.fromJson(Map<String, dynamic> json) => BankAccount(
        id: json['id'] as int,
        accountHolderName: json['account_holder_name'] as String,
        accountNumber: json['account_number'] as String,
        bankName: json['bank_name'] as String,
        ibanOrRouting: json['iban_or_routing'] as String?,
        isDefault: json['is_default'] as bool,
      );

  final int id;
  final String accountHolderName;
  final String accountNumber;
  final String bankName;
  final String? ibanOrRouting;
  final bool isDefault;
}

class PayoutRequest {
  PayoutRequest({
    required this.id,
    required this.amount,
    required this.currencyCode,
    required this.status,
    required this.requestedAt,
  });

  factory PayoutRequest.fromJson(Map<String, dynamic> json) => PayoutRequest(
        id: json['id'] as int,
        amount: json['amount'] as int,
        currencyCode: json['currency_code'] as String,
        status: json['status'] as String,
        requestedAt: json['requested_at'] as String,
      );

  final int id;
  final int amount;
  final String currencyCode;
  final String status;
  final String requestedAt;
}
