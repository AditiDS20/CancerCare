/**
 * CancerCare - Medical Reports Controller
 * Tagline: Patient Care & Treatment Management
 */

let currentRepFilter = 'all';
let repSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  CancerCareAuth.checkAuth();
  CancerCareUI.setupModalListeners();

  loadReportsData();
  setupReportListeners();

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

function loadReportsData() {
  const allReports = CancerCareStorage.getReports();

  // Compute metrics
  const total = allReports.length;
  const imaging = allReports.filter(r => r.category === 'Diagnostic Imaging').length;
  const labs = allReports.filter(r => r.category === 'Laboratory / Blood' || r.category === 'Pathology / Biopsy').length;

  const elTotal = document.getElementById('report-stat-total');
  const elImaging = document.getElementById('report-stat-imaging');
  const elLabs = document.getElementById('report-stat-labs');

  if (elTotal) elTotal.textContent = total;
  if (elImaging) elImaging.textContent = imaging;
  if (elLabs) elLabs.textContent = labs;

  // Filter
  let filtered = allReports.slice();
  if (currentRepFilter !== 'all') {
    filtered = filtered.filter(r => r.category === currentRepFilter);
  }

  // Search
  if (repSearchQuery.trim() !== '') {
    const q = repSearchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.facility && r.facility.toLowerCase().includes(q)) ||
      (r.physician && r.physician.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q))
    );
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  renderReportsTable(filtered);
}

function renderReportsTable(list) {
  const tbody = document.getElementById('reports-tbody');
  const emptyState = document.getElementById('reports-empty');
  const table = document.getElementById('reports-table');
  const countText = document.getElementById('report-count-text');

  if (countText) countText.textContent = `Showing ${list.length} report${list.length === 1 ? '' : 's'}`;

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  list.forEach(rep => {
    let catBadge = 'badge-primary';
    if (rep.category === 'Diagnostic Imaging') catBadge = 'badge-info';
    if (rep.category === 'Laboratory / Blood') catBadge = 'badge-success';
    if (rep.category === 'Pathology / Biopsy') catBadge = 'badge-warning';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--slate-900); font-size: 14px;">${rep.title}</div>
          <div style="font-size: 11px; color: var(--slate-500); margin-top: 2px;">
            📄 ${rep.fileSimulated || 'Document.pdf'} • ${rep.fileSize || '1.0 MB'}
          </div>
        </td>
        <td>
          <div style="font-size: 13px; color: var(--slate-700); font-weight: 500;">${CancerCareUI.formatDate(rep.date)}</div>
        </td>
        <td>
          <span class="badge ${catBadge}">${rep.category}</span>
        </td>
        <td style="font-size: 13px; color: var(--slate-600);">
          ${rep.facility || 'Clinical Lab'}
        </td>
        <td style="font-size: 13px; color: var(--slate-700);">
          ${rep.physician || 'Physician'}
        </td>
        <td style="font-size: 12px; color: var(--slate-600); max-width: 250px;">
          ${rep.notes ? rep.notes.substring(0, 75) + (rep.notes.length > 75 ? '...' : '') : '—'}
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button type="button" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleViewReport('${rep.id}')" title="View details">👁️ View</button>
            <button type="button" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="handleEditReport('${rep.id}')" title="Edit metadata">✏️ Edit</button>
            <button type="button" class="btn btn-sm btn-danger-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleDeleteReport('${rep.id}')" title="Delete record">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  if (tbody) tbody.innerHTML = html;
}

function setupReportListeners() {
  // Open Add Modal
  const openAddBtn = document.getElementById('open-add-report-btn');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('rep-id').value = '';
      document.getElementById('report-modal-title').textContent = 'Record Medical Report';
      document.getElementById('rep-title').value = '';
      document.getElementById('rep-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('rep-category').value = 'Laboratory / Blood';
      document.getElementById('rep-facility').value = 'Hope Comprehensive Cancer Institute';
      document.getElementById('rep-physician').value = 'Dr. Sarah Jenkins, MD';
      document.getElementById('rep-notes').value = '';
      CancerCareUI.openModal('modal-report');
    });
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.rep-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('active', 'btn-primary');
      currentRepFilter = btn.getAttribute('data-filter');
      loadReportsData();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-report');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      repSearchQuery = e.target.value;
      loadReportsData();
    });
  }

  // Report Form Submit
  const form = document.getElementById('report-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('rep-id').value;
      const title = document.getElementById('rep-title').value.trim();

      const data = {
        title,
        date: document.getElementById('rep-date').value,
        category: document.getElementById('rep-category').value,
        facility: document.getElementById('rep-facility').value.trim(),
        physician: document.getElementById('rep-physician').value.trim(),
        notes: document.getElementById('rep-notes').value.trim(),
        fileSimulated: `${title.replace(/\s+/g, '_')}.pdf`,
        fileSize: '1.2 MB'
      };

      if (id) {
        CancerCareStorage.updateReport(id, data);
        CancerCareUI.showToast('Report metadata updated successfully!');
      } else {
        CancerCareStorage.addReport(data);
        CancerCareUI.showToast('Medical report recorded successfully!');
      }

      CancerCareUI.closeModal('modal-report');
      loadReportsData();
    });
  }
}

