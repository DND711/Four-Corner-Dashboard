// Main Application Controller & Workspace Orchestrator

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  setupEventListeners();
});

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('export-dropdown');
    if (menu && !menu.classList.contains('hidden') && !e.target.closest('button[onclick="toggleExportMenu()"]')) {
      menu.classList.add('hidden');
    }
  });

  // Global search shortcut (Cmd/Ctrl + K)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const search = document.getElementById('global-search-input');
      if (search) search.focus();
    }
  });
}

function switchView(viewName) {
  const views = ['buyers', 'inventory', 'analytics'];
  views.forEach(v => {
    const viewEl = document.getElementById(`view-${v}`);
    const sideBtn = document.getElementById(`side-btn-${v}`);
    const topBtn = document.getElementById(`tab-btn-${v}`);

    if (v === viewName) {
      if (viewEl) viewEl.classList.remove('hidden');
      if (sideBtn) {
        sideBtn.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/90 text-white font-semibold border border-white/10 shadow-sm transition";
      }
      if (topBtn) {
        topBtn.className = "px-3.5 py-1.5 rounded-lg text-white bg-slate-800 shadow-sm font-semibold transition";
      }
    } else {
      if (viewEl) viewEl.classList.add('hidden');
      if (sideBtn) {
        sideBtn.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium transition";
      }
      if (topBtn) {
        topBtn.className = "px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition";
      }
    }
  });

  // If switching to analytics, trigger analytics rendering
  if (viewName === 'analytics') {
    renderAnalyticsView();
  }
}

function showToast(msg) {
  const el = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (msgEl) msgEl.textContent = msg;
  if (!el) return;
  el.classList.remove('translate-y-24', 'opacity-0');
  el.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    el.classList.remove('translate-y-0', 'opacity-100');
    el.classList.add('translate-y-24', 'opacity-0');
  }, 3000);
}

function toggleExportMenu() {
  const menu = document.getElementById('export-dropdown');
  if (menu) menu.classList.toggle('hidden');
}

async function loadDashboardData() {
  const reloadIcon = document.getElementById('reload-icon');
  if (reloadIcon) reloadIcon.classList.add('animate-spin');

  try {
    // 1. Fetch Admin Buyers & Inquiries
    try {
      const buyersData = await fetchAdminBuyersData();
      allBuyers = buyersData.buyers || [];
      allInquiries = buyersData.inquiries || [];
      allSavedUnits = buyersData.saved_units || [];
      
      const dbLabel = document.getElementById('db-engine-label');
      if (dbLabel && buyersData.database_engine) {
        dbLabel.textContent = buyersData.database_engine === 'postgresql' ? 'PostgreSQL (Supabase)' : 'SQLite Local';
      }
    } catch (e) {
      console.warn('Could not load buyers from server:', e);
    }

    // 2. Fetch Verified Properties Catalog
    try {
      const propData = await fetchPropertiesCatalog();
      allProperties = propData.properties || [];
    } catch (e) {
      console.warn('Could not load properties catalog:', e);
    }

    // Update UI components
    renderKPIs();
    renderBuyersTable(allBuyers);
    renderInquiries(allInquiries);
    renderPropertiesGrid(allProperties);
    renderAnalyticsView();

    showToast('Dashboard synchronized with Supabase');
  } catch (err) {
    console.warn('Dashboard sync error:', err);
    showToast('Offline mode: Using cached data');
  } finally {
    if (reloadIcon) reloadIcon.classList.remove('animate-spin');
  }
}
