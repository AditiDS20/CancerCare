/**
 * CancerCare - Treatment Tracker Controller
 * Tagline: Patient Care & Treatment Management
 */

let phasesChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  CancerCareAuth.checkAuth();
  CancerCareUI.setupModalListeners();

  loadTreatmentData();
  setupTreatmentListeners();

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

function loadTreatmentData() {
  const treatment = CancerCareStorage.getTreatment();
  if (!treatment) return;

  // Hero Card Elements
  const phaseBadge = document.getElementById('disp-phase-badge');
  const phaseTitle = document.getElementById('disp-phase-title');
  const subphaseText = document.getElementById('disp-subphase-text');
  const progressNum = document.getElementById('disp-progress-num');
  const progressBar = document.getElementById('disp-progress-bar');
  const slider = document.getElementById('manual-progress-slider');
  const sliderVal = document.getElementById('slider-val-preview');

  const startDate = document.getElementById('disp-start-date');
  const nextSession = document.getElementById('disp-next-session');
  const estEnd = document.getElementById('disp-est-end');
  const careNotes = document.getElementById('disp-care-notes');

  const pct = treatment.progressPercentage || 0;

  if (phaseBadge) phaseBadge.textContent = treatment.phase ? `Phase: ${treatment.phase}` : 'Active Protocol';
  if (phaseTitle) phaseTitle.textContent = treatment.phase || 'Treatment Protocol';
  if (subphaseText) subphaseText.textContent = treatment.subPhase || 'Active Care Regimen';
  if (progressNum) progressNum.textContent = `${pct}%`;
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (slider) slider.value = pct;
  if (sliderVal) sliderVal.textContent = `${pct}%`;

  if (startDate) startDate.textContent = CancerCareUI.formatDate(treatment.startDate);
  if (estEnd) estEnd.textContent = CancerCareUI.formatDate(treatment.estimatedEnd);

  if (nextSession) {
    if (treatment.nextScheduledSession) {
      const d = new Date(treatment.nextScheduledSession);
      nextSession.textContent = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      nextSession.textContent = 'None Scheduled';
    }
  }

  if (careNotes) {
    careNotes.textContent = treatment.oncologistNotes || 'No protocol notes entered.';
  }

  renderMilestones(treatment.milestones || []);
  renderPhasesChart(treatment.milestones || []);
}

