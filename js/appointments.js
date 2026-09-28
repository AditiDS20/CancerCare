/**
 * CancerCare - Appointments Controller
 * Tagline: Patient Care & Treatment Management
 */

let currentFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  CancerCareAuth.checkAuth();
  CancerCareUI.setupModalListeners();

  loadAppointmentsData();
  setupAppointmentListeners();

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

function loadAppointmentsData() {
  const allAppointments = CancerCareStorage.getAppointments();

  // Update metric counters
  const upcomingCount = allAppointments.filter(a => a.status === 'Upcoming').length;
  const completedCount = allAppointments.filter(a => a.status === 'Completed').length;
  const totalCount = allAppointments.length;

  const elUpcoming = document.getElementById('count-upcoming');
  const elCompleted = document.getElementById('count-completed');
  const elTotal = document.getElementById('count-total');

  if (elUpcoming) elUpcoming.textContent = upcomingCount;
  if (elCompleted) elCompleted.textContent = completedCount;
  if (elTotal) elTotal.textContent = totalCount;

  // Filter & Search
  let filtered = allAppointments.slice();

  if (currentFilter !== 'all') {
    filtered = filtered.filter(a => a.status.toLowerCase() === currentFilter.toLowerCase());
  }

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(a => 
      (a.doctorName && a.doctorName.toLowerCase().includes(q)) ||
      (a.department && a.department.toLowerCase().includes(q)) ||
      (a.type && a.type.toLowerCase().includes(q)) ||
      (a.location && a.location.toLowerCase().includes(q)) ||
      (a.notes && a.notes.toLowerCase().includes(q))
    );
  }

  // Sort upcoming first, by date ascending
  filtered.sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

  renderAppointmentsTable(filtered);
}

function renderAppointmentsTable(list) {
  const tbody = document.getElementById('appointments-tbody');
  const emptyState = document.getElementById('appointments-empty');
  const table = document.getElementById('appointments-table');
  const countText = document.getElementById('showing-count-text');

  if (countText) countText.textContent = `Showing ${list.length} appointment${list.length === 1 ? '' : 's'}`;

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  list.forEach(apt => {
    let badgeClass = 'badge-info';
    if (apt.status === 'Completed') badgeClass = 'badge-success';
    if (apt.status === 'Cancelled') badgeClass = 'badge-danger';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--slate-900);">${CancerCareUI.formatDate(apt.date)}</div>
          <div style="font-size: 12px; color: var(--slate-500);">${CancerCareUI.formatTime(apt.time)}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--slate-800);">${apt.doctorName}</div>
          <div style="font-size: 12px; color: var(--slate-500);">${apt.department || 'Oncology'}</div>
        </td>
        <td>
          <span class="badge badge-neutral">${apt.type}</span>
        </td>
        <td style="font-size: 13px; color: var(--slate-600);">
          ${apt.location || 'Clinic'}
        </td>
        <td style="font-size: 12px; color: var(--slate-600); max-width: 250px;">
          ${apt.notes || '—'}
        </td>
        <td>
          <span class="badge ${badgeClass}">${apt.status}</span>
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            ${apt.status === 'Upcoming' 
              ? `<button type="button" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleMarkCompleted('${apt.id}')" title="Mark visit as completed">✓ Done</button>` 
              : ''}
            <button type="button" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="handleEditAppointment('${apt.id}')" title="Edit appointment details">✏️ Edit</button>
            <button type="button" class="btn btn-sm btn-danger-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleDeleteAppointment('${apt.id}')" title="Delete record">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  if (tbody) tbody.innerHTML = html;
}

function setupAppointmentListeners() {
  // Open Add Modal
  const openAddBtn = document.getElementById('open-add-apt-btn');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('apt-id').value = '';
      document.getElementById('apt-modal-title').textContent = 'Schedule New Appointment';
      document.getElementById('apt-doctor').value = '';
      document.getElementById('apt-department').value = 'Medical Oncology';
      document.getElementById('apt-type').value = 'Consultation';
      document.getElementById('apt-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('apt-time').value = '09:00';
      document.getElementById('apt-location').value = 'Hope Comprehensive Cancer Institute';
      document.getElementById('apt-status').value = 'Upcoming';
      document.getElementById('apt-notes').value = '';
      CancerCareUI.openModal('modal-appointment');
    });
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('active', 'btn-primary');
      currentFilter = btn.getAttribute('data-filter');
      loadAppointmentsData();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-apt');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      loadAppointmentsData();
    });
  }

  // Appointment Form Submit
  const form = document.getElementById('appointment-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('apt-id').value;
      const data = {
        doctorName: document.getElementById('apt-doctor').value.trim(),
        department: document.getElementById('apt-department').value.trim(),
        type: document.getElementById('apt-type').value,
        date: document.getElementById('apt-date').value,
        time: document.getElementById('apt-time').value,
        location: document.getElementById('apt-location').value.trim(),
        status: document.getElementById('apt-status').value,
        notes: document.getElementById('apt-notes').value.trim()
      };

      if (id) {
        CancerCareStorage.updateAppointment(id, data);
        CancerCareUI.showToast('Appointment updated successfully!');
      } else {
        CancerCareStorage.addAppointment(data);
        CancerCareUI.showToast('Appointment scheduled successfully!');
      }

      CancerCareUI.closeModal('modal-appointment');
      loadAppointmentsData();
    });
  }
}

// Global actions called from inline buttons
window.handleEditAppointment = function(id) {
  const list = CancerCareStorage.getAppointments();
  const apt = list.find(a => a.id === id);
  if (!apt) return;

  document.getElementById('apt-id').value = apt.id;
  document.getElementById('apt-modal-title').textContent = 'Edit Appointment';
  document.getElementById('apt-doctor').value = apt.doctorName || '';
  document.getElementById('apt-department').value = apt.department || '';
  document.getElementById('apt-type').value = apt.type || 'Consultation';
  document.getElementById('apt-date').value = apt.date || '';
  document.getElementById('apt-time').value = apt.time || '09:00';
  document.getElementById('apt-location').value = apt.location || '';
  document.getElementById('apt-status').value = apt.status || 'Upcoming';
  document.getElementById('apt-notes').value = apt.notes || '';

  CancerCareUI.openModal('modal-appointment');
};

window.handleDeleteAppointment = function(id) {
  if (confirm('Are you sure you want to delete this appointment?')) {
    CancerCareStorage.deleteAppointment(id);
    CancerCareUI.showToast('Appointment deleted.');
    loadAppointmentsData();
  }
};

window.handleMarkCompleted = function(id) {
  CancerCareStorage.updateAppointment(id, { status: 'Completed' });
  CancerCareUI.showToast('Appointment marked as Completed.');
  loadAppointmentsData();
};
