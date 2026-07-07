require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const bcrypt = require('bcryptjs');
const { mongoose, connect } = require('../../config/database');
const { User, Lecturer, Student, Course, CourseStudent, Timetable } = require('../../models');

const ROUNDS = 12;
const hash = (pw) => bcrypt.hash(pw, ROUNDS);

/** Upsert a user and return their document (works even if already exists). */
const upsertUser = async (name, email, passwordHash, role, phone = null) => {
  await User.updateOne(
    { email },
    { $setOnInsert: { name, email, passwordHash, role, phone, isActive: true, isEmailVerified: true } },
    { upsert: true }
  );
  return User.findOne({ email });
};

(async () => {
  console.log('🌱 Seeding database...');
  await connect();

  // ─── Admin ───────────────────────────────────────────────────────────────────
  const adminHash = await hash('Admin@123456');
  await upsertUser('System Administrator', 'admin@landmark.edu.gh', adminHash, 'admin');
  console.log('  ✔ Admin created');

  // ─── Lecturer ────────────────────────────────────────────────────────────────
  const lecHash = await hash('Lecturer@123');
  const lecUser = await upsertUser('Dr. Kwame Mensah', 'k.mensah@landmark.edu.gh', lecHash, 'lecturer');

  await Lecturer.updateOne(
    { userId: lecUser._id },
    { $setOnInsert: { userId: lecUser._id, staffId: 'STAFF001', department: 'Computer Science' } },
    { upsert: true }
  );
  const lec = await Lecturer.findOne({ userId: lecUser._id });
  console.log(`  ✔ Lecturer created (id=${lec._id})`);

  // ─── Students ────────────────────────────────────────────────────────────────
  const stuHash = await hash('Student@123');
  for (let i = 1; i <= 5; i++) {
    const stuUser = await upsertUser(`Student ${i}`, `student${i}@landmark.edu.gh`, stuHash, 'student');
    const studentCode = `CS2025${String(i).padStart(3, '0')}`;
    await Student.updateOne(
      { userId: stuUser._id },
      { $setOnInsert: { userId: stuUser._id, studentId: studentCode, department: 'Computer Science', yearOfStudy: 2 } },
      { upsert: true }
    );
  }
  console.log('  ✔ 5 students created');

  // ─── Course ──────────────────────────────────────────────────────────────────
  await Course.updateOne(
    { code: 'CS101', academicYear: '2025/2026', semester: 'Semester 1' },
    {
      $setOnInsert: {
        code: 'CS101',
        name: 'Introduction to Programming',
        description: 'Fundamentals of programming using Python',
        creditHours: 3,
        department: 'Computer Science',
        semester: 'Semester 1',
        academicYear: '2025/2026',
        lecturerId: lec._id,
        isActive: true,
      },
    },
    { upsert: true }
  );
  const course = await Course.findOne({ code: 'CS101', academicYear: '2025/2026' });
  console.log(`  ✔ Course CS101 created (id=${course._id})`);

  // ─── Enrol students ──────────────────────────────────────────────────────────
  const students = await Student.find().sort({ createdAt: 1 });
  for (const s of students) {
    await CourseStudent.updateOne(
      { courseId: course._id, studentId: s._id },
      { $setOnInsert: { courseId: course._id, studentId: s._id, enrolledAt: new Date() } },
      { upsert: true }
    );
  }
  console.log(`  ✔ ${students.length} students enrolled in CS101`);

  // ─── Timetable ───────────────────────────────────────────────────────────────
  await Timetable.updateOne(
    { courseId: course._id, dayOfWeek: 'Monday', startTime: '08:00', room: 'LT-A' },
    {
      $setOnInsert: {
        courseId: course._id,
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '10:00',
        room: 'LT-A',
        classType: 'lecture',
      },
    },
    { upsert: true }
  );
  console.log('  ✔ Timetable entry added');

  console.log('\n✅ Seed complete. Test credentials:');
  console.log('  Admin:    admin@landmark.edu.gh   / Admin@123456');
  console.log('  Lecturer: k.mensah@landmark.edu.gh / Lecturer@123');
  console.log('  Student:  student1@landmark.edu.gh / Student@123');

  await mongoose.connection.close();
})().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
