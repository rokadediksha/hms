const API = 'http://3.88.71.160:3000';

// ─── TOAST ──────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', 3000);
}

// ─── MODAL ──────────────────────────────────────────────
function openModal(id) {
  if (id === 'appointmentModal') populateDropdowns();
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) el.classList.remove('open');
  });
});

// ─── NAVIGATION ─────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    loadTabData(btn.dataset.tab);
  });
});

function loadTabData(tab) {
  if (tab === 'dashboard')    { loadStats(); loadDashPatients(); }
  if (tab === 'patients')     loadPatients();
  if (tab === 'doctors')      loadDoctors();
  if (tab === 'appointments') loadAppointments();
}

// ─── DATE DISPLAY ────────────────────────────────────────
function setDate() {
  const el = document.getElementById('headerDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ─── STATS ───────────────────────────────────────────────
async function loadStats() {
  try {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();
    document.getElementById('statPatients').textContent     = data.patients ?? '0';
    document.getElementById('statDoctors').textContent      = data.doctors ?? '0';
    document.getElementById('statAppointments').textContent = data.appointments ?? '0';
  } catch {
    showToast('Failed to load stats', 'error');
  }
}

// ─── DASHBOARD PATIENTS ──────────────────────────────────
async function loadDashPatients() {
  try {
    const res  = await fetch(`${API}/patients`);
    const data = await res.json();
    const tbody = document.querySelector('#dashPatientTable tbody');
    tbody.innerHTML = '';
    const recent = data.slice(0, 5);
    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty">No patients yet</td></tr>';
      return;
    }
    recent.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.age}</td>
        <td><span class="badge badge-blue">${p.disease}</span></td>
        <td>${p.ward ? `<span class="badge badge-green">${p.ward}</span>` : '—'}</td>
        <td>${formatDate(p.created_at)}</td>
      `;
      tbody.appendChild(row);
    });
  } catch {
    showToast('Failed to load patients', 'error');
  }
}

// ─── PATIENTS ────────────────────────────────────────────
async function loadPatients() {
  try {
    const res  = await fetch(`${API}/patients`);
    const data = await res.json();
    const tbody = document.querySelector('#patientTable tbody');
    tbody.innerHTML = '';
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">No patients found. Click "+ Add Patient" to get started.</td></tr>';
      return;
    }
    data.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>#${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.age}</td>
        <td><span class="badge badge-blue">${p.disease}</span></td>
        <td>${p.doctor || '—'}</td>
        <td>${p.ward ? `<span class="badge badge-green">${p.ward}</span>` : '—'}</td>
        <td>
          <button class="btn-icon" onclick="deletePatient(${p.id})" title="Delete">🗑</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch {
    showToast('Failed to load patients', 'error');
  }
}

async function addPatient() {
  const name    = document.getElementById('pName').value.trim();
  const age     = document.getElementById('pAge').value;
  const disease = document.getElementById('pDisease').value.trim();
  const doctor  = document.getElementById('pDoctor').value.trim();
  const ward    = document.getElementById('pWard').value;

  if (!name || !age || !disease) {
    showToast('Name, age and disease are required', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age: Number(age), disease, doctor, ward })
    });
    if (!res.ok) throw new Error();
    showToast('Patient added successfully ✅');
    closeModal('patientModal');
    clearForm(['pName','pAge','pDisease','pDoctor']);
    document.getElementById('pWard').value = '';
    loadPatients();
    loadStats();
  } catch {
    showToast('Failed to add patient', 'error');
  }
}

async function deletePatient(id) {
  if (!confirm('Delete this patient?')) return;
  try {
    const res = await fetch(`${API}/patients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Patient deleted');
    loadPatients();
    loadStats();
    loadDashPatients();
  } catch {
    showToast('Failed to delete patient', 'error');
  }
}

