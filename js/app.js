// Main Application Controller for Shravani's Internship Application Tracker

const STORAGE_KEY_APPS = 'shravani_intern_apps_v1';
const STORAGE_KEY_THEME = 'shravani_intern_theme_v1';
const STORAGE_KEY_SETTINGS = 'shravani_intern_settings_v1';

class AppState {
  constructor() {
    this.applications = this.loadApplications();
    this.currentTab = 'applications'; // 'applications', 'ai-email'
    this.theme = this.loadTheme();
    this.filterPossibility = 'all'; // 'all', 'high', 'medium', 'low'
    this.filterStatus = 'all'; // 'all', 'applied', 'interviewing', 'offered', 'rejected'
    this.searchQuery = '';
    this.sortBy = 'time_newest'; // 'time_newest', 'time_oldest', 'possibility_high', 'possibility_low', 'company_asc'
    this.editingAppId = null;
    this.settings = this.loadSettings();
  }

  loadApplications() {
    const saved = localStorage.getItem(STORAGE_KEY_APPS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure no dummy/sample apps remain
        const cleaned = parsed.filter(a => !['app-1', 'app-2', 'app-3', 'app-4', 'app-5'].includes(a.id));
        localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(cleaned));
        return cleaned;
      } catch (e) {
        console.error('Failed to parse saved applications', e);
      }
    }
    // Start completely clean with zero dummy data
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify([]));
    return [];
  }

  saveApplications() {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(this.applications));
  }

  loadTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  saveTheme(theme) {
    this.theme = theme;
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { groqApiKey: GROQ_CONFIG.apiKey };
  }

  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
  }
}

const state = new AppState();

// Utility: Format relative time with days, hours, and minutes
function formatTimeSince(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now - date;

  if (isNaN(date.getTime())) return "Unknown date";
  if (diffMs < 0) return "Scheduled for future";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;

  if (totalMinutes < 1) {
    return "Applied just now";
  }

  if (totalHours < 1) {
    return `Applied ${totalMinutes}m ago`;
  }

  if (totalDays === 0) {
    if (remainingMinutes > 0) {
      return `Applied ${totalHours}h ${remainingMinutes}m ago`;
    }
    return `Applied ${totalHours}h ago`;
  }

  if (totalDays === 1) {
    if (remainingHours > 0) {
      return `Applied 1d ${remainingHours}h ago`;
    }
    return `Applied 1 day ago`;
  }

  // Multi-day
  if (remainingHours > 0) {
    return `Applied ${totalDays}d ${remainingHours}h ago`;
  }
  return `Applied ${totalDays} days ago`;
}

