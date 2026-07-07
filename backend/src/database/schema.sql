-- =============================================================================
-- Landmark Metropolitan University — Attendance Management System
-- Database Schema (MySQL 8.0+)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS School_attendance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE School_attendance;

-- ─── Users (central auth table for all roles) ────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                     INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  name                   VARCHAR(100)      NOT NULL,
  email                  VARCHAR(150)      NOT NULL UNIQUE,
  password_hash          VARCHAR(255)      NOT NULL,
  role                   ENUM('admin','lecturer','student') NOT NULL DEFAULT 'student',
  phone                  VARCHAR(20)       NULL,
  is_active              TINYINT(1)        NOT NULL DEFAULT 1,
  is_email_verified      TINYINT(1)        NOT NULL DEFAULT 0,
  email_verify_token     VARCHAR(128)      NULL,
  email_verify_expires   DATETIME          NULL,
  reset_token            VARCHAR(128)      NULL,
  reset_token_expires    DATETIME          NULL,
  failed_login_attempts  TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  locked_until           DATETIME          NULL,
  last_login             DATETIME          NULL,
  profile_photo          VARCHAR(300)      NULL,
  mfa_enabled            TINYINT(1)        NOT NULL DEFAULT 0,
  mfa_secret             VARCHAR(128)      NULL,
  session_timeout_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  created_at             DATETIME          NOT NULL,
  updated_at             DATETIME          NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at             DATETIME          NULL,

  INDEX idx_email   (email),
  INDEX idx_role    (role),
  INDEX idx_active  (is_active)
) ENGINE=InnoDB;

-- Device verification for web and mobile clients
CREATE TABLE IF NOT EXISTS user_devices (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  device_fingerprint  VARCHAR(128) NOT NULL,
  device_name         VARCHAR(120) NULL,
  platform            ENUM('web','android','ios','desktop','unknown') NOT NULL DEFAULT 'unknown',
  is_verified         TINYINT(1) NOT NULL DEFAULT 0,
  last_seen_at        DATETIME NULL,
  verified_at         DATETIME NULL,
  created_at          DATETIME NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_device (user_id, device_fingerprint),
  INDEX idx_device_fingerprint (device_fingerprint),
  INDEX idx_verified (is_verified)
) ENGINE=InnoDB;

-- Optional MFA challenge tracking
CREATE TABLE IF NOT EXISTS mfa_challenges (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  challenge   VARCHAR(128) NOT NULL UNIQUE,
  expires_at  DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at  DATETIME NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_expires (user_id, expires_at)
) ENGINE=InnoDB;

-- ─── Students ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id             INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED  NOT NULL UNIQUE,
  student_id     VARCHAR(20)   NOT NULL UNIQUE,
  department     VARCHAR(100)  NULL,
  year_of_study  TINYINT       NULL,
  gpa            DECIMAL(3,2)  NULL,
  created_at     DATETIME      NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_department (department)
) ENGINE=InnoDB;

-- ─── Lecturers ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lecturers (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED  NOT NULL UNIQUE,
  staff_id        VARCHAR(20)   NOT NULL UNIQUE,
  department      VARCHAR(100)  NULL,
  specialisation  VARCHAR(200)  NULL,
  created_at      DATETIME      NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_staff_id   (staff_id),
  INDEX idx_department (department)
) ENGINE=InnoDB;

-- ─── Courses ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)    NOT NULL,
  name          VARCHAR(200)   NOT NULL,
  description   TEXT           NULL,
  credit_hours  TINYINT        NOT NULL DEFAULT 3,
  department    VARCHAR(100)   NULL,
  semester      VARCHAR(20)    NOT NULL,         -- e.g. "Semester 1"
  academic_year VARCHAR(9)     NOT NULL,          -- e.g. "2025/2026"
  lecturer_id   INT UNSIGNED   NULL,
  is_active     TINYINT(1)     NOT NULL DEFAULT 1,
  created_at    DATETIME       NOT NULL,
  updated_at    DATETIME       NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME       NULL,

  FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE SET NULL,
  UNIQUE KEY uq_course_semester (code, academic_year, semester),
  INDEX idx_lecturer   (lecturer_id),
  INDEX idx_department (department),
  INDEX idx_active     (is_active)
) ENGINE=InnoDB;

-- ─── Course–Student Enrolment (many-to-many) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS course_students (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  course_id   INT UNSIGNED  NOT NULL,
  student_id  INT UNSIGNED  NOT NULL,
  enrolled_at DATETIME      NOT NULL,

  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY uq_enrolment (course_id, student_id),
  INDEX idx_student (student_id),
  INDEX idx_course  (course_id)
) ENGINE=InnoDB;