// ─── DOCTORS ─────────────────────────────────────────────
async function loadDoctors() {
  try {
    const res  = await fetch(`${API}/doctors`);
    const data = await res.json();
    const grid = document.getElementById('doctorGrid');
    grid.innerHTML = '';
    if (!data.length) {
      grid.innerHTML = '<div class="empty">No doctors found. Click "+ Add Doctor" to get started.</div>';
      return;
    }
    data.forEach(d => {
      const initials = d.name.split(' ').slice(-2).map(n => n[0]).join('').toUpperCase();
      const card = document.createElement('div');
      card.className = 'doctor-card';
      card.innerHTML = `
        <div class="doctor-avatar">${initials}</div>
        <div class="doctor-name">${d.name}</div>
        <div class="doctor-spec">${d.specialization}</div>
        ${d.phone ? `<div class="doctor-phone">📞 ${d.phone}</div>` : ''}
      `;
      grid.appendChild(card);
    });
  } catch {
    showToast('Failed to load doctors', 'error');
  }
}

async function addDoctor() {
  const name           = document.getElementById('dName').value.trim();
  const specialization = document.getElementById('dSpec').value.trim();
  const phone          = document.getElementById('dPhone').value.trim();

  if (!name || !specialization) {
    showToast('Name and specialization are required', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, specialization, phone })
    });
    if (!res.ok) throw new Error();
    showToast('Doctor added successfully ✅');
    closeModal('doctorModal');
    clearForm(['dName','dSpec','dPhone']);
    loadDoctors();
    loadStats();
  } catch {
    showToast('Failed to add doctor', 'error');
  }
}

// ─── APPOINTMENTS ────────────────────────────────────────
async function loadAppointments() {
  try {
    const res  = await fetch(`${API}/appointments`);
    const data = await res.json();
    const tbody = document.querySelector('#appointmentTable tbody');
    tbody.innerHTML = '';
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">No appointments yet</td></tr>';
      return;
    }
    data.forEach(a => {
      const statusClass = {
        scheduled: 'badge-blue',
        completed: 'badge-green',
        cancelled: 'badge-red'
      }[a.status] || 'badge-blue';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${a.patient_name}</strong></td>
        <td>${a.doctor_name}</td>
        <td><span class="badge badge-amber">${a.specialization}</span></td>
        <td>${formatDate(a.appointment_date)}</td>
        <td><span class="badge ${statusClass}">${a.status}</span></td>
        <td>${a.notes || '—'}</td>
      `;
      tbody.appendChild(row);
    });
  } catch {
    showToast('Failed to load appointments', 'error');
  }
}

async function populateDropdowns() {
  try {
    const [pRes, dRes] = await Promise.all([
      fetch(`${API}/patients`),
      fetch(`${API}/doctors`)
    ]);
    const patients = await pRes.json();
    const doctors  = await dRes.json();

    const pSel = document.getElementById('aPatient');
    const dSel = document.getElementById('aDoctor');
    pSel.innerHTML = '<option value="">Select Patient</option>';
    dSel.innerHTML = '<option value="">Select Doctor</option>';

    patients.forEach(p => {
      pSel.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
    doctors.forEach(d => {
      dSel.innerHTML += `<option value="${d.id}">${d.name} — ${d.specialization}</option>`;
    });
  } catch {
    showToast('Failed to load data for dropdowns', 'error');
  }
}

async function bookAppointment() {
  const patient_id       = document.getElementById('aPatient').value;
  const doctor_id        = document.getElementById('aDoctor').value;
  const appointment_date = document.getElementById('aDate').value;
  const notes            = document.getElementById('aNotes').value.trim();

  if (!patient_id || !doctor_id || !appointment_date) {
    showToast('Patient, doctor and date are required', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id, doctor_id, appointment_date, notes })
    });
    if (!res.ok) throw new Error();
    showToast('Appointment booked successfully ✅');
    closeModal('appointmentModal');
    clearForm(['aNotes']);
    document.getElementById('aPatient').value = '';
    document.getElementById('aDoctor').value  = '';
    document.getElementById('aDate').value    = '';
    loadAppointments();
    loadStats();
  } catch {
    showToast('Failed to book appointment', 'error');
  }
}

// ─── HELPERS ─────────────────────────────────────────────
function clearForm(ids) {
  ids.forEach(id => { document.getElementById(id).value = ''; });
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ─── INIT ─────────────────────────────────────────────────
setDate();
loadStats();
loadDashPatients();