// Utility: Format clean date stamp
function formatExactDate(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Toast notification helper without emojis
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-in`;
  
  const iconSvg = type === 'success' 
    ? '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    : type === 'error'
    ? '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    : '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-msg">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// UI Renderers
function renderApplicationsList() {
  const listEl = document.getElementById('applications-list');
  const countBadge = document.getElementById('applications-count');
  const emptyState = document.getElementById('empty-state');
  
  if (!listEl) return;

  // Filter & Search
  let filtered = state.applications.filter(app => {
    // Possibility filter
    if (state.filterPossibility !== 'all' && app.possibility !== state.filterPossibility) {
      return false;
    }
    // Status filter
    if (state.filterStatus !== 'all' && (app.status || 'applied') !== state.filterStatus) {
      return false;
    }
    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      const matchComp = (app.company || '').toLowerCase().includes(q);
      const matchRole = (app.role || '').toLowerCase().includes(q);
      const matchNotes = (app.notes || '').toLowerCase().includes(q);
      return matchComp || matchRole || matchNotes;
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    const timeA = new Date(a.appliedDate).getTime() || 0;
    const timeB = new Date(b.appliedDate).getTime() || 0;

    switch (state.sortBy) {
      case 'time_newest':
        return timeB - timeA; // Newest first (least days/hours ago)
      case 'time_oldest':
        return timeA - timeB; // Oldest first (most days/hours ago)
      case 'possibility_high': {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[b.possibility] || 0) - (order[a.possibility] || 0);
      }
      case 'possibility_low': {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[a.possibility] || 0) - (order[b.possibility] || 0);
      }
      case 'company_asc':
        return (a.company || '').localeCompare(b.company || '');
      default:
        return timeB - timeA;
    }
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} of ${state.applications.length}`;
  }

  // Quick stats update
  updateStatsPills();

  if (filtered.length === 0) {
    listEl.innerHTML = '';
    if (emptyState) {
      emptyState.classList.remove('hidden');
      const emptyMsg = document.getElementById('empty-state-message');
      if (emptyMsg) {
        if (state.searchQuery || state.filterPossibility !== 'all' || state.filterStatus !== 'all') {
          emptyMsg.textContent = "No applications match your current search or filters.";
        } else {
          emptyMsg.textContent = "No applications added yet. Tap the '+' button below to track where you've applied!";
        }
      }
    }
    return;
  }

  if (emptyState) {
    emptyState.classList.add('hidden');
  }

  listEl.innerHTML = filtered.map(app => {
    const possibilityConfig = {
      high: {
        colorClass: 'badge-high',
        label: 'High Possibility',
        dotColor: 'var(--color-green)',
        textColor: 'var(--color-green-text)',
        bg: 'var(--color-green-bg)'
      },
      medium: {
        colorClass: 'badge-medium',
        label: 'Medium Possibility',
        dotColor: 'var(--color-yellow)',
        textColor: 'var(--color-yellow-text)',
        bg: 'var(--color-yellow-bg)'
      },
      low: {
        colorClass: 'badge-low',
        label: 'Low Possibility',
        dotColor: 'var(--color-red)',
        textColor: 'var(--color-red-text)',
        bg: 'var(--color-red-bg)'
      }
    }[app.possibility || 'medium'];

    const relativeTime = formatTimeSince(app.appliedDate);
    const exactTime = formatExactDate(app.appliedDate);
    const status = app.status || 'applied';

    return `
      <div class="app-card ${possibilityConfig.colorClass}${status === 'rejected' ? ' is-rejected' : ''}" data-id="${app.id}">
        <div class="app-card-header">
          <div class="app-card-title-wrap">
            <h3 class="app-card-company">${escapeHtml(app.company)}</h3>
            <div class="app-card-role">${escapeHtml(app.role)}</div>
          </div>
          
          <div class="possibility-pill" style="background: ${possibilityConfig.bg}; color: ${possibilityConfig.textColor}; border-color: ${possibilityConfig.dotColor};">
            <span class="possibility-dot" style="background: ${possibilityConfig.dotColor}"></span>
            <span class="possibility-text">${capitalize(app.possibility)}</span>
          </div>
        </div>

        <!-- Relative Time and exact timestamp -->
        <div class="app-card-meta">
          <div class="time-since-badge" title="Applied on: ${exactTime}">
            <svg class="icon-clock" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span class="time-relative-text"><strong>${relativeTime}</strong></span>
            <span class="time-divider">•</span>
            <span class="time-exact-text">${exactTime}</span>
          </div>

          <div class="status-pill status-${status}">
            ${formatStatusLabel(status)}
          </div>
        </div>

        ${app.notes ? `<div class="app-card-notes">${escapeHtml(app.notes)}</div>` : ''}

        <!-- Card Actions -->
        <div class="app-card-actions">
          <button class="btn-card-action btn-tailor-email" onclick="draftEmailForApp('${app.id}')" title="Generate tailored email for this role via Groq AI">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Groq Email</span>
          </button>

          <button class="btn-card-action" onclick="openEditAppModal('${app.id}')" title="Edit entry">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>

          <button class="btn-card-action btn-reject${status === 'rejected' ? ' is-on' : ''}" onclick="markRejected('${app.id}')" title="${status === 'rejected' ? 'Clear rejection' : 'Mark as rejected'}" aria-label="Mark as rejected" aria-pressed="${status === 'rejected'}">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <button class="btn-card-action text-danger" onclick="deleteApplication('${app.id}')" title="Delete application">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function updateStatsPills() {
  const highCount = state.applications.filter(a => a.possibility === 'high').length;
  const medCount = state.applications.filter(a => a.possibility === 'medium').length;
  const lowCount = state.applications.filter(a => a.possibility === 'low').length;
  const total = state.applications.length;

  const totalEl = document.getElementById('stat-total');
  const highEl = document.getElementById('stat-high');
  const medEl = document.getElementById('stat-med');
  const lowEl = document.getElementById('stat-low');

  if (totalEl) totalEl.textContent = total;
  if (highEl) highEl.textContent = highCount;
  if (medEl) medEl.textContent = medCount;
  if (lowEl) lowEl.textContent = lowCount;
}

function formatStatusLabel(status) {
  switch (status) {
    case 'applied': return 'Applied';
    case 'interviewing': return 'Interviewing';
    case 'offered': return 'Offer Received';
    case 'rejected': return 'Rejected';
    case 'withdrawn': return 'Withdrawn';
    default: return 'Applied';
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Navigation Tabs Handler
function switchTab(tabName) {
  state.currentTab = tabName;
  
  const tabApps = document.getElementById('tab-view-applications');
  const tabEmail = document.getElementById('tab-view-email');
  
  const navBtnApps = document.getElementById('nav-btn-applications');
  const navBtnEmail = document.getElementById('nav-btn-email');

  if (tabName === 'applications') {
    if (tabApps) tabApps.classList.remove('hidden');
    if (tabEmail) tabEmail.classList.add('hidden');
    if (navBtnApps) navBtnApps.classList.add('active');
    if (navBtnEmail) navBtnEmail.classList.remove('active');
    renderApplicationsList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tabName === 'ai-email') {
    if (tabApps) tabApps.classList.add('hidden');
    if (tabEmail) tabEmail.classList.remove('hidden');
    if (navBtnApps) navBtnApps.classList.remove('active');
    if (navBtnEmail) navBtnEmail.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Open modal for Adding / Editing an Application
function openAddAppModal() {
  state.editingAppId = null;
  const modal = document.getElementById('app-form-modal');
  const title = document.getElementById('form-modal-title');
  const form = document.getElementById('app-form');
  
  if (title) title.textContent = 'Add Application';
  if (form) form.reset();

  // Set default date-time to current local ISO format (YYYY-MM-DDTHH:mm)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const dateInput = document.getElementById('form-app-date');
  if (dateInput) {
    dateInput.value = now.toISOString().slice(0, 16);
  }

  // Set default possibility to 'high'
  setPossibilityRadio('high');
  
  const statusInput = document.getElementById('form-app-status');
  if (statusInput) statusInput.value = 'applied';

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function openEditAppModal(appId) {
  const app = state.applications.find(a => a.id === appId);
  if (!app) return;

  state.editingAppId = appId;
  const modal = document.getElementById('app-form-modal');
  const title = document.getElementById('form-modal-title');
  
  if (title) title.textContent = 'Edit Application';

  document.getElementById('form-company').value = app.company || '';
  document.getElementById('form-role').value = app.role || '';
  
  // Parse date into local input format
  if (app.appliedDate) {
    const d = new Date(app.appliedDate);
    if (!isNaN(d.getTime())) {
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      document.getElementById('form-app-date').value = d.toISOString().slice(0, 16);
    }
  }

  setPossibilityRadio(app.possibility || 'medium');
  document.getElementById('form-app-status').value = app.status || 'applied';
  document.getElementById('form-notes').value = app.notes || '';
  document.getElementById('form-link').value = app.link || '';

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeAppModal() {
  const modal = document.getElementById('app-form-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  state.editingAppId = null;
}

function setPossibilityRadio(val) {
  const radios = document.querySelectorAll('input[name="possibility"]');
  radios.forEach(r => {
    r.checked = (r.value === val);
    const parentCard = r.closest('.possibility-select-option');
    if (parentCard) {
      if (r.value === val) {
        parentCard.classList.add('selected');
      } else {
        parentCard.classList.remove('selected');
      }
    }
  });
}

function handleSaveAppForm(e) {
  e.preventDefault();
  const company = document.getElementById('form-company').value.trim();
  const role = document.getElementById('form-role').value.trim();
  const dateValue = document.getElementById('form-app-date').value;
  const possibilityEl = document.querySelector('input[name="possibility"]:checked');
  const possibility = possibilityEl ? possibilityEl.value : 'medium';
  const status = document.getElementById('form-app-status').value;
  const notes = document.getElementById('form-notes').value.trim();
  const link = document.getElementById('form-link').value.trim();

  if (!company || !role) {
    showToast('Please enter both Company and Role', 'error');
    return;
  }

  const appliedDate = dateValue ? new Date(dateValue).toISOString() : new Date().toISOString();

  if (state.editingAppId) {
    // Edit existing
    const index = state.applications.findIndex(a => a.id === state.editingAppId);
    if (index !== -1) {
      state.applications[index] = {
        ...state.applications[index],
        company,
        role,
        appliedDate,
        possibility,
        status,
        notes,
        link
      };
      showToast('Application updated successfully!', 'success');
    }
  } else {
    // Create new
    const newApp = {
      id: 'app-' + Date.now(),
      company,
      role,
      appliedDate,
      possibility,
      status,
      notes,
      link
    };
    state.applications.unshift(newApp);
    showToast(`Added ${company} to tracker!`, 'success');
  }

  state.saveApplications();
  closeAppModal();
  renderApplicationsList();
}

function markRejected(appId) {
  const app = state.applications.find(a => a.id === appId);
  if (!app) return;
  if (app.status === 'rejected') {
    app.status = app.statusBeforeReject || 'applied';
    delete app.statusBeforeReject;
    showToast(`Cleared rejection for ${app.company}`, 'info');
  } else {
    app.statusBeforeReject = app.status || 'applied';
    app.status = 'rejected';
    showToast(`${app.company} marked as rejected`, 'info');
  }
  state.saveApplications();
  renderApplicationsList();
}

function deleteApplication(appId) {
  const target = state.applications.find(a => a.id === appId);
  const companyName = target ? target.company : 'this application';
  
  if (confirm(`Are you sure you want to delete ${companyName}?`)) {
    state.applications = state.applications.filter(a => a.id !== appId);
    state.saveApplications();
    renderApplicationsList();
    showToast('Application deleted', 'info');
  }
}

// Direct action to jump from an application to the tailored AI Email Generator
function draftEmailForApp(appId) {
  const app = state.applications.find(a => a.id === appId);
  if (!app) return;

  switchTab('ai-email');

  const roleInput = document.getElementById('ai-role-input');
  const compInput = document.getElementById('ai-company-input');
  
  if (roleInput) roleInput.value = app.role;
  if (compInput) compInput.value = app.company;

  triggerAIEmailGeneration();
  showToast(`Loaded details for ${app.company}`, 'success');
}

// AI Email Generation Controller powered by Groq API
async function triggerAIEmailGeneration() {
  const role = (document.getElementById('ai-role-input')?.value || '').trim();
  const company = (document.getElementById('ai-company-input')?.value || '').trim();
  const recruiter = (document.getElementById('ai-recruiter-input')?.value || '').trim();
  const tone = document.getElementById('ai-tone-select')?.value || 'high_impact';

  if (!role) {
    showToast('Please specify the role you are applying for', 'error');
    const input = document.getElementById('ai-role-input');
    if (input) input.focus();
    return;
  }

  const resultContainer = document.getElementById('ai-result-container');
  const placeholder = document.getElementById('ai-placeholder');
  const loadingIndicator = document.getElementById('ai-loading');

  if (placeholder) placeholder.classList.add('hidden');
  if (loadingIndicator) loadingIndicator.classList.remove('hidden');
  if (resultContainer) resultContainer.classList.add('hidden');

  try {
    const generated = await EmailGenerator.generateEmail({
      role,
      company,
      recruiterName: recruiter,
      tone
    });

    renderGeneratedEmail(generated);
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    if (resultContainer) resultContainer.classList.remove('hidden');
    showToast('Tailored email generated successfully', 'success');
  } catch (err) {
    console.error(err);
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    showToast('Error generating email. Please try again.', 'error');
  }
}

function renderGeneratedEmail(emailData) {
  const subjectList = document.getElementById('email-subjects-list');
  const bodyEl = document.getElementById('email-body-text');
  const roleBadge = document.getElementById('email-role-badge');

  if (roleBadge) {
    roleBadge.textContent = `${emailData.role} @ ${emailData.company}`;
  }

  // Populate subject line choices
  if (subjectList) {
    subjectList.innerHTML = emailData.subjects.map((sub, index) => `
      <label class="subject-choice ${index === 0 ? 'selected' : ''}">
        <input type="radio" name="email_subject" value="${escapeHtml(sub)}" ${index === 0 ? 'checked' : ''} onchange="selectSubjectChoice(this)">
        <span class="subject-text">${escapeHtml(sub)}</span>
      </label>
    `).join('');
  }

  if (bodyEl) {
    bodyEl.value = emailData.body;
  }
}

function selectSubjectChoice(radio) {
  document.querySelectorAll('.subject-choice').forEach(sc => sc.classList.remove('selected'));
  const parent = radio.closest('.subject-choice');
  if (parent) parent.classList.add('selected');
}

function getSelectedSubject() {
  const selectedRadio = document.querySelector('input[name="email_subject"]:checked');
  return selectedRadio ? selectedRadio.value : (SHRAVANI_PROFILE.name + ' - Application');
}

function copyGeneratedEmail() {
  const subject = getSelectedSubject();
  const body = document.getElementById('email-body-text')?.value || '';
  const fullText = `Subject: ${subject}\n\n${body}`;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Copied subject and email to clipboard', 'success');
  }).catch(() => {
    showToast('Failed to copy. Please manually copy text.', 'error');
  });
}

function openInMailClient() {
  const subject = getSelectedSubject();
  const body = document.getElementById('email-body-text')?.value || '';
  
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}

// Portfolio Website Renderer (Opened from Top Right Profile Icon)
function openPortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  renderPortfolioContent();
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closePortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderPortfolioContent() {
  const p = SHRAVANI_PROFILE;
  const container = document.getElementById('portfolio-content-body');
  if (!container) return;

  container.innerHTML = `
    <!-- Portfolio Hero Section -->
    <div class="pf-hero">
      <div class="pf-avatar-wrap">
        <div class="pf-avatar">ST</div>
        <div class="pf-avatar-verified" title="Verified Candidate">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      <h2 class="pf-name">${p.name}</h2>
      <div class="pf-badge">${p.badge} • Expected Graduation 2027</div>
      <div class="pf-headline">${p.headline}</div>
      
      <div class="pf-contact-row">
        <a href="mailto:${p.email}" class="pf-contact-pill" title="Send email">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>${p.email}</span>
        </a>
        <a href="tel:${p.phone}" class="pf-contact-pill" title="Call">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>${p.phone}</span>
        </a>
        <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="pf-contact-pill" title="LinkedIn Profile">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
          <span>${p.linkedinDisplay}</span>
        </a>
        <span class="pf-contact-pill">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${p.location}</span>
        </span>
      </div>
    </div>

    <!-- Quick Action Bar -->
    <div class="pf-quick-actions">
      <button class="btn btn-primary btn-sm" onclick="sharePortfolioFromApp()">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span>Share Portfolio</span>
      </button>
      <button class="btn btn-outline-primary btn-sm" onclick="copyPortfolioBio()">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy Bio</span>
      </button>
      <button class="btn btn-outline-primary btn-sm" onclick="window.print()">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>Print Portfolio</span>
      </button>
      <a href="./portfolio.html" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        <span>Full Page</span>
      </a>
    </div>

    <!-- Section 1: Executive Summary Card -->
    <div class="pf-card">
      <div class="pf-card-header">
        <div class="pf-icon-circle">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h3>About & Career Objective</h3>
      </div>
      <p class="pf-summary-text">${p.about}</p>
    </div>

    <!-- Section 2: Key National Honor Card -->
    <div class="pf-card pf-highlight-card">
      <div class="pf-highlight-banner">
        <div class="pf-icon-circle" style="color: var(--color-yellow);">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
        </div>
        <div>
          <h4>National Honor: 2nd Place Nationwide</h4>
          <p>AMR Innovation Challenge — Organized by <strong>CHRI</strong>, <strong>PATH</strong>, and <strong>GlaxoSmithKline (GSK)</strong></p>
        </div>
      </div>
      <p class="pf-card-note">Awarded for co-developing <strong>AMR-Guard</strong>, an AI-informed digital web platform enabling structured household antimicrobial waste disposal and environmental AMR containment.</p>
    </div>

    <!-- Section 3: Experience & Technical Research -->
    <div class="pf-card">
      <div class="pf-card-header">
        <div class="pf-icon-circle">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h3>Research & Product Experience</h3>
      </div>
      <div class="pf-timeline">
        ${p.experience.map(exp => `
          <div class="pf-timeline-item">
            <div class="pf-item-title-wrap">
              <h4>${exp.role} — <em>${exp.project}</em></h4>
              <span class="pf-item-period">${exp.period} | ${exp.type}</span>
            </div>
            <div class="pf-item-company">${exp.company}</div>
            <ul class="pf-item-bullets">
              ${exp.points.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Section 4: Leadership & Outreach Experience -->
    <div class="pf-card">
      <div class="pf-card-header">
        <div class="pf-icon-circle">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3>Leadership & Organizational Tenure</h3>
      </div>
      <div class="pf-timeline">
        ${p.leadership.map(lead => `
          <div class="pf-timeline-item">
            <div class="pf-item-title-wrap">
              <h4>${lead.role}</h4>
              <span class="pf-item-period">${lead.chapter}</span>
            </div>
            <div class="pf-item-company">${lead.organization}</div>
            <ul class="pf-item-bullets">
              ${lead.points.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Section 5: Certifications Card -->
    <div class="pf-card">
      <div class="pf-card-header">
        <div class="pf-icon-circle">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <h3>Certifications & Credentials</h3>
      </div>
      <div class="pf-cert-grid">
        ${p.certifications.map(cert => `
          <div class="pf-cert-card">
            <div class="pf-cert-title">${cert.title}</div>
            <div class="pf-cert-issuer">${cert.issuer}</div>
            <div class="pf-cert-desc">${cert.description}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Section 6: Categorized Skills Matrix -->
    <div class="pf-card">
      <div class="pf-card-header">
        <div class="pf-icon-circle">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <h3>Competencies & Skills Matrix</h3>
      </div>
      <div class="pf-skills-section">
        <div class="pf-skill-group">
          <h5>Domain Knowledge</h5>
          <div class="pf-pills-wrap">
            ${p.skills.domain.map(s => `<span class="pf-pill domain-pill">${s}</span>`).join('')}
          </div>
        </div>

        <div class="pf-skill-group">
          <h5>Research & Product Strategy</h5>
          <div class="pf-pills-wrap">
            ${p.skills.researchProduct.map(s => `<span class="pf-pill research-pill">${s}</span>`).join('')}
          </div>
        </div>

        <div class="pf-skill-group">
          <h5>Technical Tools & AI</h5>
          <div class="pf-pills-wrap">
            ${p.skills.technicalTools.map(s => `<span class="pf-pill tech-pill">${s}</span>`).join('')}
          </div>
        </div>

        <div class="pf-skill-group">
          <h5>Leadership & Public Health</h5>
          <div class="pf-pills-wrap">
            ${p.skills.leadership.map(s => `<span class="pf-pill lead-pill">${s}</span>`).join('')}
          </div>
        </div>

        <div class="pf-skill-group">
          <h5>Languages</h5>
          <div class="pf-pills-wrap">
            ${p.skills.languages.map(l => `<span class="pf-pill lang-pill">${l.name} (${l.level})</span>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Section 7: Education Card -->
    <div class="pf-card">
      <div class="pf-card-header">
        <div class="pf-icon-circle">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
          </svg>
        </div>
        <h3>Education</h3>
      </div>
      ${p.education.map(edu => `
        <div class="pf-edu-item">
          <div class="pf-item-title-wrap">
            <h4>${edu.degree}</h4>
            <span class="pf-item-period">${edu.graduation}</span>
          </div>
          <div class="pf-item-company">${edu.institution}, ${edu.location}</div>
          <p class="pf-edu-note">${edu.highlight}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function sharePortfolioFromApp() {
  const portfolioUrl = window.location.origin 
    ? (window.location.origin + '/portfolio.html') 
    : (window.location.href.split('#')[0].replace('index.html', 'portfolio.html'));

  const shareData = {
    title: "Shravani Chetan Tilwankar — Portfolio",
    text: "Portfolio of Shravani Chetan Tilwankar | B.Pharm Candidate | Digital Health & AMR Innovations",
    url: portfolioUrl
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(portfolioUrl).then(() => {
      showToast('Portfolio link copied to clipboard', 'success');
    }).catch(() => {
      showToast('Share URL: ' + portfolioUrl, 'info');
    });
  }
}

function copyPortfolioBio() {
  const text = SHRAVANI_PROFILE.about;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Executive bio copied to clipboard', 'success');
  });
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  // Apply theme
  state.saveTheme(state.theme);

  // Setup theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.saveTheme(nextTheme);
      showToast(`Switched to ${nextTheme} theme`);
    });
  }

  // Bottom Navigation listeners
  document.getElementById('nav-btn-applications')?.addEventListener('click', () => switchTab('applications'));
  document.getElementById('nav-btn-email')?.addEventListener('click', () => switchTab('ai-email'));
  document.getElementById('nav-btn-add')?.addEventListener('click', openAddAppModal);

  // Top right profile icon listener
  document.getElementById('top-profile-btn')?.addEventListener('click', openPortfolioModal);
  document.getElementById('portfolio-close-btn')?.addEventListener('click', closePortfolioModal);
  document.getElementById('portfolio-modal-backdrop')?.addEventListener('click', closePortfolioModal);

  // Modal Add/Edit form listeners
  document.getElementById('modal-close-btn')?.addEventListener('click', closeAppModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', closeAppModal);
  document.getElementById('app-form')?.addEventListener('submit', handleSaveAppForm);

  // Possibility radio selector cards click handler
  document.querySelectorAll('.possibility-select-option').forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[name="possibility"]');
      if (radio) {
        setPossibilityRadio(radio.value);
      }
    });
  });

  // Search and Filter Listeners
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderApplicationsList();
    });
  }

  // Possibility filters
  document.querySelectorAll('.filter-chip[data-possibility]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip[data-possibility]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filterPossibility = chip.getAttribute('data-possibility');
      renderApplicationsList();
    });
  });

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderApplicationsList();
    });
  }

  // Quick suggestions chip listeners for Add Form
  setupAutocompleteSuggestions();

  // AI Email Generator Listeners
  document.getElementById('btn-generate-ai-email')?.addEventListener('click', triggerAIEmailGeneration);
  document.getElementById('btn-copy-email')?.addEventListener('click', copyGeneratedEmail);
  document.getElementById('btn-mail-app')?.addEventListener('click', openInMailClient);

  // Auto-refresh relative times every 60 seconds
  setInterval(() => {
    if (state.currentTab === 'applications') {
      renderApplicationsList();
    }
  }, 60000);

  // Render initial clean list (starts with 0 applications)
  renderApplicationsList();
});

function setupAutocompleteSuggestions() {
  const compSuggestions = document.getElementById('company-suggestions');
  if (compSuggestions) {
    compSuggestions.innerHTML = COMMON_COMPANIES.slice(0, 6).map(c => `
      <button type="button" class="suggestion-chip" onclick="selectCompanySuggestion('${escapeHtml(c)}')">${escapeHtml(c)}</button>
    `).join('');
  }

  const roleSuggestions = document.getElementById('role-suggestions');
  if (roleSuggestions) {
    roleSuggestions.innerHTML = COMMON_ROLES.slice(0, 5).map(r => `
      <button type="button" class="suggestion-chip" onclick="selectRoleSuggestion('${escapeHtml(r)}')">${escapeHtml(r)}</button>
    `).join('');
  }

  const aiRoleSuggestions = document.getElementById('ai-role-chips');
  if (aiRoleSuggestions) {
    aiRoleSuggestions.innerHTML = COMMON_ROLES.slice(0, 4).map(r => `
      <button type="button" class="suggestion-chip" onclick="selectAIRoleSuggestion('${escapeHtml(r)}')">${escapeHtml(r)}</button>
    `).join('');
  }
}

function selectCompanySuggestion(name) {
  const input = document.getElementById('form-company');
  if (input) input.value = name;
}

function selectRoleSuggestion(role) {
  const input = document.getElementById('form-role');
  if (input) input.value = role;
}

function selectAIRoleSuggestion(role) {
  const input = document.getElementById('ai-role-input');
  if (input) {
    input.value = role;
    triggerAIEmailGeneration();
  }
}
