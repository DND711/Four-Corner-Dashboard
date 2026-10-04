// Main Application Controller for Four Corner Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  setupEventListeners();
  if (typeof renderExportHistory === 'function') renderExportHistory();
  if (typeof startActivityPolling === 'function') startActivityPolling();
});

function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const search = document.getElementById('global-search-input');
      if (search) { search.focus(); search.select(); }
    }
    if (e.key === 'Escape') {
      if (typeof closeAddProjectModal === 'function') closeAddProjectModal();
      if (typeof closePropertyDetailModal === 'function') closePropertyDetailModal();
      if (typeof closeReraVerificationModal === 'function') closeReraVerificationModal();
      if (typeof closeEditProjectModal === 'function') closeEditProjectModal();
      if (typeof closeCampaignDetailModal === 'function') closeCampaignDetailModal();
      if (typeof closeCampaignFilterDropdown === 'function') closeCampaignFilterDropdown();
      if (typeof closeBuyerDetailModal === 'function') closeBuyerDetailModal();
      if (typeof closeBuyerFilterDropdown === 'function') closeBuyerFilterDropdown();
      if (typeof closeSearchReportModal === 'function') closeSearchReportModal();
      if (typeof closeSearchReportFilterDropdown === 'function') closeSearchReportFilterDropdown();
      if (typeof closeIntelProjectDropdown === 'function') closeIntelProjectDropdown();
      if (typeof closeAllProjectRowMenus === 'function') closeAllProjectRowMenus();
      if (typeof closeAllReraRowMenus === 'function') closeAllReraRowMenus();
      if (typeof closeAllSearchRowMenus === 'function') closeAllSearchRowMenus();
      if (typeof closeActivityFeed === 'function') closeActivityFeed();
    }
  });
}

// ─── View Switching & Sidebar Controller ────────────────────────────────────

const VIEW_NAMES = [
  'overview',
  'activity-log',
  'search-logs',
  'project-demand',
  'demand-trends',
  'projects',
  'rera-compliance',
  'pending-review',
  'buyer-leads',
  'audience',
  'ad-segments',
  'data-exports'
];

const ALL_SIDEBAR_BTN_IDS = [
  'side-btn-overview',
  'side-btn-activity-log',
  'side-btn-search-logs',
  'side-btn-project-demand',
  'side-btn-demand-trends',
  'side-btn-projects',
  'side-btn-rera-compliance',
  'side-btn-pending-review',
  'side-btn-buyer-leads',
  'side-btn-audience',
  'side-btn-ad-segments',
  'side-btn-data-exports'
];

function setActiveSidebarButton(activeId) {
  ALL_SIDEBAR_BTN_IDS.forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const isActive = id === activeId;
    if (isActive) {
      btn.classList.add('bg-[#6D001A]', 'text-white', 'font-semibold');
      btn.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100', 'font-medium');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.classList.add('text-white');
        svg.classList.remove('text-slate-400', 'text-amber-500', 'text-emerald-600');
      }
    } else {
      btn.classList.remove('bg-[#6D001A]', 'text-white', 'font-semibold');
      btn.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100', 'font-medium');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.classList.remove('text-white');
        if (id === 'side-btn-pending-review') {
          svg.classList.add('text-amber-500');
          svg.classList.remove('text-slate-400', 'text-emerald-600');
        } else if (id === 'side-btn-rera-compliance') {
          svg.classList.add('text-emerald-600');
          svg.classList.remove('text-slate-400', 'text-amber-500');
        } else {
          svg.classList.add('text-slate-400');
          svg.classList.remove('text-amber-500', 'text-emerald-600');
        }
      }
    }
  });
}

