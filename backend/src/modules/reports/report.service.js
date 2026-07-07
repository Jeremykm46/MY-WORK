const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Course, Lecturer, User, Student, CourseStudent, AttendanceSession, Attendance } = require('../../models');
const { escapeRegExp } = require('../../utils/helpers');

const round2 = (n) => (n === null || n === undefined || Number.isNaN(n) ? null : Math.round(n * 100) / 100);

const isoWeek = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
};

const sessionDateFilter = ({ from, to }) => {
  const filter = {};
  if (from || to) {
    filter.sessionDate = {};
    if (from) filter.sessionDate.$gte = from;
    if (to) filter.sessionDate.$lte = to;
  }
  return filter;
};

const getAttendanceStats = async ({ courseId, from, to }) => {
  const filter = sessionDateFilter({ from, to });
  if (courseId) filter.courseId = courseId;

  const sessions = await AttendanceSession.find(filter).lean();
  const sessionIds = sessions.map((s) => s._id);
  const courseIds = [...new Set(sessions.map((s) => s.courseId.toString()))];
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const records = await Attendance.find({ sessionId: { $in: sessionIds } }).lean();

  const sessionToCourse = new Map(sessions.map((s) => [s._id.toString(), s.courseId.toString()]));
  const sessionsByCourse = new Map();
  for (const s of sessions) {
    const key = s.courseId.toString();
    if (!sessionsByCourse.has(key)) sessionsByCourse.set(key, new Set());
    sessionsByCourse.get(key).add(s._id.toString());
  }

  const statsByCourse = new Map();
  for (const r of records) {
    const key = sessionToCourse.get(r.sessionId.toString());
    if (!statsByCourse.has(key)) statsByCourse.set(key, { present: 0, absent: 0, late: 0, total: 0 });
    const s = statsByCourse.get(key);
    s.total += 1;
    if (r.status === 'present') s.present += 1;
    else if (r.status === 'absent') s.absent += 1;
    else if (r.status === 'late') s.late += 1;
  }

  return courses
    .filter((c) => sessionsByCourse.has(c._id.toString()))
    .map((c) => {
      const key = c._id.toString();
      const stat = statsByCourse.get(key) || { present: 0, absent: 0, late: 0, total: 0 };
      return {
        code: c.code,
        course: c.name,
        total_sessions: sessionsByCourse.get(key).size,
        total_records: stat.total,
        present_count: stat.present,
        absent_count: stat.absent,
        late_count: stat.late,
        attendance_rate: stat.total ? round2((stat.present * 100) / stat.total) : null,
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
};

const getDailyReport = async (date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const sessions = await AttendanceSession.find({ sessionDate: targetDate }).lean();
  const courseIds = sessions.map((s) => s.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const coursesById = new Map(courses.map((c) => [c._id.toString(), c]));
  const lecturerIds = sessions.map((s) => s.lecturerId).filter(Boolean);
  const lecturers = await Lecturer.find({ _id: { $in: lecturerIds } }).lean();
  const lecturersById = new Map(lecturers.map((l) => [l._id.toString(), l]));
  const lecturerUsers = await User.find({ _id: { $in: lecturers.map((l) => l.userId) } }).select('name').lean();
  const userNameById = new Map(lecturerUsers.map((u) => [u._id.toString(), u.name]));

  const sessionIds = sessions.map((s) => s._id);
  const records = await Attendance.find({ sessionId: { $in: sessionIds } }).lean();
  const statsBySession = new Map();
  for (const r of records) {
    const key = r.sessionId.toString();
    if (!statsBySession.has(key)) statsBySession.set(key, { present: 0, absent: 0, total: 0 });
    const s = statsBySession.get(key);
    s.total += 1;
    if (r.status === 'present') s.present += 1;
    else if (r.status === 'absent') s.absent += 1;
  }

  return sessions.map((s) => {
    const course = coursesById.get(s.courseId.toString());
    const lecturer = s.lecturerId ? lecturersById.get(s.lecturerId.toString()) : null;
    const stat = statsBySession.get(s._id.toString()) || { present: 0, absent: 0, total: 0 };
    return {
      session_id: s._id.toString(),
      code: course ? course.code : null,
      course: course ? course.name : null,
      session_date: s.sessionDate,
      start_time: s.startTime,
      session_status: s.status,
      lecturer: lecturer ? userNameById.get(lecturer.userId.toString()) : null,
      total_students: stat.total,
      present: stat.present,
      absent: stat.absent,
    };
  });
};

const getSessionRecords = async ({ from, to, courseId, department, search, lecturerId }) => {
  const filter = sessionDateFilter({ from, to });
  if (courseId) filter.courseId = courseId;
  if (lecturerId) filter.lecturerId = lecturerId;

  let sessions = await AttendanceSession.find(filter).lean();
  const courseIds = [...new Set(sessions.map((s) => s.courseId.toString()))];
  let courses = await Course.find({ _id: { $in: courseIds } }).lean();
  if (department) courses = courses.filter((c) => c.department === department);
  const coursesById = new Map(courses.map((c) => [c._id.toString(), c]));

  const lecturerIds = sessions.map((s) => s.lecturerId).filter(Boolean);
  const lecturers = await Lecturer.find({ _id: { $in: lecturerIds } }).lean();
  const lecturersById = new Map(lecturers.map((l) => [l._id.toString(), l]));
  const lecturerUsers = await User.find({ _id: { $in: lecturers.map((l) => l.userId) } }).select('name').lean();
  const userNameById = new Map(lecturerUsers.map((u) => [u._id.toString(), u.name]));

  sessions = sessions.filter((s) => coursesById.has(s.courseId.toString()));

  if (search) {
    const re = new RegExp(escapeRegExp(search), 'i');
    sessions = sessions.filter((s) => {
      const course = coursesById.get(s.courseId.toString());
      const lecturer = s.lecturerId ? lecturersById.get(s.lecturerId.toString()) : null;
      const lecturerName = lecturer ? userNameById.get(lecturer.userId.toString()) : null;
      return re.test(course.name) || (lecturerName && re.test(lecturerName));
    });
  }

  const sessionIds = sessions.map((s) => s._id);
  const records = await Attendance.find({ sessionId: { $in: sessionIds } }).lean();
  const statsBySession = new Map();
  for (const r of records) {
    const key = r.sessionId.toString();
    if (!statsBySession.has(key)) statsBySession.set(key, { present: 0, absent: 0, late: 0, total: 0 });
    const s = statsBySession.get(key);
    s.total += 1;
    if (r.status === 'present') s.present += 1;
    else if (r.status === 'absent') s.absent += 1;
    else if (r.status === 'late') s.late += 1;
  }

  return sessions
    .map((s) => {
      const course = coursesById.get(s.courseId.toString());
      const lecturer = s.lecturerId ? lecturersById.get(s.lecturerId.toString()) : null;
      const stat = statsBySession.get(s._id.toString()) || { present: 0, absent: 0, late: 0, total: 0 };
      return {
        session_id: s._id.toString(),
        code: course.code,
        course: course.name,
        department: course.department,
        session_date: s.sessionDate,
        start_time: s.startTime,
        lecturer: lecturer ? userNameById.get(lecturer.userId.toString()) : null,
        total: stat.total,
        present: stat.present,
        absent: stat.absent,
        late: stat.late,
        rate: stat.total ? round2((stat.present * 100) / stat.total) : null,
        _sortKey: `${s.sessionDate}|${s._id.toString()}`,
      };
    })
    .sort((a, b) => (a._sortKey < b._sortKey ? 1 : -1))
    .map(({ _sortKey, ...rest }) => rest);
};

const getWeeklyReport = async ({ from, to, courseId }) => {
  const start = from || (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; })();
  const end = to || new Date().toISOString().split('T')[0];

  const filter = { sessionDate: { $gte: start, $lte: end } };
  if (courseId) filter.courseId = courseId;

  const sessions = await AttendanceSession.find(filter).lean();
  const courseIds = [...new Set(sessions.map((s) => s.courseId.toString()))];
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const coursesById = new Map(courses.map((c) => [c._id.toString(), c]));

  const sessionIds = sessions.map((s) => s._id);
  const records = await Attendance.find({ sessionId: { $in: sessionIds } }).lean();
  const recordsBySession = new Map();
  for (const r of records) {
    const key = r.sessionId.toString();
    if (!recordsBySession.has(key)) recordsBySession.set(key, []);
    recordsBySession.get(key).push(r);
  }

  const groups = new Map(); // `${week}:${courseId}` -> { week, weekStart, weekEnd, course, sessions:Set, pctSum, pctCount }
  for (const s of sessions) {
    const course = coursesById.get(s.courseId.toString());
    if (!course) continue;
    const week = isoWeek(s.sessionDate);
    const key = `${week}:${course._id.toString()}`;
    if (!groups.has(key)) {
      groups.set(key, { week, weekStart: s.sessionDate, weekEnd: s.sessionDate, course, sessionIds: new Set(), pctSum: 0, pctCount: 0 });
    }
    const g = groups.get(key);
    g.sessionIds.add(s._id.toString());
    if (s.sessionDate < g.weekStart) g.weekStart = s.sessionDate;
    if (s.sessionDate > g.weekEnd) g.weekEnd = s.sessionDate;

    const sessionRecords = recordsBySession.get(s._id.toString()) || [];
    for (const r of sessionRecords) {
      g.pctSum += r.status === 'present' ? 100 : 0;
      g.pctCount += 1;
    }
  }

  return [...groups.values()]
    .map((g) => ({
      week: g.week,
      week_start: g.weekStart,
      week_end: g.weekEnd,
      code: g.course.code,
      course: g.course.name,
      sessions: g.sessionIds.size,
      avg_attendance_pct: g.pctCount ? round2(g.pctSum / g.pctCount) : null,
    }))
    .sort((a, b) => (a.week < b.week ? 1 : -1));
};

const getMonthlyReport = async ({ year, month, courseId }) => {
  const y = year || new Date().getFullYear();
  const m = month || new Date().getMonth() + 1;
  const prefix = `${y}-${String(m).padStart(2, '0')}`;

  const filter = { sessionDate: { $regex: `^${prefix}` } };
  if (courseId) filter.courseId = courseId;

  const sessions = await AttendanceSession.find(filter).lean();
  const courseIds = [...new Set(sessions.map((s) => s.courseId.toString()))];
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const coursesById = new Map(courses.map((c) => [c._id.toString(), c]));

  const sessionIds = sessions.map((s) => s._id);
  const records = await Attendance.find({ sessionId: { $in: sessionIds } }).lean();
  const sessionToCourse = new Map(sessions.map((s) => [s._id.toString(), s.courseId.toString()]));

  const statsByCourse = new Map();
  const sessionsByCourse = new Map();
  for (const s of sessions) {
    const key = s.courseId.toString();
    if (!sessionsByCourse.has(key)) sessionsByCourse.set(key, new Set());
    sessionsByCourse.get(key).add(s._id.toString());
  }
  for (const r of records) {
    const key = sessionToCourse.get(r.sessionId.toString());
    if (!statsByCourse.has(key)) statsByCourse.set(key, { pctSum: 0, pctCount: 0, present: 0, absent: 0 });
    const s = statsByCourse.get(key);
    s.pctSum += r.status === 'present' ? 100 : 0;
    s.pctCount += 1;
    if (r.status === 'present') s.present += 1;
    else if (r.status === 'absent') s.absent += 1;
  }

  return [...sessionsByCourse.keys()]
    .map((key) => {
      const course = coursesById.get(key);
      const stat = statsByCourse.get(key) || { pctSum: 0, pctCount: 0, present: 0, absent: 0 };
      return {
        code: course.code,
        course: course.name,
        total_sessions: sessionsByCourse.get(key).size,
        avg_attendance_pct: stat.pctCount ? round2(stat.pctSum / stat.pctCount) : null,
        total_present: stat.present,
        total_absent: stat.absent,
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
};

const getStudentReport = async (studentId) => {
  const courseIds = await CourseStudent.find({ studentId }).distinct('courseId');
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();

  const sessions = await AttendanceSession.find({ courseId: { $in: courseIds } }).select('_id courseId').lean();
  const sessionToCourse = new Map(sessions.map((s) => [s._id.toString(), s.courseId.toString()]));
  const sessionIds = sessions.map((s) => s._id);

  const records = await Attendance.find({ studentId, sessionId: { $in: sessionIds } }).lean();
  const statsByCourse = new Map();
  for (const r of records) {
    const key = sessionToCourse.get(r.sessionId.toString());
    if (!statsByCourse.has(key)) statsByCourse.set(key, { total: 0, present: 0 });
    const s = statsByCourse.get(key);
    s.total += 1;
    if (r.status === 'present') s.present += 1;
  }

  return courses
    .map((c) => {
      const stat = statsByCourse.get(c._id.toString()) || { total: 0, present: 0 };
      const percentage = stat.total ? round2((stat.present * 100) / stat.total) : null;
      return {
        code: c.code,
        course: c.name,
        total_sessions: stat.total,
        attended: stat.present,
        percentage,
        at_risk: percentage !== null && percentage < 75 ? 1 : 0,
      };
    })
    .sort((a, b) => {
      if (a.percentage === null) return 1;
      if (b.percentage === null) return -1;
      return a.percentage - b.percentage;
    });
};

const getLowAttendanceStudents = async (threshold = 75) => {
  const enrollments = await CourseStudent.find().lean();
  const students = await Student.find({ _id: { $in: enrollments.map((e) => e.studentId) } }).lean();
  const studentsById = new Map(students.map((s) => [s._id.toString(), s]));
  const activeUsers = await User.find({ _id: { $in: students.map((s) => s.userId) }, isActive: true })
    .select('name email')
    .lean();
  const activeUsersById = new Map(activeUsers.map((u) => [u._id.toString(), u]));

  const courses = await Course.find({ _id: { $in: enrollments.map((e) => e.courseId) } }).lean();
  const coursesById = new Map(courses.map((c) => [c._id.toString(), c]));

  const sessions = await AttendanceSession.find({ courseId: { $in: courses.map((c) => c._id) } }).select('_id courseId').lean();
  const sessionToCourse = new Map(sessions.map((s) => [s._id.toString(), s.courseId.toString()]));

  const records = await Attendance.find({ sessionId: { $in: sessions.map((s) => s._id) } }).lean();

  const pairStats = new Map();
  const enrolledPairs = new Set(enrollments.map((e) => `${e.studentId.toString()}:${e.courseId.toString()}`));
  for (const r of records) {
    const courseId = sessionToCourse.get(r.sessionId.toString());
    const key = `${r.studentId.toString()}:${courseId}`;
    if (!enrolledPairs.has(key)) continue;
    if (!pairStats.has(key)) pairStats.set(key, { total: 0, present: 0 });
    const stat = pairStats.get(key);
    stat.total += 1;
    if (r.status === 'present') stat.present += 1;
  }

  const result = [];
  for (const [key, stat] of pairStats) {
    if (stat.total === 0) continue;
    const percentage = (stat.present * 100) / stat.total;
    if (percentage >= threshold) continue;
    const [studentId, courseId] = key.split(':');
    const student = studentsById.get(studentId);
    const user = student ? activeUsersById.get(student.userId.toString()) : null;
    const course = coursesById.get(courseId);
    if (!user || !course) continue;
    result.push({ name: user.name, email: user.email, student_id: student.studentId, code: course.code, course: course.name, percentage: round2(percentage) });
  }

  return result.sort((a, b) => a.percentage - b.percentage);
};

// ─── PDF Export ───────────────────────────────────────────────────────────────
const exportPDF = async (type, params, res) => {
  let data, title;

  switch (type) {
    case 'daily':
      data = await getDailyReport(params.date);
      title = `Daily Attendance Report — ${params.date || new Date().toISOString().split('T')[0]}`;
      break;
    case 'student':
      data = await getStudentReport(params.studentId);
      title = 'Student Attendance Report';
      break;
    default:
      data = await getAttendanceStats(params);
      title = 'Attendance Statistics Report';
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).fillColor('#1E3A5F').text('Landmark Metropolitan University', { align: 'center' });
  doc.fontSize(14).fillColor('#2563EB').text(title, { align: 'center' });
  doc.fontSize(10).fillColor('#6B7280').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  // Table headers
  const cols = data.length > 0 ? Object.keys(data[0]) : [];
  if (cols.length) {
    doc.fontSize(9).fillColor('#1F2937').font('Helvetica-Bold');
    const colWidth = 470 / cols.length;
    cols.forEach((col, i) => {
      doc.text(col.replace(/_/g, ' ').toUpperCase(), 50 + i * colWidth, doc.y, { width: colWidth, continued: i < cols.length - 1 });
    });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke('#E5E7EB');
    doc.moveDown(0.3);

    // Rows
    doc.font('Helvetica').fillColor('#374151');
    data.forEach((row, rowIdx) => {
      if (doc.y > 720) doc.addPage();
      const rowFill = rowIdx % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
      cols.forEach((col, i) => {
        doc.text(String(row[col] ?? ''), 50 + i * colWidth, doc.y, { width: colWidth, continued: i < cols.length - 1 });
      });
      doc.moveDown(0.4);
    });
  } else {
    doc.text('No data available for the selected filters.');
  }

  doc.end();
};

// ─── Excel Export ─────────────────────────────────────────────────────────────
const exportExcel = async (type, params, res) => {
  let data, sheetName;

  switch (type) {
    case 'daily': data = await getDailyReport(params.date); sheetName = 'Daily Report'; break;
    case 'student': data = await getStudentReport(params.studentId); sheetName = 'Student Report'; break;
    case 'low-attendance': data = await getLowAttendanceStudents(params.threshold); sheetName = 'Low Attendance'; break;
    default: data = await getAttendanceStats(params); sheetName = 'Stats';
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Landmark Attendance System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);

  const cols = data.length > 0 ? Object.keys(data[0]) : [];
  if (cols.length) {
    sheet.columns = cols.map((key) => ({
      header: key.replace(/_/g, ' ').toUpperCase(),
      key,
      width: 20,
    }));

    // Style header row
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    data.forEach((row) => sheet.addRow(row));

    // Alternate row colours
    for (let i = 2; i <= data.length + 1; i++) {
      if (i % 2 === 0) {
        sheet.getRow(i).eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } };
        });
      }
    }
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-report.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
const exportCSV = async (type, params, res) => {
  let data;
  switch (type) {
    case 'daily': data = await getDailyReport(params.date); break;
    case 'student': data = await getStudentReport(params.studentId); break;
    default: data = await getAttendanceStats(params);
  }

  const cols = data.length > 0 ? Object.keys(data[0]) : [];
  const csv = [cols.join(','), ...data.map((row) => cols.map((c) => `"${String(row[c] ?? '')}"`).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
  res.send(csv);
};

module.exports = { getAttendanceStats, getSessionRecords, getDailyReport, getWeeklyReport, getMonthlyReport, getStudentReport, getLowAttendanceStudents, exportPDF, exportExcel, exportCSV };