function renderMilestones(milestones) {
  const tbody = document.getElementById('milestones-tbody');
  const countBadge = document.getElementById('milestones-count-badge');
  if (countBadge) countBadge.textContent = `${milestones.length} Milestones Recorded`;

  if (!tbody) return;

  if (milestones.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 24px; color: var(--slate-500);">
          No treatment milestones recorded. Click "+ Add Milestone" to begin tracking.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  milestones.forEach((ms, idx) => {
    let badgeClass = 'badge-neutral';
    if (ms.status === 'Completed') badgeClass = 'badge-success';
    if (ms.status === 'In Progress') badgeClass = 'badge-info';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--slate-900); font-size: 14px;">
            ${idx + 1}. ${ms.title}
          </div>
        </td>
        <td>
          <div style="font-size: 13px; color: var(--slate-600);">${CancerCareUI.formatDate(ms.date)}</div>
        </td>
        <td>
          <span class="badge ${badgeClass}">${ms.status}</span>
        </td>
        <td style="font-size: 12px; color: var(--slate-600); max-width: 280px;">
          ${ms.notes || '—'}
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            ${ms.status !== 'Completed' 
              ? `<button type="button" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleMarkMilestoneCompleted('${ms.id}')">✓ Mark Done</button>` 
              : ''}
            <button type="button" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="handleEditMilestone('${ms.id}')">✏️ Edit</button>
            <button type="button" class="btn btn-sm btn-danger-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleDeleteMilestone('${ms.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function renderPhasesChart(milestones) {
  if (typeof Chart === 'undefined') return;

  const ctx = document.getElementById('treatmentPhasesChart');
  if (!ctx) return;

  const completed = milestones.filter(m => m.status === 'Completed').length;
  const inProgress = milestones.filter(m => m.status === 'In Progress').length;
  const upcoming = milestones.filter(m => m.status === 'Upcoming').length;

  if (phasesChartInstance) {
    phasesChartInstance.destroy();
  }

  phasesChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Completed', 'In Progress', 'Upcoming'],
      datasets: [{
        label: 'Milestones Count',
        data: [completed, inProgress, upcoming],
        backgroundColor: ['#10b981', '#0284c7', '#94a3b8'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

function setupTreatmentListeners() {
  // Slider Real-Time Label
  const slider = document.getElementById('manual-progress-slider');
  const sliderVal = document.getElementById('slider-val-preview');
  if (slider && sliderVal) {
    slider.addEventListener('input', (e) => {
      sliderVal.textContent = `${e.target.value}%`;
    });
  }

  // Save Progress Slider
  const saveSliderBtn = document.getElementById('save-slider-btn');
  if (saveSliderBtn && slider) {
    saveSliderBtn.addEventListener('click', () => {
      const treatment = CancerCareStorage.getTreatment();
      treatment.progressPercentage = parseInt(slider.value, 10);
      CancerCareStorage.saveTreatment(treatment);
      CancerCareUI.showToast(`Treatment progress updated to ${slider.value}%`);
      loadTreatmentData();
    });
  }

  // Open Edit Phase Modal
  const openEditPhaseBtn = document.getElementById('open-edit-phase-btn');
  const editCareNotesBtn = document.getElementById('edit-care-notes-btn');
  [openEditPhaseBtn, editCareNotesBtn].forEach(b => {
    if (b) {
      b.addEventListener('click', () => {
        const treatment = CancerCareStorage.getTreatment();
        document.getElementById('edit-phase-title').value = treatment.phase || '';
        document.getElementById('edit-subphase').value = treatment.subPhase || '';
        document.getElementById('edit-start-date').value = treatment.startDate || '';
        document.getElementById('edit-est-end').value = treatment.estimatedEnd || '';
        document.getElementById('edit-next-session').value = treatment.nextScheduledSession || '';
        document.getElementById('edit-care-notes').value = treatment.oncologistNotes || '';
        CancerCareUI.openModal('modal-edit-treatment');
      });
    }
  });

  // Save Edit Phase Form
  const editForm = document.getElementById('treatment-edit-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const treatment = CancerCareStorage.getTreatment();
      treatment.phase = document.getElementById('edit-phase-title').value.trim();
      treatment.subPhase = document.getElementById('edit-subphase').value.trim();
      treatment.startDate = document.getElementById('edit-start-date').value;
      treatment.estimatedEnd = document.getElementById('edit-est-end').value;
      treatment.nextScheduledSession = document.getElementById('edit-next-session').value;
      treatment.oncologistNotes = document.getElementById('edit-care-notes').value.trim();

      CancerCareStorage.saveTreatment(treatment);
      CancerCareUI.closeModal('modal-edit-treatment');
      CancerCareUI.showToast('Treatment details updated successfully!');
      loadTreatmentData();
    });
  }

  // Open Add Milestone Modal
  const openAddMsBtn = document.getElementById('open-add-milestone-btn');
  if (openAddMsBtn) {
    openAddMsBtn.addEventListener('click', () => {
      document.getElementById('ms-id').value = '';
      document.getElementById('milestone-modal-title').textContent = 'Add Care Milestone';
      document.getElementById('ms-title').value = '';
      document.getElementById('ms-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('ms-status').value = 'Upcoming';
      document.getElementById('ms-notes').value = '';
      CancerCareUI.openModal('modal-milestone');
    });
  }

  // Save Milestone Form
  const msForm = document.getElementById('milestone-form');
  if (msForm) {
    msForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('ms-id').value;
      const treatment = CancerCareStorage.getTreatment();
      if (!treatment.milestones) treatment.milestones = [];

      const milestoneData = {
        title: document.getElementById('ms-title').value.trim(),
        date: document.getElementById('ms-date').value,
        status: document.getElementById('ms-status').value,
        notes: document.getElementById('ms-notes').value.trim()
      };

      if (id) {
        const idx = treatment.milestones.findIndex(m => m.id === id);
        if (idx !== -1) {
          treatment.milestones[idx] = { ...treatment.milestones[idx], ...milestoneData };
          CancerCareUI.showToast('Milestone updated successfully!');
        }
      } else {
        milestoneData.id = 'ms-' + Date.now();
        treatment.milestones.push(milestoneData);
        CancerCareUI.showToast('Milestone added successfully!');
      }

      CancerCareStorage.saveTreatment(treatment);
      CancerCareUI.closeModal('modal-milestone');
      loadTreatmentData();
    });
  }
}

// Global actions
window.handleEditMilestone = function(id) {
  const treatment = CancerCareStorage.getTreatment();
  const ms = (treatment.milestones || []).find(m => m.id === id);
  if (!ms) return;

  document.getElementById('ms-id').value = ms.id;
  document.getElementById('milestone-modal-title').textContent = 'Edit Care Milestone';
  document.getElementById('ms-title').value = ms.title || '';
  document.getElementById('ms-date').value = ms.date || '';
  document.getElementById('ms-status').value = ms.status || 'Upcoming';
  document.getElementById('ms-notes').value = ms.notes || '';

  CancerCareUI.openModal('modal-milestone');
};

window.handleDeleteMilestone = function(id) {
  if (confirm('Delete this milestone record?')) {
    const treatment = CancerCareStorage.getTreatment();
    treatment.milestones = (treatment.milestones || []).filter(m => m.id !== id);
    CancerCareStorage.saveTreatment(treatment);
    CancerCareUI.showToast('Milestone deleted.');
    loadTreatmentData();
  }
};

window.handleMarkMilestoneCompleted = function(id) {
  const treatment = CancerCareStorage.getTreatment();
  const ms = (treatment.milestones || []).find(m => m.id === id);
  if (ms) {
    ms.status = 'Completed';
    CancerCareStorage.saveTreatment(treatment);
    CancerCareUI.showToast(`Marked "${ms.title}" as Completed!`);
    loadTreatmentData();
  }
};
