/**
 * CancerCare - Patient Profile Controller
 * Tagline: Patient Care & Treatment Management
 */

document.addEventListener('DOMContentLoaded', () => {
  CancerCareAuth.checkAuth();
  CancerCareUI.setupModalListeners();

  loadProfileForm();
  setupProfileListeners();

  // Reset demo button in sidebar
  const resetBtn = document.getElementById('reset-demo-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all records to the original demo data?')) {
        CancerCareStorage.resetAllData(true);
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      CancerCareAuth.logout();
    });
  }
});

function loadProfileForm() {
  const patient = CancerCareStorage.getPatient();
  if (!patient) return;

  // Header banner info
  const nameHeader = document.getElementById('header-patient-name');
  const idHeader = document.getElementById('header-patient-id');
  const summaryHeader = document.getElementById('header-patient-summary');
  const avatarLarge = document.getElementById('profile-avatar-large');
  const sidebarAvatar = document.getElementById('sidebar-user-avatar');
  const sidebarName = document.getElementById('sidebar-user-name');

  if (nameHeader) nameHeader.textContent = patient.fullName || 'Patient Profile';
  if (idHeader) idHeader.textContent = `ID: ${patient.id || 'P-10492'}`;
  if (summaryHeader) {
    summaryHeader.textContent = `${patient.age || '52'} Years • ${patient.gender || 'Female'} • Blood: ${patient.bloodGroup || 'A+'} • ${patient.address || 'Springfield, OR'}`;
  }

  const initials = getInitials(patient.fullName || 'EV');
  if (avatarLarge) avatarLarge.textContent = initials;
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (sidebarName) sidebarName.textContent = patient.fullName;

  // Form Fields - Demographics
  setVal('prof-fullName', patient.fullName);
  setVal('prof-age', patient.age);
  setVal('prof-dob', patient.dob);
  setVal('prof-gender', patient.gender);
  setVal('prof-bloodGroup', patient.bloodGroup);
  setVal('prof-phone', patient.phone);
  setVal('prof-email', patient.email);
  setVal('prof-address', patient.address);

  // Form Fields - Medical Context
  const med = patient.medicalContext || {};
  setVal('prof-cancerType', med.cancerType);
  setVal('prof-diagnosisDate', med.diagnosisDate);
  setVal('prof-treatingDoctor', med.treatingDoctor);
  setVal('prof-hospital', med.hospital);
  setVal('prof-careNotes', med.careTeamNotes);

  // Form Fields - Emergency Contact
  const emerg = patient.emergencyContact || {};
  setVal('prof-emergName', emerg.name);
  setVal('prof-emergRel', emerg.relationship);
  setVal('prof-emergPhone', emerg.phone);
}

function setupProfileListeners() {
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const existing = CancerCareStorage.getPatient();
      const updated = {
        ...existing,
        fullName: document.getElementById('prof-fullName').value.trim(),
        age: parseInt(document.getElementById('prof-age').value, 10) || 0,
        dob: document.getElementById('prof-dob').value,
        gender: document.getElementById('prof-gender').value,
        bloodGroup: document.getElementById('prof-bloodGroup').value,
        phone: document.getElementById('prof-phone').value.trim(),
        email: document.getElementById('prof-email').value.trim(),
        address: document.getElementById('prof-address').value.trim(),
        emergencyContact: {
          name: document.getElementById('prof-emergName').value.trim(),
          relationship: document.getElementById('prof-emergRel').value.trim(),
          phone: document.getElementById('prof-emergPhone').value.trim()
        },
        medicalContext: {
          cancerType: document.getElementById('prof-cancerType').value.trim(),
          diagnosisDate: document.getElementById('prof-diagnosisDate').value,
          treatingDoctor: document.getElementById('prof-treatingDoctor').value.trim(),
          hospital: document.getElementById('prof-hospital').value.trim(),
          careTeamNotes: document.getElementById('prof-careNotes').value.trim()
        }
      };

      CancerCareStorage.savePatient(updated);
      CancerCareUI.showToast('Patient profile updated successfully in localStorage!');
      loadProfileForm();
    });
  }

  // Revert changes
  const resetBtn = document.getElementById('reset-profile-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  [resetBtn, cancelBtn].forEach(b => {
    if (b) {
      b.addEventListener('click', () => {
        loadProfileForm();
        CancerCareUI.showToast('Form reset to stored profile data.', 'info');
      });
    }
  });

  // Reload Eleanor Vance demo
  const reloadDemoBtn = document.getElementById('reload-demo-btn');
  if (reloadDemoBtn) {
    reloadDemoBtn.addEventListener('click', () => {
      if (confirm('Reset Eleanor Vance profile to initial demo values?')) {
        CancerCareStorage.resetAllData(true);
      }
    });
  }

  // Export JSON Backup
  const exportBtn = document.getElementById('export-json-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const allData = {
        exportDate: new Date().toISOString(),
        patient: CancerCareStorage.getPatient(),
        treatment: CancerCareStorage.getTreatment(),
        appointments: CancerCareStorage.getAppointments(),
        medications: CancerCareStorage.getMedications(),
        symptoms: CancerCareStorage.getSymptoms(),
        reports: CancerCareStorage.getReports(),
        reminders: CancerCareStorage.getReminders()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cancercare_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      CancerCareUI.showToast('Data exported successfully as JSON file!');
    });
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val !== undefined && val !== null ? val : '';
}

function getInitials(name) {
  if (!name) return 'PT';
  const parts = name.trim().split(' ');
  return parts.length > 1 
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
}
