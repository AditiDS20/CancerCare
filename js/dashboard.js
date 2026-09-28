/**
 * CancerCare - Dashboard Controller
 * Tagline: Patient Care & Treatment Management
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure authentication state
  CancerCareAuth.checkAuth();
  CancerCareUI.setupModalListeners();

  // Load and render all dashboard modules
  loadPatientInfo();
  loadSummaryMetrics();
  loadTreatmentCard();
  loadCharts();
  loadAppointmentsList();
  loadMedicationsList();
  loadSymptomsList();
  loadRemindersList();
  setupQuickActionForms();
  setupCareSummaryReport();

  // Reset Demo Data handler
  const resetBtn = document.getElementById('reset-demo-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all records to the original demo data?')) {
        CancerCareStorage.resetAllData(true);
      }
    });
  }

  // Logout handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      CancerCareAuth.logout();
    });
  }
});

/**
 * Populate patient name & initials in sidebar
 */
function loadPatientInfo() {
  const patient = CancerCareStorage.getPatient();
  const userNameEl = document.getElementById('sidebar-user-name');
  const userAvatarEl = document.getElementById('sidebar-user-avatar');
  const welcomeMsgEl = document.getElementById('dashboard-welcome-msg');

  if (patient && patient.fullName) {
    if (userNameEl) userNameEl.textContent = patient.fullName;
    if (userAvatarEl) {
      const parts = patient.fullName.trim().split(' ');
      userAvatarEl.textContent = parts.length > 1 
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
        : patient.fullName.substring(0, 2).toUpperCase();
    }
    if (welcomeMsgEl) {
      welcomeMsgEl.textContent = `Welcome back, ${patient.fullName}. Here is your clinical schedule and care progress.`;
    }
  }
}

/**
 * Populate top 4 summary metric stat cards
 */
function loadSummaryMetrics() {
  const appointments = CancerCareStorage.getAppointments();
  const treatment = CancerCareStorage.getTreatment();
  const medications = CancerCareStorage.getMedications();
  const reminders = CancerCareStorage.getReminders();
  const reports = CancerCareStorage.getReports();

  // 1. Next Appointment
  const upcomingApts = appointments
    .filter(a => a.status === 'Upcoming')
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

  const nextAptDateEl = document.getElementById('stat-next-apt-date');
  const nextAptDocEl = document.getElementById('stat-next-apt-doctor');

  if (upcomingApts.length > 0) {
    const next = upcomingApts[0];
    if (nextAptDateEl) nextAptDateEl.textContent = `${CancerCareUI.formatDate(next.date)}`;
    if (nextAptDocEl) nextAptDocEl.textContent = `${next.doctorName} • ${CancerCareUI.formatTime(next.time)}`;
  } else {
    if (nextAptDateEl) nextAptDateEl.textContent = 'None Scheduled';
    if (nextAptDocEl) nextAptDocEl.textContent = 'No upcoming appointments';
  }

  // 2. Treatment Phase
  const treatPhaseEl = document.getElementById('stat-treatment-phase');
  const treatProgEl = document.getElementById('stat-treatment-progress');
  if (treatment) {
    if (treatPhaseEl) treatPhaseEl.textContent = treatment.subPhase ? treatment.subPhase.split('-')[0].trim() : 'Phase 2';
    if (treatProgEl) treatProgEl.textContent = `${treatment.progressPercentage || 65}% Overall Completed`;
  }

  // 3. Medications Taken
  const totalMeds = medications.length;
  const takenMeds = medications.filter(m => m.takenToday).length;
  const medsTakenEl = document.getElementById('stat-meds-taken');
  const medsDescEl = document.getElementById('stat-meds-desc');
  if (medsTakenEl) medsTakenEl.textContent = `${takenMeds} / ${totalMeds}`;
  if (medsDescEl) medsDescEl.textContent = totalMeds === 0 ? 'No medications recorded' : `${Math.round((takenMeds / totalMeds) * 100)}% adherence today`;

  // 4. Reminders & Reports
  const pendingReminders = reminders.filter(r => !r.completed).length;
  const remindersCountEl = document.getElementById('stat-reminders-count');
  const reportsCountEl = document.getElementById('stat-reports-count');
  if (remindersCountEl) remindersCountEl.textContent = `${pendingReminders} Pending`;
  if (reportsCountEl) reportsCountEl.textContent = `${reports.length} Medical Reports on file`;
}

