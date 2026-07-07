import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/app_theme.dart';

class AttendanceSummaryScreen extends StatefulWidget {
  const AttendanceSummaryScreen({super.key});
  @override
  State<AttendanceSummaryScreen> createState() => _AttendanceSummaryScreenState();
}

class _AttendanceSummaryScreenState extends State<AttendanceSummaryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  static const _courses = [
    {'code': 'CS301', 'name': 'Data Structures',    'rate': 93.0, 'color': 0xFF7C3AED},
    {'code': 'CS302', 'name': 'Operating Systems',  'rate': 87.0, 'color': 0xFF2563EB},
    {'code': 'CS305', 'name': 'Algorithm Analysis', 'rate': 78.0, 'color': 0xFF10B981},
    {'code': 'CS306', 'name': 'Software Eng.',      'rate': 82.0, 'color': 0xFFF59E0B},
  ];

  static const _atRisk = [
    {'name': 'Emma Wilson',  'course': 'CS305', 'rate': 65},
    {'name': 'Henry Brown',  'course': 'CS306', 'rate': 55},
    {'name': 'Carol Lee',    'course': 'CS302', 'rate': 70},
    {'name': 'Jack White',   'course': 'CS302', 'rate': 60},
  ];

  static const _topStudents = [
    {'name': 'Iris Taylor',   'course': 'CS301', 'rate': 100},
    {'name': 'Alice Johnson', 'course': 'CS301', 'rate': 95},
    {'name': 'David Chen',    'course': 'CS302', 'rate': 90},
    {'name': 'Frank Davis',   'course': 'CS305', 'rate': 85},
  ];

  static final _weeklyData = [
    [88.0, 90.0, 93.0, 91.0, 95.0, 92.0, 93.0],
    [82.0, 85.0, 88.0, 84.0, 87.0, 89.0, 87.0],
    [70.0, 73.0, 76.0, 78.0, 75.0, 79.0, 78.0],
    [78.0, 80.0, 81.0, 83.0, 82.0, 84.0, 82.0],
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Attendance Summary',
            style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tab,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          labelStyle: const TextStyle(
              fontFamily: 'Poppins', fontWeight: FontWeight.w600, fontSize: 12),
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Trends'),
            Tab(text: 'Students'),
          ],
        ),
      ),
      body: TabBarView(controller: _tab, children: [
        _buildOverviewTab(),
        _buildTrendsTab(),
        _buildStudentsTab(),
      ]),
    );
  }

  // ─── Overview Tab ────────────────────────────────────────────────────────────
  Widget _buildOverviewTab() {
    final avgRate =
        _courses.fold(0.0, (s, c) => s + (c['rate'] as double)) / _courses.length;
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        // Average rate card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
                colors: [Color(0xFF7C3AED), Color(0xFF2563EB)]),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                  color: AppColors.secondary.withValues(alpha: 0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6))
            ],
          ),
          child: Row(children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Overall Avg Rate',
                  style: TextStyle(color: Colors.white70, fontSize: 12)),
              Text('${avgRate.toStringAsFixed(1)}%',
                  style: const TextStyle(
                      color: Colors.white,
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w800,
                      fontSize: 36)),
              const Text('Across all courses',
                  style: TextStyle(color: Colors.white60, fontSize: 11)),
            ]),
            const Spacer(),
            Stack(alignment: Alignment.center, children: [
              SizedBox(
                width: 72,
                height: 72,
                child: CircularProgressIndicator(
                    value: avgRate / 100,
                    strokeWidth: 7,
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation(Colors.white)),
              ),
              Text('${avgRate.round()}',
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 16)),
            ]),
          ]),
        ),
        const SizedBox(height: 16),

        // Stats row
        const Row(children: [
          _KpiCard('4', 'Courses', AppColors.secondary, AppColors.secondaryLight),
          SizedBox(width: 10),
          _KpiCard('175', 'Students', AppColors.accent, AppColors.accentLight),
          SizedBox(width: 10),
          _KpiCard('4', 'At Risk', AppColors.danger, AppColors.dangerLight),
        ]),
        const SizedBox(height: 16),

        // Bar chart
        const Text('Course Attendance Rates',
            style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: AppColors.dark)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.fromLTRB(8, 16, 16, 8),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border)),
          height: 200,
          child: BarChart(BarChartData(
            alignment: BarChartAlignment.spaceAround,
            maxY: 100,
            barGroups: List.generate(
                _courses.length,
                (i) => BarChartGroupData(x: i, barRods: [
                      BarChartRodData(
                          toY: _courses[i]['rate'] as double,
                          color: Color(_courses[i]['color'] as int),
                          width: 28,
                          borderRadius:
                              const BorderRadius.vertical(top: Radius.circular(6))),
                    ])),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      getTitlesWidget: (v, _) => Text('${v.toInt()}',
                          style: const TextStyle(
                              fontSize: 10, color: AppColors.gray)))),
              bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (v, _) => Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                              _courses[v.toInt()]['code'] as String,
                              style: const TextStyle(
                                  fontSize: 10, color: AppColors.gray))))),
              topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false)),
              rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false)),
            ),
            gridData: FlGridData(
                getDrawingHorizontalLine: (_) =>
                    const FlLine(color: AppColors.border, strokeWidth: 1)),
            borderData: FlBorderData(show: false),
          )),
        ),
        const SizedBox(height: 16),

        // Course breakdown cards
        const Text('Course Breakdown',
            style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: AppColors.dark)),
        const SizedBox(height: 10),
        ..._courses.map((c) {
          final rate = c['rate'] as double;
          final color = Color(c['color'] as int);
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(
                    width: 10,
                    height: 10,
                    decoration:
                        BoxDecoration(color: color, shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(c['name'] as String,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: AppColors.dark))),
                Text('${rate.toStringAsFixed(1)}%',
                    style: TextStyle(
                        fontWeight: FontWeight.w800,
                        color: color,
                        fontFamily: 'Poppins')),
              ]),
              const SizedBox(height: 6),
              Text(c['code'] as String,
                  style: const TextStyle(fontSize: 11, color: AppColors.gray)),
              const SizedBox(height: 6),
              ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                      value: rate / 100,
                      minHeight: 6,
                      backgroundColor: AppColors.border,
                      valueColor: AlwaysStoppedAnimation(color))),
            ]),
          );
        }),
      ],
    );
  }

  // ─── Trends Tab ──────────────────────────────────────────────────────────────
  Widget _buildTrendsTab() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final colors = [
      const Color(0xFF7C3AED),
      const Color(0xFF2563EB),
      const Color(0xFF10B981),
      const Color(0xFFF59E0B),
    ];
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        const Text('Weekly Attendance Trends',
            style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: AppColors.dark)),
        const SizedBox(height: 12),

        // Legend
        Wrap(
            spacing: 10,
            runSpacing: 6,
            children: List.generate(
                _courses.length,
                (i) => Row(mainAxisSize: MainAxisSize.min, children: [
                      Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                              color: colors[i], shape: BoxShape.circle)),
                      const SizedBox(width: 4),
                      Text(_courses[i]['code'] as String,
                          style: const TextStyle(
                              fontSize: 11, color: AppColors.gray)),
                    ]))),
        const SizedBox(height: 12),

        // Line chart
        Container(
          padding: const EdgeInsets.fromLTRB(8, 16, 16, 8),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border)),
          height: 240,
          child: LineChart(LineChartData(
            minY: 50,
            maxY: 100,
            lineBarsData: List.generate(
                _courses.length,
                (ci) => LineChartBarData(
                      spots: List.generate(
                          7, (di) => FlSpot(di.toDouble(), _weeklyData[ci][di])),
                      isCurved: true,
                      color: colors[ci],
                      barWidth: 2.5,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                          show: ci == 0,
                          color: colors[ci].withValues(alpha: 0.06)),
                    )),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 28,
                      getTitlesWidget: (v, _) => Text('${v.toInt()}',
                          style: const TextStyle(
                              fontSize: 9, color: AppColors.gray)))),
              bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (v, _) => Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(days[v.toInt()],
                              style: const TextStyle(
                                  fontSize: 9, color: AppColors.gray))))),
              topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false)),
              rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false)),
            ),
            gridData: FlGridData(
                getDrawingHorizontalLine: (_) =>
                    const FlLine(color: AppColors.border, strokeWidth: 1)),
            borderData: FlBorderData(show: false),
          )),
        ),
        const SizedBox(height: 20),

        // Monthly comparison
        const Text('Monthly Avg Comparison',
            style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: AppColors.dark)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border)),
          child: Column(children: [
            _buildMonthRow('March', [84.0, 80.0, 72.0, 78.0], colors),
            _buildMonthRow('April', [89.0, 85.0, 75.0, 81.0], colors),
            _buildMonthRow('May',   [93.0, 87.0, 78.0, 82.0], colors),
          ]),
        ),
      ],
    );
  }

  Widget _buildMonthRow(String month, List<double> rates, List<Color> colors) {
    final avg = rates.fold(0.0, (s, r) => s + r) / rates.length;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(children: [
        SizedBox(
            width: 52,
            child: Text(month,
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.dark))),
        const SizedBox(width: 8),
        Expanded(
            child: Row(
                children: List.generate(
                    rates.length,
                    (i) => Expanded(
                            child: Container(
                          margin: const EdgeInsets.only(right: 3),
                          height: 8,
                          decoration: BoxDecoration(
                              color:
                                  colors[i].withValues(alpha: 0.3 + rates[i] / 200),
                              borderRadius: BorderRadius.circular(4)),
                        ))))),
        const SizedBox(width: 8),
        Text('${avg.toStringAsFixed(0)}%',
            style: const TextStyle(
                fontWeight: FontWeight.w700,
                color: AppColors.dark,
                fontSize: 13,
                fontFamily: 'Poppins')),
      ]),
    );
  }

  // ─── Students Tab ────────────────────────────────────────────────────────────
  Widget _buildStudentsTab() {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        // Top performers
        const Row(children: [
          Icon(Icons.emoji_events_rounded, color: AppColors.warning, size: 18),
          SizedBox(width: 6),
          Text('Top Performers',
              style: TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: AppColors.dark)),
        ]),
        const SizedBox(height: 10),
        ..._topStudents.asMap().entries.map((e) {
          final i = e.key;
          final s = e.value;
          const medals = ['🥇', '🥈', '🥉', '🏅'];
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: i == 0
                        ? AppColors.warning.withValues(alpha: 0.4)
                        : AppColors.border)),
            child: Row(children: [
              Text(medals[i], style: const TextStyle(fontSize: 22)),
              const SizedBox(width: 10),
              CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.accentLight,
                  child: Text((s['name'] as String)[0],
                      style: const TextStyle(
                          color: AppColors.accent,
                          fontWeight: FontWeight.w800))),
              const SizedBox(width: 10),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(s['name'] as String,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: AppColors.dark)),
                    Text(s['course'] as String,
                        style:
                            const TextStyle(fontSize: 11, color: AppColors.gray)),
                  ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                    color: AppColors.accentLight,
                    borderRadius: BorderRadius.circular(12)),
                child: Text('${s['rate']}%',
                    style: const TextStyle(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w800,
                        fontFamily: 'Poppins')),
              ),
            ]),
          );
        }),
        const SizedBox(height: 16),

        // At-risk students
        Row(children: [
          const Icon(Icons.warning_rounded, color: AppColors.danger, size: 18),
          const SizedBox(width: 6),
          const Text('At-Risk Students',
              style: TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: AppColors.dark)),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
                color: AppColors.dangerLight,
                borderRadius: BorderRadius.circular(10)),
            child: Text('${_atRisk.length} students',
                style: const TextStyle(
                    color: AppColors.danger,
                    fontSize: 11,
                    fontWeight: FontWeight.w600)),
          ),
        ]),
        const SizedBox(height: 10),
        ..._atRisk.map((s) {
          final rate = s['rate'] as int;
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border:
                    Border.all(color: AppColors.danger.withValues(alpha: 0.25))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.dangerLight,
                    child: Text((s['name'] as String)[0],
                        style: const TextStyle(
                            color: AppColors.danger,
                            fontWeight: FontWeight.w800,
                            fontSize: 12))),
                const SizedBox(width: 10),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(s['name'] as String,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: AppColors.dark)),
                      Text('${s['course']} · Attendance: $rate%',
                          style:
                              const TextStyle(fontSize: 11, color: AppColors.gray)),
                    ])),
                GestureDetector(
                  onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Alert sent to ${s['name']}'),
                      backgroundColor: AppColors.warning,
                      behavior: SnackBarBehavior.floating)),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                        color: AppColors.dangerLight,
                        borderRadius: BorderRadius.circular(8)),
                    child: const Row(children: [
                      Icon(Icons.notifications_rounded,
                          color: AppColors.danger, size: 14),
                      SizedBox(width: 4),
                      Text('Alert',
                          style: TextStyle(
                              color: AppColors.danger,
                              fontSize: 11,
                              fontWeight: FontWeight.w700)),
                    ]),
                  ),
                ),
              ]),
              const SizedBox(height: 8),
              ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                      value: rate / 100,
                      minHeight: 5,
                      backgroundColor: AppColors.border,
                      valueColor:
                          const AlwaysStoppedAnimation(AppColors.danger))),
              const SizedBox(height: 4),
              const Text('⚠ Below 75% threshold — immediate attention required',
                  style: TextStyle(fontSize: 10, color: AppColors.danger)),
            ]),
          );
        }),
        const SizedBox(height: 80),
      ],
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String value, label;
  final Color color, bg;
  const _KpiCard(this.value, this.label, this.color, this.bg);
  @override
  Widget build(BuildContext context) => Expanded(
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border)),
          child: Column(children: [
            Text(value,
                style: TextStyle(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w800,
                    fontSize: 20,
                    color: color)),
            const SizedBox(height: 2),
            Text(label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.gray,
                    fontWeight: FontWeight.w600)),
          ]),
        ),
      );
}
