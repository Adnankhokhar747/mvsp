import 'package:dio/dio.dart';

import '../../../core/network/api_exception.dart';
import '../domain/wallet.dart';

class WalletRepository {
  WalletRepository(this._dio);

  final Dio _dio;

  Future<Wallet> fetchWallet() async {
    try {
      final response = await _dio.get('/vendor/wallet');
      return Wallet.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<PaginatedLedger> fetchLedger({int page = 1}) async {
    try {
      final response = await _dio.get('/vendor/wallet/ledger', queryParameters: {'page': page});
      return PaginatedLedger.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<List<BankAccount>> fetchBankAccounts() async {
    try {
      final response = await _dio.get('/vendor/bank-accounts');
      return (response.data['data'] as List<dynamic>)
          .map((b) => BankAccount.fromJson(b as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<BankAccount> createBankAccount({
    required String accountHolderName,
    required String accountNumber,
    required String bankName,
    String? ibanOrRouting,
    bool isDefault = false,
  }) async {
    try {
      final response = await _dio.post('/vendor/bank-accounts', data: {
        'account_holder_name': accountHolderName,
        'account_number': accountNumber,
        'bank_name': bankName,
        if (ibanOrRouting != null && ibanOrRouting.isNotEmpty) 'iban_or_routing': ibanOrRouting,
        'is_default': isDefault,
      });
      return BankAccount.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> deleteBankAccount(int id) async {
    try {
      await _dio.delete('/vendor/bank-accounts/$id');
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<PayoutRequest> requestPayout({required int amount, int? bankAccountId}) async {
    try {
      final response = await _dio.post('/vendor/payouts', data: {
        'amount': amount,
        if (bankAccountId != null) 'vendor_bank_account_id': bankAccountId,
      });
      return PayoutRequest.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }
}