/**
 * Populate Treatment Card
 */
function loadTreatmentCard() {
  const treatment = CancerCareStorage.getTreatment();
  if (!treatment) return;

  const phaseBadge = document.getElementById('treatment-badge-phase');
  const subphaseText = document.getElementById('treatment-subphase-text');
  const percentLabel = document.getElementById('treatment-percent-label');
  const progressBar = document.getElementById('treatment-progress-bar');
  const startDate = document.getElementById('treatment-start-date');
  const nextSession = document.getElementById('treatment-next-session');
  const estEnd = document.getElementById('treatment-est-end');

  const pct = treatment.progressPercentage || 0;
  if (phaseBadge) phaseBadge.textContent = treatment.phase || 'Active Therapy';
  if (subphaseText) subphaseText.textContent = treatment.subPhase || 'Care Cycle in Progress';
  if (percentLabel) percentLabel.textContent = `${pct}%`;
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (startDate) startDate.textContent = `Started: ${CancerCareUI.formatDate(treatment.startDate)}`;
  if (nextSession) {
    const sessionDate = treatment.nextScheduledSession ? new Date(treatment.nextScheduledSession) : null;
    nextSession.textContent = sessionDate 
      ? `Next Session: ${sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : 'Next Session: Pending';
  }
  if (estEnd) estEnd.textContent = `Est. Completion: ${CancerCareUI.formatDate(treatment.estimatedEnd)}`;
}

/**
 * Initialize Chart.js charts
 */
let symptomChartInstance = null;
let milestonesChartInstance = null;

function loadCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js CDN did not load; charts disabled gracefully.');
    return;
  }

  // 1. Symptom Severity Trend Chart
  const symptoms = CancerCareStorage.getSymptoms().slice().reverse();
  const ctxSymptom = document.getElementById('symptomTrendChart');
  if (ctxSymptom) {
    const labels = symptoms.map(s => CancerCareUI.formatDate(s.date));
    const dataPoints = symptoms.map(s => s.severity);
    const pointLabels = symptoms.map(s => s.name);

    if (symptomChartInstance) {
      symptomChartInstance.destroy();
    }

    symptomChartInstance = new Chart(ctxSymptom, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          label: 'Severity Level (1-10)',
          data: dataPoints.length ? dataPoints : [0],
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#0f766e',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const idx = context.dataIndex;
                return pointLabels[idx] ? `Symptom: ${pointLabels[idx]}` : '';
              }
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: { stepSize: 2 }
          }
        }
      }
    });
  }

  // 2. Milestones Chart
  const treatment = CancerCareStorage.getTreatment();
  const ctxMilestones = document.getElementById('milestonesChart');
  if (ctxMilestones && treatment && treatment.milestones) {
    const completedCount = treatment.milestones.filter(m => m.status === 'Completed').length;
    const inProgressCount = treatment.milestones.filter(m => m.status === 'In Progress').length;
    const upcomingCount = treatment.milestones.filter(m => m.status === 'Upcoming').length;

    const badge = document.getElementById('milestones-completed-badge');
    if (badge) badge.textContent = `${completedCount} of ${treatment.milestones.length} Completed`;

    if (milestonesChartInstance) {
      milestonesChartInstance.destroy();
    }

    milestonesChartInstance = new Chart(ctxMilestones, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Upcoming'],
        datasets: [{
          data: [completedCount, inProgressCount, upcomingCount],
          backgroundColor: ['#10b981', '#0ea5e9', '#cbd5e1'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 12 } }
          }
        }
      }
    });
  }
}

/**
 * Load Mini Upcoming Appointments
 */
function loadAppointmentsList() {
  const container = document.getElementById('dashboard-appointments-list');
  if (!container) return;

  const appointments = CancerCareStorage.getAppointments()
    .filter(a => a.status === 'Upcoming')
    .slice(0, 3);

  if (appointments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-title">No upcoming appointments</div>
        <p class="empty-state-text">Use the button above to schedule your next visit.</p>
      </div>
    `;
    return;
  }

  let html = '<div style="display:flex; flex-direction:column; divide-y;">';
  appointments.forEach(apt => {
    html += `
      <div style="padding: 14px 20px; border-bottom: 1px solid var(--slate-100); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-weight: 600; color: var(--slate-900); font-size: 14px;">${apt.doctorName}</div>
          <div style="font-size: 12px; color: var(--slate-500); margin-top: 2px;">
            ${apt.type} • 📍 ${apt.location || 'Clinical Center'}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="badge badge-info">${CancerCareUI.formatDate(apt.date)}</div>
          <div style="font-size: 12px; font-weight: 600; color: var(--slate-700); margin-top: 4px;">
            ${CancerCareUI.formatTime(apt.time)}
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Load Mini Medication Checklist
 */
function loadMedicationsList() {
  const container = document.getElementById('dashboard-medications-list');
  if (!container) return;

  const medications = CancerCareStorage.getMedications().slice(0, 4);

  if (medications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💊</div>
        <div class="empty-state-title">No medications recorded</div>
        <p class="empty-state-text">Add your prescription details to monitor daily intake.</p>
      </div>
    `;
    return;
  }

  let html = '<div style="display:flex; flex-direction:column;">';
  medications.forEach(med => {
    const isTaken = med.takenToday;
    html += `
      <div style="padding: 12px 20px; border-bottom: 1px solid var(--slate-100); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <input 
            type="checkbox" 
            style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary-700);" 
            ${isTaken ? 'checked' : ''} 
            onchange="handleToggleMedication('${med.id}')"
          >
          <div>
            <div style="font-weight: 600; font-size: 14px; color: ${isTaken ? 'var(--slate-500)' : 'var(--slate-900)'}; text-decoration: ${isTaken ? 'line-through' : 'none'};">
              ${med.name}
            </div>
            <div style="font-size: 12px; color: var(--slate-500);">
              ${med.dosage} • ${med.schedule}
            </div>
          </div>
        </div>
        <div>
          ${isTaken 
            ? `<span class="badge badge-success">✓ Taken</span>` 
            : `<span class="badge badge-warning">Pending</span>`}
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Global function called by inline checkbox
 */
window.handleToggleMedication = function(id) {
  const updated = CancerCareStorage.toggleMedicationTaken(id);
  if (updated) {
    CancerCareUI.showToast(updated.takenToday ? `Marked ${updated.name} as taken` : `Marked ${updated.name} as pending`);
    loadSummaryMetrics();
    loadMedicationsList();
  }
};

/**
 * Load Mini Recent Symptoms
 */
function loadSymptomsList() {
  const container = document.getElementById('dashboard-symptoms-list');
  if (!container) return;

  const symptoms = CancerCareStorage.getSymptoms().slice(0, 3);

  if (symptoms.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-title">No symptoms logged</div>
        <p class="empty-state-text">Keep track of physical sensations or side effects.</p>
      </div>
    `;
    return;
  }

  let html = '<div style="display:flex; flex-direction:column;">';
  symptoms.forEach(sym => {
    let sevBadge = 'badge-success';
    if (sym.severity >= 4 && sym.severity <= 6) sevBadge = 'badge-warning';
    if (sym.severity >= 7) sevBadge = 'badge-danger';

    html += `
      <div style="padding: 12px 20px; border-bottom: 1px solid var(--slate-100); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-weight: 600; font-size: 14px; color: var(--slate-900);">${sym.name}</div>
          <div style="font-size: 12px; color: var(--slate-500); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${sym.notes || 'No context notes'}
          </div>
        </div>
        <div style="text-align: right;">
          <span class="badge ${sevBadge}">Severity ${sym.severity}/10</span>
          <div style="font-size: 11px; color: var(--slate-400); margin-top: 4px;">${CancerCareUI.formatDate(sym.date)}</div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Load Mini Reminders
 */
function loadRemindersList() {
  const container = document.getElementById('dashboard-reminders-list');
  if (!container) return;

  const reminders = CancerCareStorage.getReminders().slice(0, 3);

  if (reminders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⏰</div>
        <div class="empty-state-title">No reminders set</div>
        <p class="empty-state-text">Create reminders for appointments, hydration, and tasks.</p>
      </div>
    `;
    return;
  }

  let html = '<div style="display:flex; flex-direction:column;">';
  reminders.forEach(rem => {
    html += `
      <div style="padding: 12px 20px; border-bottom: 1px solid var(--slate-100); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <input 
            type="checkbox" 
            style="width: 17px; height: 17px; cursor: pointer; accent-color: var(--primary-700);" 
            ${rem.completed ? 'checked' : ''} 
            onchange="handleToggleReminder('${rem.id}')"
          >
          <div>
            <div style="font-size: 13px; font-weight: 600; color: ${rem.completed ? 'var(--slate-400)' : 'var(--slate-800)'}; text-decoration: ${rem.completed ? 'line-through' : 'none'};">
              ${rem.title}
            </div>
            <div style="font-size: 11px; color: var(--slate-500);">Category: ${rem.category}</div>
          </div>
        </div>
        <span class="badge ${rem.priority === 'High' ? 'badge-danger' : 'badge-neutral'}">${rem.priority}</span>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

window.handleToggleReminder = function(id) {
  const item = CancerCareStorage.toggleReminder(id);
  if (item) {
    CancerCareUI.showToast(item.completed ? 'Reminder completed' : 'Reminder pending');
    loadSummaryMetrics();
    loadRemindersList();
  }
};

/**
 * Setup quick action modal opener buttons and forms
 */
function setupQuickActionForms() {
  // Quick Action Buttons
  const btnSymptom = document.getElementById('quick-add-symptom-btn');
  if (btnSymptom) {
    btnSymptom.addEventListener('click', () => {
      document.getElementById('qs-date').value = new Date().toISOString().split('T')[0];
      CancerCareUI.openModal('modal-add-symptom');
    });
  }

  const btnApt = document.getElementById('quick-add-appointment-btn');
  if (btnApt) {
    btnApt.addEventListener('click', () => {
      document.getElementById('qa-date').value = new Date().toISOString().split('T')[0];
      CancerCareUI.openModal('modal-add-appointment');
    });
  }

  const btnMed = document.getElementById('quick-add-medication-btn');
  if (btnMed) {
    btnMed.addEventListener('click', () => {
      document.getElementById('qm-start-date').value = new Date().toISOString().split('T')[0];
      CancerCareUI.openModal('modal-add-medication');
    });
  }

  const btnReport = document.getElementById('quick-add-report-btn');
  if (btnReport) {
    btnReport.addEventListener('click', () => {
      document.getElementById('qr-date').value = new Date().toISOString().split('T')[0];
      CancerCareUI.openModal('modal-add-report');
    });
  }

  // Symptom Form Submit
  const symptomForm = document.getElementById('quick-symptom-form');
  if (symptomForm) {
    symptomForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sev = parseInt(document.getElementById('qs-severity').value, 10);
      let sevLevel = "Mild";
      if (sev >= 4 && sev <= 6) sevLevel = "Moderate";
      if (sev >= 7) sevLevel = "Severe";

      CancerCareStorage.addSymptom({
        name: document.getElementById('qs-name').value.trim(),
        severity: sev,
        severityLevel: sevLevel,
        date: document.getElementById('qs-date').value,
        notes: document.getElementById('qs-notes').value.trim()
      });

      CancerCareUI.closeModal('modal-add-symptom');
      CancerCareUI.showToast('Symptom entry logged successfully!');
      symptomForm.reset();
      loadSymptomsList();
      loadCharts();
    });
  }

  // Appointment Form Submit
  const aptForm = document.getElementById('quick-appointment-form');
  if (aptForm) {
    aptForm.addEventListener('submit', (e) => {
      e.preventDefault();
      CancerCareStorage.addAppointment({
        doctorName: document.getElementById('qa-doctor').value.trim(),
        date: document.getElementById('qa-date').value,
        time: document.getElementById('qa-time').value,
        type: document.getElementById('qa-type').value,
        location: document.getElementById('qa-location').value.trim(),
        notes: document.getElementById('qa-notes').value.trim(),
        status: 'Upcoming'
      });

      CancerCareUI.closeModal('modal-add-appointment');
      CancerCareUI.showToast('Appointment scheduled successfully!');
      aptForm.reset();
      loadSummaryMetrics();
      loadAppointmentsList();
    });
  }

  // Medication Form Submit
  const medForm = document.getElementById('quick-medication-form');
  if (medForm) {
    medForm.addEventListener('submit', (e) => {
      e.preventDefault();
      CancerCareStorage.addMedication({
        name: document.getElementById('qm-name').value.trim(),
        dosage: document.getElementById('qm-dosage').value.trim(),
        schedule: document.getElementById('qm-schedule').value.trim(),
        startDate: document.getElementById('qm-start-date').value,
        doctor: document.getElementById('qm-doctor').value.trim(),
        notes: document.getElementById('qm-notes').value.trim(),
        takenToday: false,
        lastTakenTime: ''
      });

      CancerCareUI.closeModal('modal-add-medication');
      CancerCareUI.showToast('Medication recorded successfully!');
      medForm.reset();
      loadSummaryMetrics();
      loadMedicationsList();
    });
  }

  // Report Form Submit
  const repForm = document.getElementById('quick-report-form');
  if (repForm) {
    repForm.addEventListener('submit', (e) => {
      e.preventDefault();
      CancerCareStorage.addReport({
        title: document.getElementById('qr-title').value.trim(),
        date: document.getElementById('qr-date').value,
        category: document.getElementById('qr-category').value,
        facility: document.getElementById('qr-facility').value.trim(),
        physician: document.getElementById('qr-physician').value.trim(),
        notes: document.getElementById('qr-notes').value.trim(),
        fileSimulated: `${document.getElementById('qr-title').value.trim().replace(/\s+/g, '_')}.pdf`,
        fileSize: '1.2 MB'
      });

      CancerCareUI.closeModal('modal-add-report');
      CancerCareUI.showToast('Medical report metadata recorded!');
      repForm.reset();
      loadSummaryMetrics();
    });
  }
}

/**
 * US-10: Patient Care Summary Report
 */
function setupCareSummaryReport() {
  const btn = document.getElementById('view-care-summary-btn');
  const container = document.getElementById('care-summary-content');
  if (!btn || !container) return;

  btn.addEventListener('click', () => {
    const patient = CancerCareStorage.getPatient();
    const treatment = CancerCareStorage.getTreatment();
    const appointments = CancerCareStorage.getAppointments();
    const medications = CancerCareStorage.getMedications();
    const symptoms = CancerCareStorage.getSymptoms();

    container.innerHTML = `
      <div style="font-family: inherit; font-size: 13px; line-height: 1.6;">
        <div style="border-bottom: 2px solid var(--slate-200); padding-bottom: 12px; margin-bottom: 16px;">
          <h4 style="font-size: 18px; color: var(--primary-800);">${patient.fullName} – Clinical Care Profile</h4>
          <div style="color: var(--slate-500); font-size: 12px;">ID: ${patient.id} • Generated on ${new Date().toLocaleDateString()}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; background-color: var(--slate-50); padding: 12px; border-radius: 8px;">
          <div><strong>Diagnosis:</strong> ${patient.medicalContext.cancerType}</div>
          <div><strong>Treating Oncologist:</strong> ${patient.medicalContext.treatingDoctor}</div>
          <div><strong>Emergency Contact:</strong> ${patient.emergencyContact.name} (${patient.emergencyContact.phone})</div>
          <div><strong>Treatment Phase:</strong> ${treatment.phase} (${treatment.progressPercentage}% Completed)</div>
        </div>

        <h5 style="margin-top: 14px; margin-bottom: 6px; color: var(--slate-800);">Active Prescriptions (${medications.length})</h5>
        <ul style="padding-left: 18px; color: var(--slate-700); margin-bottom: 14px;">
          ${medications.map(m => `<li><strong>${m.name}:</strong> ${m.dosage} (${m.schedule})</li>`).join('')}
        </ul>

        <h5 style="margin-top: 14px; margin-bottom: 6px; color: var(--slate-800);">Upcoming Clinical Schedule</h5>
        <ul style="padding-left: 18px; color: var(--slate-700); margin-bottom: 14px;">
          ${appointments.filter(a => a.status === 'Upcoming').map(a => `<li>${CancerCareUI.formatDate(a.date)} at ${CancerCareUI.formatTime(a.time)} - ${a.doctorName} (${a.type})</li>`).join('')}
        </ul>

        <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 10px; border-radius: 6px; font-size: 11px; color: #92400e; margin-top: 16px;">
          <strong>Educational Prototype Notice:</strong> ${CancerCareDisclaimer}
        </div>
      </div>
    `;
    CancerCareUI.openModal('modal-care-summary');
  });
}
