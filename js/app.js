// Main Application Controller & View Orchestrator

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
}

function switchView(viewName) {
  ['buyers', 'inventory', 'analytics'].forEach(v => {
    const viewEl = document.getElementById(`view-${v}`);
    const tabBtn = document.getElementById(`tab-btn-${v}`);
    const mobTab = document.getElementById(`mob-tab-${v}`);

    if (v === viewName) {
      if (viewEl) viewEl.classList.remove('hidden');
      if (tabBtn) {
        tabBtn.className = "px-3.5 py-1.5 rounded-lg transition text-white bg-slate-800 shadow-sm font-semibold";
      }
      if (mobTab) {
        mobTab.className = "py-1 font-semibold text-white";
      }
    } else {
      if (viewEl) viewEl.classList.add('hidden');
      if (tabBtn) {
        tabBtn.className = "px-3.5 py-1.5 rounded-lg transition text-slate-400 hover:text-white";
      }
      if (mobTab) {
        mobTab.className = "py-1 text-slate-400";
      }
    }
  });
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
    renderAnalyticsTiers();

    showToast('Dashboard synchronized with live database');
  } catch (err) {
    console.warn('Dashboard sync error:', err);
    showToast('Offline mode: Using cached data');
  } finally {
    if (reloadIcon) reloadIcon.classList.remove('animate-spin');
  }
}
