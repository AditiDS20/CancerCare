/**
 * CancerCare - Reminders Controller
 * Tagline: Patient Care & Treatment Management
 */

let currentRemFilter = 'all';
let remSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  CancerCareAuth.checkAuth();
  CancerCareUI.setupModalListeners();

  loadRemindersData();
  setupReminderListeners();

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

function loadRemindersData() {
  const allReminders = CancerCareStorage.getReminders();

  // Compute metrics
  const pending = allReminders.filter(r => !r.completed).length;
  const completed = allReminders.filter(r => r.completed).length;
  const high = allReminders.filter(r => r.priority === 'High' && !r.completed).length;

  const elPending = document.getElementById('rem-stat-pending');
  const elCompleted = document.getElementById('rem-stat-completed');
  const elHigh = document.getElementById('rem-stat-high');

  if (elPending) elPending.textContent = pending;
  if (elCompleted) elCompleted.textContent = completed;
  if (elHigh) elHigh.textContent = high;

  // Filter
  let filtered = allReminders.slice();
  if (currentRemFilter === 'pending') {
    filtered = filtered.filter(r => !r.completed);
  } else if (currentRemFilter === 'completed') {
    filtered = filtered.filter(r => r.completed);
  } else if (currentRemFilter !== 'all') {
    filtered = filtered.filter(r => r.category === currentRemFilter);
  }

  // Search
  if (remSearchQuery.trim() !== '') {
    const q = remSearchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  }

  // Sort: pending first, then by date ascending
  filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDateTime) - new Date(b.dueDateTime);
  });

  renderRemindersTable(filtered);
}

function renderRemindersTable(list) {
  const tbody = document.getElementById('reminders-tbody');
  const emptyState = document.getElementById('reminders-empty');
  const table = document.getElementById('reminders-table');
  const countText = document.getElementById('rem-count-text');

  if (countText) countText.textContent = `Showing ${list.length} reminder${list.length === 1 ? '' : 's'}`;

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  list.forEach(rem => {
    const isDone = rem.completed;
    let priorityBadge = 'badge-neutral';
    if (rem.priority === 'High') priorityBadge = 'badge-danger';
    if (rem.priority === 'Medium') priorityBadge = 'badge-warning';

    let dateFormatted = 'N/A';
    if (rem.dueDateTime) {
      const d = new Date(rem.dueDateTime);
      dateFormatted = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    html += `
      <tr>
        <td style="text-align: center;">
          <input 
            type="checkbox" 
            style="width: 19px; height: 19px; cursor: pointer; accent-color: var(--primary-700);" 
            ${isDone ? 'checked' : ''} 
            onchange="handleToggleRemPage('${rem.id}')"
            title="${isDone ? 'Mark as Pending' : 'Mark as Completed'}"
          >
        </td>
        <td>
          <div style="font-weight: 600; font-size: 14px; color: ${isDone ? 'var(--slate-400)' : 'var(--slate-900)'}; text-decoration: ${isDone ? 'line-through' : 'none'};">
            ${rem.title}
          </div>
          <div style="margin-top: 3px;">
            ${isDone ? `<span class="badge badge-success" style="font-size: 10px;">✓ Done</span>` : `<span class="badge badge-neutral" style="font-size: 10px;">⏳ Pending</span>`}
          </div>
        </td>
        <td>
          <span class="badge badge-primary">${rem.category}</span>
        </td>
        <td style="font-size: 13px; color: var(--slate-700);">
          ${dateFormatted}
        </td>
        <td>
          <span class="badge ${priorityBadge}">${rem.priority}</span>
        </td>
        <td style="font-size: 12px; color: var(--slate-600); max-width: 260px;">
          ${rem.notes || '—'}
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button type="button" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="handleEditReminder('${rem.id}')" title="Edit reminder">✏️ Edit</button>
            <button type="button" class="btn btn-sm btn-danger-outline" style="padding: 4px 8px; font-size: 11px;" onclick="handleDeleteReminder('${rem.id}')" title="Delete record">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  if (tbody) tbody.innerHTML = html;
}

function setupReminderListeners() {
  // Open Add Modal
  const openAddBtn = document.getElementById('open-add-reminder-btn');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('rem-id').value = '';
      document.getElementById('rem-modal-title').textContent = 'Create Reminder';
      document.getElementById('rem-title').value = '';
      document.getElementById('rem-category').value = 'Treatment';
      document.getElementById('rem-priority').value = 'Medium';

      const now = new Date();
      now.setHours(now.getHours() + 2);
      const isoLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      document.getElementById('rem-datetime').value = isoLocal;

      document.getElementById('rem-notes').value = '';
      CancerCareUI.openModal('modal-reminder');
    });
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.rem-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('active', 'btn-primary');
      currentRemFilter = btn.getAttribute('data-filter');
      loadRemindersData();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-reminder');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      remSearchQuery = e.target.value;
      loadRemindersData();
    });
  }

  // Reminder Form Submit
  const form = document.getElementById('reminder-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('rem-id').value;

      const data = {
        title: document.getElementById('rem-title').value.trim(),
        category: document.getElementById('rem-category').value,
        priority: document.getElementById('rem-priority').value,
        dueDateTime: document.getElementById('rem-datetime').value,
        notes: document.getElementById('rem-notes').value.trim()
      };

      if (id) {
        CancerCareStorage.updateReminder(id, data);
        CancerCareUI.showToast('Reminder updated successfully!');
      } else {
        data.completed = false;
        CancerCareStorage.addReminder(data);
        CancerCareUI.showToast('Reminder created successfully!');
      }

      CancerCareUI.closeModal('modal-reminder');
      loadRemindersData();
    });
  }
}

// Global actions
window.handleToggleRemPage = function(id) {
  const updated = CancerCareStorage.toggleReminder(id);
  if (updated) {
    CancerCareUI.showToast(updated.completed ? `Marked "${updated.title}" as completed.` : `Marked "${updated.title}" as pending.`);
    loadRemindersData();
  }
};

window.handleEditReminder = function(id) {
  const list = CancerCareStorage.getReminders();
  const rem = list.find(r => r.id === id);
  if (!rem) return;

  document.getElementById('rem-id').value = rem.id;
  document.getElementById('rem-modal-title').textContent = 'Edit Reminder';
  document.getElementById('rem-title').value = rem.title || '';
  document.getElementById('rem-category').value = rem.category || 'Treatment';
  document.getElementById('rem-priority').value = rem.priority || 'Medium';
  document.getElementById('rem-datetime').value = rem.dueDateTime || '';
  document.getElementById('rem-notes').value = rem.notes || '';

  CancerCareUI.openModal('modal-reminder');
};

window.handleDeleteReminder = function(id) {
  if (confirm('Are you sure you want to delete this reminder?')) {
    CancerCareStorage.deleteReminder(id);
    CancerCareUI.showToast('Reminder deleted.');
    loadRemindersData();
  }
};