function switchView(viewName, isFromSearch = false) {
  if (!isFromSearch) {
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch && globalSearch.value) globalSearch.value = '';
  }

  VIEW_NAMES.forEach(v => {
    const viewEl  = document.getElementById(`view-${v}`);
    const topBtn  = document.getElementById(`tab-btn-${v}`);
    const isActive = v === viewName;

    if (viewEl) viewEl.classList.toggle('hidden', !isActive);

    if (topBtn) {
      if (isActive) {
        topBtn.classList.add('text-slate-900', 'bg-white', 'shadow-sm', 'font-semibold');
        topBtn.classList.remove('text-slate-600', 'hover:text-slate-900');
      } else {
        topBtn.classList.remove('text-slate-900', 'bg-white', 'shadow-sm', 'font-semibold');
        topBtn.classList.add('text-slate-600', 'hover:text-slate-900');
      }
    }
  });

  // 1-to-1 Sidebar Button Activation
  setActiveSidebarButton('side-btn-' + viewName);

  // Trigger dedicated page renderers
  if (viewName === 'overview') {
    renderOverview();
    if (typeof loadAndRenderTrendChart === 'function') loadAndRenderTrendChart();
  } else if (viewName === 'activity-log') {
    if (typeof renderFullPageActivityLog === 'function') renderFullPageActivityLog();
  } else if (viewName === 'search-logs') {
    if (typeof renderSearchIntelligence === 'function') renderSearchIntelligence();
  } else if (viewName === 'project-demand') {
    if (typeof renderProjectSpecificSignals === 'function') renderProjectSpecificSignals();
  } else if (viewName === 'demand-trends') {
    if (typeof renderDemandTrendsPage === 'function') renderDemandTrendsPage();
  } else if (viewName === 'projects') {
    renderProjectsRegistry();
  } else if (viewName === 'rera-compliance') {
    if (typeof renderReraComplianceView === 'function') renderReraComplianceView();
  } else if (viewName === 'pending-review') {
    if (typeof renderPendingReviewView === 'function') renderPendingReviewView();
  } else if (viewName === 'buyer-leads') {
    if (typeof renderBuyerLeadsView === 'function') renderBuyerLeadsView();
  } else if (viewName === 'audience') {
    if (typeof renderAudienceView === 'function') renderAudienceView();
  } else if (viewName === 'ad-segments') {
    if (typeof renderAdSegmentsView === 'function') renderAdSegmentsView();
  } else if (viewName === 'data-exports') {
    if (typeof renderExportHistory === 'function') renderExportHistory();
  }
}

// ─── Dashboard Data Load ─────────────────────────────────────────────────────

async function loadDashboardData() {
  const reloadIcon = document.getElementById('reload-icon');
  if (reloadIcon) reloadIcon.classList.add('animate-spin');

  let allFailed = false;
  try {
    const results = await Promise.allSettled([
      loadOverviewData(),
      loadProjectsData(),
      loadSearchIntelligenceData(),
      loadAudienceData()
    ]);
    allFailed = results.every(r => r.status === 'rejected');

    if (!allFailed) {
      renderOverview();
      if (typeof loadAndRenderTrendChart === 'function') loadAndRenderTrendChart();
      updateSidebarBadges();
      showToast('Dashboard refreshed.', true);
    }
  } catch (err) {
    console.warn('Dashboard load error:', err);
    allFailed = true;
  } finally {
    if (reloadIcon) reloadIcon.classList.remove('animate-spin');
  }

  const banner = document.getElementById('offline-banner');
  if (banner) banner.classList.toggle('hidden', !allFailed);

}

function updateSidebarBadges() {
  // Only for pending verification: show highlighted badge when items are pending
  const pendingCount = (typeof projectsData !== 'undefined' && Array.isArray(projectsData))
    ? projectsData.filter(p => typeof isProjectPending === 'function' ? isProjectPending(p) : false).length : 0;
  const pendBadge = document.getElementById('side-pending-count');
  if (pendBadge) {
    if (pendingCount > 0) {
      pendBadge.textContent = pendingCount;
      pendBadge.classList.remove('hidden');
    } else {
      pendBadge.classList.add('hidden');
    }
  }
}


// ─── Universal Search Engine (Multi-Entity Intelligence) ─────────────────────

let universalSearchCategory = 'all'; // 'all' | 'projects' | 'buyers' | 'locations' | 'reports'

