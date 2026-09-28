/**
 * CancerCare - Medications Controller
 * Tagline: Patient Care & Treatment Management
 */

let currentMedFilter = 'all';
let medSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  CancerCareAuth.checkAuth();
  CancerCareUI.setupModalListeners();

  loadMedicationsData();
  setupMedicationListeners();

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

function loadMedicationsData() {
  const allMeds = CancerCareStorage.getMedications();

  // Compute metrics
  const total = allMeds.length;
  const taken = allMeds.filter(m => m.takenToday).length;
  const remaining = total - taken;
  const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

  const elAdherence = document.getElementById('med-stat-adherence');
  const elTakenCount = document.getElementById('med-stat-taken-count');
  const elActiveCount = document.getElementById('med-stat-active-count');
  const elRemainingCount = document.getElementById('med-stat-remaining-count');

  if (elAdherence) elAdherence.textContent = `${adherence}%`;
  if (elTakenCount) elTakenCount.textContent = `${taken} of ${total} doses logged`;
  if (elActiveCount) elActiveCount.textContent = total;
  if (elRemainingCount) elRemainingCount.textContent = remaining;

  // Filter
  let filtered = allMeds.slice();
  if (currentMedFilter === 'pending') {
    filtered = filtered.filter(m => !m.takenToday);
  } else if (currentMedFilter === 'taken') {
    filtered = filtered.filter(m => m.takenToday);
  }

  // Search
  if (medSearchQuery.trim() !== '') {
    const q = medSearchQuery.toLowerCase();
    filtered = filtered.filter(m => 
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.dosage && m.dosage.toLowerCase().includes(q)) ||
      (m.doctor && m.doctor.toLowerCase().includes(q)) ||
      (m.schedule && m.schedule.toLowerCase().includes(q)) ||
      (m.notes && m.notes.toLowerCase().includes(q))
    );
  }

  renderMedicationsTable(filtered);
}

function renderMedicationsTable(list) {
  const tbody = document.getElementById('medications-tbody');
  const emptyState = document.getElementById('medications-empty');
  const table = document.getElementById('medications-table');
  const countText = document.getElementById('med-count-text');

  if (countText) countText.textContent = `Showing ${list.length} medication${list.length === 1 ? '' : 's'}`;

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  list.forEach(med => {
    const isTaken = med.takenToday;
    html += `
      <tr>
        <td style="text-align: center;">
          <input 
            type="checkbox" 
            style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--primary-700);" 
            ${isTaken ? 'checked' : ''} 
            onchange="handleToggleMedPage('${med.id}')"
            title="${isTaken ? 'Mark as Pending' : 'Mark as Taken'}"
          >
        </td>
        <td>
          <div style="font-weight: 600; color: ${isTaken ? 'var(--slate-500)' : 'var(--slate-900)'}; font-size: 15px; text-decoration: ${isTaken ? 'line-through' : 'none'};">
            ${med.name}
          </div>
          <div style="margin-top: 2px;">
            ${isTaken 
              ? `<span class="badge badge-success">✓ Taken ${med.lastTakenTime || 'Today'}</span>` 
              : `<span class="badge badge-warning">⏳ Pending Today</span>`}
          </div>
        </td>
        <td>
          <div style="font-size: 13px; font-weight: 600; color: var(--slate-800);">${med.dosage}</div>
        </td>
        <td>
          <span class="badge badge-neutral">${med.schedule}</span>
          <div style="font-size: 11px; color: var(--slate-500); margin-top: 4px;">Timing: ${med.timeOfDay || 'Daily'}</div>
        </td>
        <td style="font-size: 13px; color: var(--slate-700);">
          ${med.doctor || 'Oncologist'}
        </td>
        <td style="font-size: 12px; color: var(--slate-600); max-width: 240px;">
          ${med.notes || '—'}
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button type="button" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="handleEditMedication('${med.id}')" title="Edit details">✏️ Edit</button>
            <button type="button" class="btn btn-sm btn-danger-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleDeleteMedication('${med.id}')" title="Delete record">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  if (tbody) tbody.innerHTML = html;
}

function setupMedicationListeners() {
  // Open Add Modal
  const openAddBtn = document.getElementById('open-add-med-btn');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('med-id').value = '';
      document.getElementById('med-modal-title').textContent = 'Add Medication';
      document.getElementById('med-name').value = '';
      document.getElementById('med-dosage').value = '';
      document.getElementById('med-schedule').value = '';
      document.getElementById('med-timeOfDay').value = 'Morning';
      document.getElementById('med-startDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('med-doctor').value = 'Dr. Sarah Jenkins, MD';
      document.getElementById('med-notes').value = '';
      CancerCareUI.openModal('modal-medication');
    });
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.med-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('active', 'btn-primary');
      currentMedFilter = btn.getAttribute('data-filter');
      loadMedicationsData();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-med');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      medSearchQuery = e.target.value;
      loadMedicationsData();
    });
  }

  // Medication Form Submit
  const form = document.getElementById('medication-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('med-id').value;
      const data = {
        name: document.getElementById('med-name').value.trim(),
        dosage: document.getElementById('med-dosage').value.trim(),
        schedule: document.getElementById('med-schedule').value.trim(),
        timeOfDay: document.getElementById('med-timeOfDay').value,
        startDate: document.getElementById('med-startDate').value,
        doctor: document.getElementById('med-doctor').value.trim(),
        notes: document.getElementById('med-notes').value.trim()
      };

      if (id) {
        CancerCareStorage.updateMedication(id, data);
        CancerCareUI.showToast('Medication updated successfully!');
      } else {
        data.takenToday = false;
        data.lastTakenTime = '';
        CancerCareStorage.addMedication(data);
        CancerCareUI.showToast('Medication added successfully!');
      }

      CancerCareUI.closeModal('modal-medication');
      loadMedicationsData();
    });
  }
}

// Global actions
window.handleToggleMedPage = function(id) {
  const updated = CancerCareStorage.toggleMedicationTaken(id);
  if (updated) {
    CancerCareUI.showToast(updated.takenToday ? `Marked ${updated.name} as taken today.` : `Marked ${updated.name} as pending.`);
    loadMedicationsData();
  }
};

window.handleEditMedication = function(id) {
  const list = CancerCareStorage.getMedications();
  const med = list.find(m => m.id === id);
  if (!med) return;

  document.getElementById('med-id').value = med.id;
  document.getElementById('med-modal-title').textContent = 'Edit Medication';
  document.getElementById('med-name').value = med.name || '';
  document.getElementById('med-dosage').value = med.dosage || '';
  document.getElementById('med-schedule').value = med.schedule || '';
  document.getElementById('med-timeOfDay').value = med.timeOfDay || 'Morning';
  document.getElementById('med-startDate').value = med.startDate || '';
  document.getElementById('med-doctor').value = med.doctor || '';
  document.getElementById('med-notes').value = med.notes || '';

  CancerCareUI.openModal('modal-medication');
};

window.handleDeleteMedication = function(id) {
  if (confirm('Are you sure you want to delete this medication record?')) {
    CancerCareStorage.deleteMedication(id);
    CancerCareUI.showToast('Medication deleted.');
    loadMedicationsData();
  }
};
