-- ============================================
-- Hospital Management System - RDS Schema
-- Run this once after creating your RDS instance
-- ============================================

CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  age         INT NOT NULL,
  disease     VARCHAR(100) NOT NULL,
  doctor      VARCHAR(100),
  ward        VARCHAR(50),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  patient_id       INT NOT NULL,
  doctor_id        INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  notes            TEXT,
  status           ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE
);

-- ─── SEED DATA (optional) ───────────────────
INSERT INTO doctors (name, specialization, phone) VALUES
  ('Dr. Anjali Mehta',  'Cardiology',     '9876543210'),
  ('Dr. Rajesh Kumar',  'Neurology',      '9876543211'),
  ('Dr. Priya Sharma',  'Orthopedics',    '9876543212'),
  ('Dr. Suresh Nair',   'General Medicine','9876543213');