function handleUniversalSearch(query) {
  const dropdown = document.getElementById('universal-search-dropdown');
  const clearBtn = document.getElementById('universal-search-clear');
  query = (query || '').trim();

  if (!query) {
    if (dropdown) dropdown.classList.add('hidden');
    if (clearBtn) clearBtn.classList.add('hidden');
    return;
  }

  if (clearBtn) clearBtn.classList.remove('hidden');
  renderUniversalSearchResults(query, universalSearchCategory);
}

function clearUniversalSearch() {
  const input = document.getElementById('global-search-input');
  if (input) input.value = '';
  const dropdown = document.getElementById('universal-search-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  const clearBtn = document.getElementById('universal-search-clear');
  if (clearBtn) clearBtn.classList.add('hidden');

  if (typeof universalProjectQuery !== 'undefined') {
    universalProjectQuery = '';
    if (typeof renderProjectsRegistry === 'function') renderProjectsRegistry();
  }
}

function setUniversalSearchCategory(cat) {
  universalSearchCategory = cat;
  const input = document.getElementById('global-search-input');
  if (input && input.value) {
    renderUniversalSearchResults(input.value.trim(), cat);
  }
}

function renderUniversalSearchResults(query, category = 'all') {
  const dropdown = document.getElementById('universal-search-dropdown');
  if (!dropdown) return;

  const q = query.toLowerCase();

  // 1. Projects Matching
  const matchingProjects = (typeof projectsData !== 'undefined' ? projectsData : []).filter(p => {
    return (p.name || '').toLowerCase().includes(q) ||
           (p.developer || '').toLowerCase().includes(q) ||
           (p.micro_market || '').toLowerCase().includes(q) ||
           (p.rera_id || '').toLowerCase().includes(q);
  });

  // 2. Qualified Buyers Matching
  const buyersList = (typeof audienceData !== 'undefined' && audienceData && audienceData.qualified_buyers)
    ? audienceData.qualified_buyers : [];
  const matchingBuyers = buyersList.filter(b => {
    return (b.name || '').toLowerCase().includes(q) ||
           (b.email || '').toLowerCase().includes(q) ||
           (b.micro_market_pref || '').toLowerCase().includes(q) ||
           (b.interested_projects || []).some(ip => ip.toLowerCase().includes(q));
  });

  // 3. Micro-Markets Matching
  const allMarkets = [
    'Tellapur', 'Kokapet', 'Financial District', 'Kollur',
    'Narsingi', 'Gachibowli', 'Nanakramguda', 'Rajendra Nagar'
  ];
  const matchingMarkets = allMarkets.filter(m => m.toLowerCase().includes(q)).map(m => {
    const pCount = (typeof projectsData !== 'undefined' ? projectsData : [])
      .filter(p => (p.micro_market || '').toLowerCase().includes(m.toLowerCase())).length;
    return { name: m, count: pCount };
  });

  // 4. Search Reports / Demand Signals Matching
  const matchingReports = (typeof projectsData !== 'undefined' ? projectsData : []).filter(p => {
    const impressions = p.search_impressions || 0;
    return impressions > 0 && ((p.name || '').toLowerCase().includes(q) || (p.micro_market || '').toLowerCase().includes(q));
  });

  const totalResults = matchingProjects.length + matchingBuyers.length + matchingMarkets.length + matchingReports.length;

  dropdown.classList.remove('hidden');

  if (totalResults === 0) {
    dropdown.innerHTML = `
      <div class="p-8 text-center">
        <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-400 mb-2">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div class="text-xs font-bold text-slate-800">No results found for "${escapeHtml(query)}"</div>
        <div class="text-[11px] text-slate-400 mt-1">Try searching for a project (e.g. Akrida), locality (e.g. Tellapur), or buyer name.</div>
      </div>
    `;
    return;
  }

  // Category Filter Tabs
  const tabsHtml = `
    <div class="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto text-[11px] font-semibold shrink-0">
      <button onclick="setUniversalSearchCategory('all')" 
        class="px-2.5 py-1 rounded-lg transition cursor-pointer ${category === 'all' ? 'bg-[#6D001A] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}">
        All (${totalResults})
      </button>
      <button onclick="setUniversalSearchCategory('projects')" 
        class="px-2.5 py-1 rounded-lg transition cursor-pointer ${category === 'projects' ? 'bg-[#6D001A] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}">
        Properties (${matchingProjects.length})
      </button>
      <button onclick="setUniversalSearchCategory('buyers')" 
        class="px-2.5 py-1 rounded-lg transition cursor-pointer ${category === 'buyers' ? 'bg-[#6D001A] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}">
        Buyers (${matchingBuyers.length})
      </button>
      <button onclick="setUniversalSearchCategory('locations')" 
        class="px-2.5 py-1 rounded-lg transition cursor-pointer ${category === 'locations' ? 'bg-[#6D001A] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}">
        Locations (${matchingMarkets.length})
      </button>
      <button onclick="setUniversalSearchCategory('reports')" 
        class="px-2.5 py-1 rounded-lg transition cursor-pointer ${category === 'reports' ? 'bg-[#6D001A] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}">
        Reports (${matchingReports.length})
      </button>
    </div>
  `;

  // Results Section Body
  let bodyHtml = `<div class="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[380px]">`;

  // SECTION: PROPERTIES
  if ((category === 'all' || category === 'projects') && matchingProjects.length > 0) {
    bodyHtml += `
      <div class="p-2 bg-slate-50/50">
        <div class="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Properties & Projects (${matchingProjects.length})
        </div>
      </div>
      <div class="p-1 space-y-0.5">
        ${matchingProjects.slice(0, category === 'projects' ? 20 : 4).map(p => {
          const isPending = typeof isProjectPending === 'function' && isProjectPending(p);
          const price = p.min_price_cr ? `₹${p.min_price_cr} - ${p.max_price_cr} Cr` : 'Pricing on File';
          return `
            <div onclick="openUniversalProject('${p.id}')"
              class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-red-50 text-[#6D001A] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#6D001A] group-hover:text-white transition">
                  ${escapeHtml((p.name || 'P')[0])}
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-xs text-slate-900 group-hover:text-[#6D001A] transition truncate">${escapeHtml(p.name)}</div>
                  <div class="text-[11px] text-slate-500 truncate">${escapeHtml(p.developer)} • <span class="text-slate-700 font-medium">${escapeHtml(p.micro_market)}</span></div>
                </div>
              </div>
              <div class="text-right shrink-0 ml-3">
                <div class="text-xs font-bold font-mono text-slate-800">${price}</div>
                <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}">
                  ${isPending ? 'Pending Review' : 'Verified'}
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // SECTION: BUYERS
  if ((category === 'all' || category === 'buyers') && matchingBuyers.length > 0) {
    bodyHtml += `
      <div class="p-2 bg-slate-50/50">
        <div class="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Qualified Buyers & Leads (${matchingBuyers.length})
        </div>
      </div>
      <div class="p-1 space-y-0.5">
        ${matchingBuyers.slice(0, category === 'buyers' ? 20 : 3).map(b => `
          <div onclick="openUniversalBuyer('${b.id}')"
            class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                ${escapeHtml((b.name || 'B')[0])}
              </div>
              <div class="min-w-0">
                <div class="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition truncate">${escapeHtml(b.name)}</div>
                <div class="text-[11px] text-slate-500 truncate">Pref: <span class="font-medium text-slate-700">${escapeHtml(b.micro_market_pref || 'Tellapur')}</span> • ${escapeHtml(b.email || '—')}</div>
              </div>
            </div>
            <div class="text-right shrink-0 ml-3">
              <div class="text-xs font-bold font-mono text-emerald-700">₹${b.budget_max_cr || 2.0} Cr</div>
              <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Score: ${b.readiness_score || 85}/100
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // SECTION: LOCATIONS
  if ((category === 'all' || category === 'locations') && matchingMarkets.length > 0) {
    bodyHtml += `
      <div class="p-2 bg-slate-50/50">
        <div class="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Micro-Markets & Hubs (${matchingMarkets.length})
        </div>
      </div>
      <div class="p-1 space-y-0.5">
        ${matchingMarkets.map(m => `
          <div onclick="openUniversalMarket('${m.name}')"
            class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                📍
              </div>
              <div>
                <div class="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition">${escapeHtml(m.name)}</div>
                <div class="text-[11px] text-slate-500">Filter all properties and price trends in ${escapeHtml(m.name)}</div>
              </div>
            </div>
            <span class="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              ${m.count} ${m.count === 1 ? 'project' : 'projects'}
            </span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // SECTION: REPORTS / SEARCHES
  if ((category === 'all' || category === 'reports') && matchingReports.length > 0) {
    bodyHtml += `
      <div class="p-2 bg-slate-50/50">
        <div class="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Search Reports & Intelligence (${matchingReports.length})
        </div>
      </div>
      <div class="p-1 space-y-0.5">
        ${matchingReports.slice(0, 3).map(r => `
          <div onclick="openUniversalReport('${escapeHtml(r.name)}')"
            class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                📊
              </div>
              <div>
                <div class="font-bold text-xs text-slate-900 group-hover:text-[#6D001A] transition">${escapeHtml(r.name)} Search Intel</div>
                <div class="text-[11px] text-slate-500">${r.search_impressions || 0} buyers matched • View query keywords</div>
              </div>
            </div>
            <span class="text-xs font-semibold text-[#6D001A] hover:underline">View Signals →</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  bodyHtml += `</div>`;

  // Dropdown Footer
  const footerHtml = `
    <div class="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
      <span>Found ${totalResults} results across platform entities</span>
      <span class="font-mono">ESC to close</span>
    </div>
  `;

  dropdown.innerHTML = tabsHtml + bodyHtml + footerHtml;
}

// Universal Search Actions
function openUniversalProject(projectId) {
  clearUniversalSearch();
  const p = (typeof projectsData !== 'undefined' && Array.isArray(projectsData))
    ? projectsData.find(x => x.id === projectId) : null;
  if (p && typeof isProjectPending === 'function' && isProjectPending(p)) {
    switchView('pending-review');
  } else {
    switchView('projects');
  }
  if (typeof openPropertyDetail === 'function') {
    openPropertyDetail(projectId);
  }
}

function openUniversalBuyer(buyerId) {
  clearUniversalSearch();
  switchView('buyer-leads');
  if (typeof selectAudienceBuyer === 'function') {
    setTimeout(() => selectAudienceBuyer(buyerId), 50);
  }
}

function openUniversalMarket(marketName) {
  clearUniversalSearch();
  openAllProjects();
  currentMarketFilter = marketName;
  const marketSel = document.getElementById('filter-market-select');
  if (marketSel) marketSel.value = marketName;
  if (typeof renderProjectsRegistry === 'function') renderProjectsRegistry();
}

function openUniversalReport(projectName) {
  clearUniversalSearch();
  if (typeof inspectProjectIntelWithHighlight === 'function') {
    inspectProjectIntelWithHighlight(projectName);
  }
}

// Global click-outside listener to dismiss Universal Search dropdown
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('universal-search-wrapper');
  const dropdown = document.getElementById('universal-search-dropdown');
  if (wrapper && !wrapper.contains(e.target) && dropdown) {
    dropdown.classList.add('hidden');
  }
});

// Keyboard shortcuts for search (⌘K or / or ESC)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const dropdown = document.getElementById('universal-search-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      dropdown.classList.add('hidden');
    }
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
});

// ─── "View Searches" with Card Highlight ─────────────────────────────────────

function inspectProjectIntelWithHighlight(projectName) {
  if (typeof inspectProjectIntel === 'function') inspectProjectIntel(projectName);

  setTimeout(() => {
    const card = document.querySelector('#view-project-demand .rounded-2xl.bg-white.border');
    if (card) {
      card.style.transition = 'box-shadow 0.2s ease, border-color 0.2s ease';
      card.style.boxShadow = '0 0 0 3px rgba(109,0,26,0.22)';
      card.style.borderColor = '#6D001A';
      setTimeout(() => {
        card.style.boxShadow = '';
        card.style.borderColor = '';
      }, 1400);
    }
  }, 120);
}
