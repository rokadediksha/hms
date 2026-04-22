require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────

// Add patient
app.post('/patients', async (req, res) => {
  try {
    const { name, age, disease, doctor, ward } = req.body;
    if (!name || !age || !disease) {
      return res.status(400).json({ error: 'name, age, and disease are required' });
    }
    const [result] = await db.query(
      'INSERT INTO patients (name, age, disease, doctor, ward) VALUES (?, ?, ?, ?, ?)',
      [name, age, disease, doctor || null, ward || null]
    );
    res.status(201).json({ message: 'Patient added successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get all patients
app.get('/patients', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get single patient
app.get('/patients/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update patient
app.put('/patients/:id', async (req, res) => {
  try {
    const { name, age, disease, doctor, ward } = req.body;
    const [result] = await db.query(
      'UPDATE patients SET name=?, age=?, disease=?, doctor=?, ward=? WHERE id=?',
      [name, age, disease, doctor || null, ward || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete patient
app.delete('/patients/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// ─────────────────────────────────────────
// DOCTORS
// ─────────────────────────────────────────

app.post('/doctors', async (req, res) => {
  try {
    const { name, specialization, phone } = req.body;
    if (!name || !specialization) {
      return res.status(400).json({ error: 'name and specialization are required' });
    }
    const [result] = await db.query(
      'INSERT INTO doctors (name, specialization, phone) VALUES (?, ?, ?)',
      [name, specialization, phone || null]
    );
    res.status(201).json({ message: 'Doctor added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/doctors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM doctors ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// ─────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────

app.post('/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, notes } = req.body;
    if (!patient_id || !doctor_id || !appointment_date) {
      return res.status(400).json({ error: 'patient_id, doctor_id, and appointment_date are required' });
    }
    const [result] = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, notes) VALUES (?, ?, ?, ?)',
      [patient_id, doctor_id, appointment_date, notes || null]
    );
    res.status(201).json({ message: 'Appointment booked successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/appointments', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.id, a.appointment_date, a.notes, a.status,
             p.name AS patient_name, d.name AS doctor_name, d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.appointment_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// ─────────────────────────────────────────
// STATS
// ─────────────────────────────────────────
app.get('/stats', async (req, res) => {
  try {
    const [[{ patients }]] = await db.query('SELECT COUNT(*) AS patients FROM patients');
    const [[{ doctors }]] = await db.query('SELECT COUNT(*) AS doctors FROM doctors');
    const [[{ appointments }]] = await db.query('SELECT COUNT(*) AS appointments FROM appointments');
    res.json({ patients, doctors, appointments });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 HMS Backend running on port ${PORT}`);
});

module.exports = app; // for testing
