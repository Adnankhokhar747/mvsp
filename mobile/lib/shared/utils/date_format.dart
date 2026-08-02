import 'package:intl/intl.dart';

String formatDateTime(String isoString) {
  return DateFormat('MMM d, y \'at\' h:mm a').format(DateTime.parse(isoString).toLocal());
}
