import 'package:intl/intl.dart';

/// Money in this backend is stored as an integer in minor units (cents) plus
/// a currency code — never a float. See docs/architecture decisions.
String formatMoney(int minorUnits, String currencyCode) {
  final format = NumberFormat.currency(symbol: _symbolFor(currencyCode), decimalDigits: 2);
  return format.format(minorUnits / 100);
}

String _symbolFor(String currencyCode) {
  switch (currencyCode.toUpperCase()) {
    case 'USD':
      return r'$';
    case 'QAR':
      return 'QAR ';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return '$currencyCode ';
  }
}