// Global actions
window.handleViewReport = function(id) {
  const list = CancerCareStorage.getReports();
  const rep = list.find(r => r.id === id);
  if (!rep) return;

  const titleEl = document.getElementById('view-rep-title');
  const contentEl = document.getElementById('view-rep-content');

  if (titleEl) titleEl.textContent = rep.title;
  if (contentEl) {
    contentEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:14px; font-size:14px;">
        <div style="background-color: var(--slate-50); padding: 12px; border-radius: 8px; border: 1px solid var(--slate-200);">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div><strong>Report Date:</strong> ${CancerCareUI.formatDate(rep.date)}</div>
            <div><strong>Category:</strong> ${rep.category}</div>
            <div><strong>Facility:</strong> ${rep.facility || 'Clinical Lab'}</div>
            <div><strong>Physician:</strong> ${rep.physician || 'N/A'}</div>
            <div><strong>Simulated File:</strong> <code>${rep.fileSimulated || 'document.pdf'}</code></div>
            <div><strong>File Size:</strong> ${rep.fileSize || '1.0 MB'}</div>
          </div>
        </div>

        <div>
          <h4 style="font-size: 15px; margin-bottom: 6px; color: var(--slate-900);">Clinical Summary Findings & Notes</h4>
          <div style="background-color:#ffffff; border:1px solid var(--slate-200); padding:12px; border-radius:6px; line-height: 1.6; color: var(--slate-700); font-size: 13px;">
            ${rep.notes || 'No summary notes entered.'}
          </div>
        </div>

        <div style="font-size:11px; color:var(--slate-500); border-top:1px solid var(--slate-200); padding-top:8px;">
          Note: This educational prototype tracks metadata only and does not store actual diagnostic scans or EHR binaries.
        </div>
      </div>
    `;
  }

  CancerCareUI.openModal('modal-view-report');
};

window.handleEditReport = function(id) {
  const list = CancerCareStorage.getReports();
  const rep = list.find(r => r.id === id);
  if (!rep) return;

  document.getElementById('rep-id').value = rep.id;
  document.getElementById('report-modal-title').textContent = 'Edit Medical Report';
  document.getElementById('rep-title').value = rep.title || '';
  document.getElementById('rep-date').value = rep.date || '';
  document.getElementById('rep-category').value = rep.category || 'Laboratory / Blood';
  document.getElementById('rep-facility').value = rep.facility || '';
  document.getElementById('rep-physician').value = rep.physician || '';
  document.getElementById('rep-notes').value = rep.notes || '';

  CancerCareUI.openModal('modal-report');
};

window.handleDeleteReport = function(id) {
  if (confirm('Are you sure you want to delete this report record?')) {
    CancerCareStorage.deleteReport(id);
    CancerCareUI.showToast('Report record deleted.');
    loadReportsData();
  }
};
