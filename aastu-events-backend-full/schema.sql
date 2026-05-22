CREATE DATABASE IF NOT EXISTS aastu_events;
USE aastu_events;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  student_id VARCHAR(100) UNIQUE,
  department VARCHAR(100),
  password TEXT,
  role ENUM('student','admin') DEFAULT 'student',
  is_first_login BOOLEAN DEFAULT TRUE
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  department VARCHAR(100),
  start_date DATETIME,
  end_date DATETIME,
  location VARCHAR(255),
  capacity INT,
  banner_image TEXT,
  is_team_event BOOLEAN DEFAULT FALSE,
  tags JSON,
  created_by INT,
  registration_count INT DEFAULT 0,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  event_id INT NOT NULL,
  qr_code TEXT,
  status ENUM('confirmed','waitlist','checked_in') DEFAULT 'confirmed',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_registration (student_id, event_id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);
