/**
 * CancerCare - Symptom Journal Controller
 * Tagline: Patient Care & Treatment Management
 */

let currentSymFilter = 'all';
let symSearchQuery = '';
let journalChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  CancerCareAuth.checkAuth();
  CancerCareUI.setupModalListeners();

  loadSymptomsData();
  setupSymptomListeners();

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

function loadSymptomsData() {
  const allSymptoms = CancerCareStorage.getSymptoms();

  // Filter
  let filtered = allSymptoms.slice();
  if (currentSymFilter === 'Mild') {
    filtered = filtered.filter(s => s.severity >= 1 && s.severity <= 3);
  } else if (currentSymFilter === 'Moderate') {
    filtered = filtered.filter(s => s.severity >= 4 && s.severity <= 6);
  } else if (currentSymFilter === 'Severe') {
    filtered = filtered.filter(s => s.severity >= 7);
  }

  // Search
  if (symSearchQuery.trim() !== '') {
    const q = symSearchQuery.toLowerCase();
    filtered = filtered.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      (s.triggers && s.triggers.toLowerCase().includes(q))
    );
  }

  // Render Table & Chart
  renderSymptomsTable(filtered);
  renderSymptomChart(allSymptoms);
}

function renderSymptomsTable(list) {
  const tbody = document.getElementById('symptoms-tbody');
  const emptyState = document.getElementById('symptoms-empty');
  const table = document.getElementById('symptoms-table');
  const countText = document.getElementById('symptom-count-text');

  if (countText) countText.textContent = `Showing ${list.length} symptom entr${list.length === 1 ? 'y' : 'ies'}`;

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  list.forEach(sym => {
    let sevBadge = 'severity-mild';
    let sevText = 'Mild';
    if (sym.severity >= 4 && sym.severity <= 6) {
      sevBadge = 'severity-moderate';
      sevText = 'Moderate';
    } else if (sym.severity >= 7) {
      sevBadge = 'severity-severe';
      sevText = 'Severe';
    }

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--slate-900); font-size: 14px;">${CancerCareUI.formatDate(sym.date)}</div>
          <div style="font-size: 12px; color: var(--slate-500);">${CancerCareUI.formatTime(sym.time)}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--slate-800); font-size: 15px;">${sym.name}</div>
        </td>
        <td>
          <span class="badge ${sevBadge}">
            ${sym.severity} / 10 • ${sevText}
          </span>
        </td>
        <td style="font-size: 13px; color: var(--slate-600);">
          ${sym.triggers || '—'}
        </td>
        <td style="font-size: 12px; color: var(--slate-600); max-width: 280px;">
          ${sym.notes || '—'}
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button type="button" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="handleEditSymptom('${sym.id}')" title="Edit entry">✏️ Edit</button>
            <button type="button" class="btn btn-sm btn-danger-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleDeleteSymptom('${sym.id}')" title="Delete entry">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  if (tbody) tbody.innerHTML = html;
}

function renderSymptomChart(symptoms) {
  if (typeof Chart === 'undefined') return;

  const ctx = document.getElementById('symptomJournalChart');
  if (!ctx) return;

  const sorted = symptoms.slice().reverse();
  const labels = sorted.map(s => CancerCareUI.formatDate(s.date));
  const data = sorted.map(s => s.severity);
  const names = sorted.map(s => s.name);

  if (journalChartInstance) {
    journalChartInstance.destroy();
  }

  journalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['No Data'],
      datasets: [{
        label: 'Reported Severity',
        data: data.length ? data : [0],
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#0f766e',
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function(items) {
              const idx = items[0].dataIndex;
              return `${labels[idx]} – ${names[idx] || 'Symptom'}`;
            },
            label: function(item) {
              return `Severity: ${item.raw}/10`;
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

function setupSymptomListeners() {
  // Open Add Modal
  const openAddBtn = document.getElementById('open-add-symptom-btn');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('sym-id').value = '';
      document.getElementById('symptom-modal-title').textContent = 'Log New Symptom';
      document.getElementById('sym-name').value = '';
      document.getElementById('sym-severity').value = '3';
      document.getElementById('sym-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('sym-time').value = '12:00';
      document.getElementById('sym-triggers').value = '';
      document.getElementById('sym-notes').value = '';
      CancerCareUI.openModal('modal-symptom');
    });
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.sym-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('active', 'btn-primary');
      currentSymFilter = btn.getAttribute('data-filter');
      loadSymptomsData();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-symptom');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      symSearchQuery = e.target.value;
      loadSymptomsData();
    });
  }

  // Symptom Form Submit
  const form = document.getElementById('symptom-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('sym-id').value;
      const sev = parseInt(document.getElementById('sym-severity').value, 10);
      let sevLevel = "Mild";
      if (sev >= 4 && sev <= 6) sevLevel = "Moderate";
      if (sev >= 7) sevLevel = "Severe";

      const data = {
        name: document.getElementById('sym-name').value.trim(),
        severity: sev,
        severityLevel: sevLevel,
        date: document.getElementById('sym-date').value,
        time: document.getElementById('sym-time').value,
        triggers: document.getElementById('sym-triggers').value.trim(),
        notes: document.getElementById('sym-notes').value.trim()
      };

      if (id) {
        CancerCareStorage.updateSymptom(id, data);
        CancerCareUI.showToast('Symptom entry updated successfully!');
      } else {
        CancerCareStorage.addSymptom(data);
        CancerCareUI.showToast('Symptom entry logged successfully!');
      }

      CancerCareUI.closeModal('modal-symptom');
      loadSymptomsData();
    });
  }
}

// Global actions
window.handleEditSymptom = function(id) {
  const list = CancerCareStorage.getSymptoms();
  const sym = list.find(s => s.id === id);
  if (!sym) return;

  document.getElementById('sym-id').value = sym.id;
  document.getElementById('symptom-modal-title').textContent = 'Edit Symptom Entry';
  document.getElementById('sym-name').value = sym.name || '';
  document.getElementById('sym-severity').value = sym.severity || '3';
  document.getElementById('sym-date').value = sym.date || '';
  document.getElementById('sym-time').value = sym.time || '12:00';
  document.getElementById('sym-triggers').value = sym.triggers || '';
  document.getElementById('sym-notes').value = sym.notes || '';

  CancerCareUI.openModal('modal-symptom');
};

window.handleDeleteSymptom = function(id) {
  if (confirm('Are you sure you want to delete this symptom entry?')) {
    CancerCareStorage.deleteSymptom(id);
    CancerCareUI.showToast('Symptom entry deleted.');
    loadSymptomsData();
  }
};