-- ─── Timetables ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timetables (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  course_id   INT UNSIGNED  NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  start_time  TIME          NOT NULL,
  end_time    TIME          NOT NULL,
  room        VARCHAR(50)   NULL,
  class_type  ENUM('lecture','lab','tutorial','seminar') NOT NULL DEFAULT 'lecture',
  created_at  DATETIME      NOT NULL,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course     (course_id),
  INDEX idx_day        (day_of_week),
  INDEX idx_room_day   (room, day_of_week)
) ENGINE=InnoDB;

-- ─── Attendance Sessions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  course_id     INT UNSIGNED  NOT NULL,
  lecturer_id   INT UNSIGNED  NOT NULL,
  session_date  DATE          NOT NULL,
  start_time    TIME          NOT NULL,
  end_time      TIME          NULL,
  session_type  ENUM('lecture','lab','tutorial','seminar') NOT NULL DEFAULT 'lecture',
  status        ENUM('open','closed','cancelled') NOT NULL DEFAULT 'open',
  location_lat  DECIMAL(10,8) NULL,
  location_lng  DECIMAL(11,8) NULL,
  closed_at     DATETIME      NULL,
  created_at    DATETIME      NOT NULL,

  FOREIGN KEY (course_id)   REFERENCES courses(id)   ON DELETE CASCADE,
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE,
  INDEX idx_course_date (course_id, session_date),
  INDEX idx_lecturer    (lecturer_id),
  INDEX idx_date        (session_date),
  INDEX idx_status      (status)
) ENGINE=InnoDB;

-- ─── Attendance Records ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  session_id   INT UNSIGNED  NOT NULL,
  student_id   INT UNSIGNED  NOT NULL,
  status       ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
  method       ENUM('qr','manual','gps','biometric','system') NOT NULL DEFAULT 'manual',
  marked_at    DATETIME      NOT NULL,
  location_lat DECIMAL(10,8) NULL,
  location_lng DECIMAL(11,8) NULL,
  remarks      VARCHAR(300)  NULL,
  edited_by    INT UNSIGNED  NULL,
  edited_at    DATETIME      NULL,
  created_at   DATETIME      NOT NULL,

  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id)            ON DELETE CASCADE,
  FOREIGN KEY (edited_by)  REFERENCES users(id)               ON DELETE SET NULL,
  UNIQUE KEY uq_session_student (session_id, student_id),
  INDEX idx_student   (student_id),
  INDEX idx_session   (session_id),
  INDEX idx_status    (status),
  INDEX idx_marked_at (marked_at)
) ENGINE=InnoDB;

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  sender_id    INT UNSIGNED  NULL,
  recipient_id INT UNSIGNED  NOT NULL,
  title        VARCHAR(200)  NOT NULL,
  message      TEXT          NOT NULL,
  type         ENUM('info','warning','success','error') NOT NULL DEFAULT 'info',
  is_read      TINYINT(1)    NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL,

  FOREIGN KEY (sender_id)    REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_recipient (recipient_id),
  INDEX idx_is_read   (is_read),
  INDEX idx_created   (created_at)
) ENGINE=InnoDB;

-- ─── Audit Logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED  NULL,
  action       VARCHAR(100)  NOT NULL,
  resource     VARCHAR(200)  NULL,
  resource_id  VARCHAR(50)   NULL,
  ip_address   VARCHAR(45)   NULL,
  user_agent   TEXT          NULL,
  status_code  SMALLINT      NULL,
  request_body TEXT          NULL,
  created_at   DATETIME      NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id   (user_id),
  INDEX idx_action    (action),
  INDEX idx_created   (created_at),
  INDEX idx_status    (status_code)
) ENGINE=InnoDB;

-- ─── Token Blacklist (logged-out JWTs) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_blacklist (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  token_jti   VARCHAR(128)  NOT NULL UNIQUE,
  expires_at  DATETIME      NOT NULL,
  created_at  DATETIME      NOT NULL,

  INDEX idx_jti        (token_jti),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- ─── Seed: default admin user ─────────────────────────────────────────────────
-- Password: Admin@123456 (bcrypt, $2a$12$...)
-- IMPORTANT: Change this password immediately after first login.
INSERT IGNORE INTO users (name, email, password_hash, role, is_active, is_email_verified, created_at)
VALUES (
  'System Administrator',
  'admin@landmark.edu.gh',
  '$2a$12$hPXwCqGWMPb2mlBHMZlmtuqCWCRH33rHD7pWG9iBjWP6X26XN/i8C',
  'admin',
  1,
  1,
  NOW()
);

-- ─── Cleanup job: remove expired blacklisted tokens (run via cron) ───────────
-- DELETE FROM token_blacklist WHERE expires_at < NOW();
