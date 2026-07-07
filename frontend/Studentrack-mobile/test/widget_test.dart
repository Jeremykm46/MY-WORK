import 'package:flutter_test/flutter_test.dart';
import 'package:edutrack_mobile/main.dart';

void main() {
  testWidgets('EduTrack app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const EduTrackApp());
    expect(find.byType(EduTrackApp), findsOneWidget);
  });
}
