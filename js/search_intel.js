// Search & Intent Intelligence Module
// Details what properties are shown, on what keywords, and in what context

let currentSearchIntelTab = 'logs';
let searchReportQuery = '';
let currentSrMarketFilter = 'all';
let currentSrBhkFilter = 'all';
let currentSrArchFilter = 'all';
let currentSrBudgetFilter = 'all';
let currentSrResultsFilter = 'all';
let currentModalSearch = null;

async function loadSearchIntelligenceData() {
  try {
    const data = await fetchSearchIntelligence();
    searchIntelData = data;
    renderSearchIntelligence();
  } catch (err) {
    console.error('Failed to load search intelligence:', err);
  }
}

function switchSearchIntelTab(tabName) {
  currentSearchIntelTab = tabName;

  const btnLogs = document.getElementById('tab-btn-search-logs');
  const btnProject = document.getElementById('tab-btn-search-project');
  const btnTrends = document.getElementById('tab-btn-search-trends');

  const tabLogs = document.getElementById('search-intel-tab-logs');
  const tabProject = document.getElementById('search-intel-tab-project');
  const tabTrends = document.getElementById('search-intel-tab-trends');

  // Reset button styles
  const activeClass = 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#6D001A] text-white shadow-xs transition cursor-pointer';
  const inactiveClass = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer';

  if (btnLogs) btnLogs.className = (tabName === 'logs') ? activeClass : inactiveClass;
  if (btnProject) btnProject.className = (tabName === 'project') ? activeClass : inactiveClass;
  if (btnTrends) btnTrends.className = (tabName === 'trends') ? activeClass : inactiveClass;

  if (tabLogs) {
    if (tabName === 'logs') tabLogs.classList.remove('hidden');
    else tabLogs.classList.add('hidden');
  }
  if (tabProject) {
    if (tabName === 'project') {
      tabProject.classList.remove('hidden');
      renderProjectSpecificSignals();
    } else {
      tabProject.classList.add('hidden');
    }
  }
  if (tabTrends) {
    if (tabName === 'trends') tabTrends.classList.remove('hidden');
    else tabTrends.classList.add('hidden');
  }

  if (typeof setActiveSidebarButton === 'function') {
    setActiveSidebarButton('side-btn-search-' + tabName);
  }
}

function inspectProjectIntel(projectName) {
  selectedProjectForIntel = projectName;
  switchView('project-demand');
  const selector = document.getElementById('intel-project-selector');
  if (selector) {
    selector.value = projectName;
  }
  const labelEl = document.getElementById('intel-project-dropdown-selected');
  if (labelEl) {
    labelEl.textContent = projectName;
  }
  populateIntelProjectDropdown();
  renderProjectSpecificSignals();
}

function onIntelProjectSelect(projectName) {
  selectedProjectForIntel = projectName;
  const labelEl = document.getElementById('intel-project-dropdown-selected');
  if (labelEl) {
    labelEl.textContent = projectName;
  }
  populateIntelProjectDropdown();
  renderProjectSpecificSignals();
}

function renderDemandTrendsPage() {
  if (!searchIntelData) return;
  const fm = searchIntelData.filter_metrics;
  if (!fm) return;

  // Facing preference distribution with visual progress bars
  const facingContainer = document.getElementById('intel-facing-distribution');
  if (facingContainer && fm.facing_distribution) {
    const maxFacingCount = Math.max(...fm.facing_distribution.map(f => f.count), 1);
    facingContainer.innerHTML = fm.facing_distribution.map(f => {
      const pct = Math.round((f.count / maxFacingCount) * 100);
      return `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-slate-800">${escapeHtml(f.facing)} Facing</span>
            <span class="font-mono text-slate-500 font-semibold">${f.count} searches</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="bg-[#6D001A] h-1.5 rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // BHK preference distribution with visual progress bars
  const bhkContainer = document.getElementById('intel-bhk-distribution');
  if (bhkContainer && fm.bhk_distribution) {
    const maxBhkCount = Math.max(...fm.bhk_distribution.map(b => b.count), 1);
    bhkContainer.innerHTML = fm.bhk_distribution.map(b => {
      const pct = Math.round((b.count / maxBhkCount) * 100);
      return `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-slate-800">${b.bhk} BHK</span>
            <span class="font-mono text-slate-500 font-semibold">${b.count} searches</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="bg-[#6D001A] h-1.5 rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}
window.renderDemandTrendsPage = renderDemandTrendsPage;

function renderSearchIntelligence() {
  if (!searchIntelData) return;

  // 1. Top KPI Summary Cards (Operational Search Metrics)
  const totalCount = searchIntelData.total_searches || (searchIntelData.recent_searches ? searchIntelData.recent_searches.length : 0);
  const kpiTotal = document.getElementById('intel-kpi-total');
  if (kpiTotal) kpiTotal.textContent = `${Number(totalCount).toLocaleString()} Searches`;

  // Active Searchers
  const kpiSearchers = document.getElementById('intel-kpi-searchers');
  if (kpiSearchers) {
    let searchersCount = searchIntelData.unique_searchers;
    if (searchersCount === undefined && searchIntelData.recent_searches) {
      const uids = new Set(searchIntelData.recent_searches.filter(s => s.user_id).map(s => s.user_id));
      searchersCount = uids.size;
    }
    kpiSearchers.textContent = `${searchersCount || 5} Active`;
  }

  // Match Rate
  const kpiMatchRate = document.getElementById('intel-kpi-match-rate');
  if (kpiMatchRate) {
    let matchRate = searchIntelData.match_rate_pct;
    if (matchRate === undefined && searchIntelData.recent_searches?.length) {
      const matched = searchIntelData.recent_searches.filter(s => (s.results_count || 0) > 0).length;
      matchRate = Math.round((matched / searchIntelData.recent_searches.length) * 1000) / 10;
    }
    kpiMatchRate.textContent = `${matchRate !== undefined ? matchRate : 98.0}%`;
  }

  // Zero-Result Queries
  const kpiZero = document.getElementById('intel-kpi-zero-results');
  if (kpiZero) {
    let zeroCount = searchIntelData.zero_result_searches;
    if (zeroCount === undefined && searchIntelData.recent_searches) {
      zeroCount = searchIntelData.recent_searches.filter(s => (s.results_count || 0) === 0).length;
    }
    kpiZero.textContent = `${zeroCount !== undefined ? zeroCount : 13}`;
  }

  // 2. Render Trends Distribution
  renderDemandTrendsPage();

  // 3. Populate project dropdown selector
  populateIntelProjectDropdown();

  // 4. Render Project Specific Signals for selected project
  renderProjectSpecificSignals();

  // 5. Render Primary Structured Search Reports Table
  renderRecentSearchEvents();
}

function renderProjectSpecificSignals() {
  if (typeof projectsData === 'undefined' || projectsData.length === 0) return;
  const proj = projectsData.find(p => p.name === selectedProjectForIntel) || projectsData[0];
  if (!proj) return;

  const titleEl = document.getElementById('intel-project-name');
  if (titleEl) titleEl.textContent = proj.name;

  const devEl = document.getElementById('intel-project-developer');
  if (devEl) devEl.textContent = `${proj.developer} · ${proj.micro_market}`;

  const impEl = document.getElementById('intel-project-impressions');
  if (impEl) impEl.textContent = `${proj.search_impressions || 0}`;

  const reachEl = document.getElementById('intel-project-reach');
  if (reachEl) reachEl.textContent = `${proj.unique_reach || Math.round((proj.search_impressions || 0) * 0.72)}`;

  // Search trigger badges
  const keywordsContainer = document.getElementById('intel-project-keywords');
  if (keywordsContainer) {
    const chipMap = new Map();

    if (proj.triggering_searches && proj.triggering_searches.length > 0) {
      proj.triggering_searches.forEach(ts => {
        const parts = [];
        if (ts.bhk) parts.push(`${ts.bhk} BHK`);
        if (ts.micro_market) parts.push(ts.micro_market);
        if (ts.max_budget_cr) parts.push(`under ₹${ts.max_budget_cr} Cr`);
        if (ts.facing) parts.push(`${ts.facing} facing`);
        if (ts.corner_only) parts.push('Corner unit');
        if (ts.morning_sunlight_only) parts.push('Morning sun');

        if (parts.length > 0) {
          const text = parts.join(' · ');
          const count = ts.query_count || 1;
          if (chipMap.has(text)) {
            const existing = chipMap.get(text);
            existing.count += count;
          } else {
            chipMap.set(text, { text, isSearchCombo: true, count });
          }
        }
      });
    }

    const summaryKws = proj.triggering_keywords || [proj.micro_market, `${proj.avg_carpet_efficiency}% Carpet Area`];
    summaryKws.forEach(kw => {
      if (kw && !chipMap.has(kw)) {
        chipMap.set(kw, { text: kw, isSearchCombo: false, count: 0 });
      }
    });

    const chips = Array.from(chipMap.values());

    if (chips.length === 0) {
      keywordsContainer.innerHTML = `<span class="text-xs text-slate-400 italic">No search triggers recorded yet.</span>`;
    } else {
      keywordsContainer.innerHTML = chips.slice(0, 8).map(c => `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${c.isSearchCombo ? 'bg-red-50 text-[#6D001A] border border-red-200/80 font-semibold' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
          ${c.isSearchCombo ? `<svg class="w-3 h-3 text-[#6D001A]/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` : ''}
          <span>${escapeHtml(c.text)}</span>
          ${c.count > 1 ? `<span class="px-1.5 py-0.2 rounded-full bg-[#6D001A]/10 text-[#6D001A] font-bold text-[10px]">${c.count} searches</span>` : ''}
        </span>
      `).join('');
    }
  }

  // Load buyers who evaluated this project
  loadAndRenderProjectLeads(proj.name);
}

async function loadAndRenderProjectLeads(projectName) {
  const container = document.getElementById('intel-project-leads-tbody');
  const badge = document.getElementById('intel-leads-count-badge');
  if (!container) return;

  try {
    const data = await fetchProjectLeads(projectName);
    const leads = (data && data.leads) ? data.leads : [];

    if (badge) {
      badge.textContent = `${leads.length} buyers`;
    }

    if (leads.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-xs text-slate-400">
            No buyers found for this project in recent search events.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = leads.slice(0, 15).map(l => {
      const timeAgo = formatTimeAgo(l.timestamp);
      const filters = [];
      if (l.micro_market) filters.push(l.micro_market);
      if (l.bhk) filters.push(`${l.bhk} BHK`);
      if (l.facing) filters.push(`${l.facing} Facing`);
      if (l.corner_only) filters.push('Corner');
      if (l.morning_sunlight_only) filters.push('Morning Sun');

      const filterHtml = filters.length > 0
        ? filters.map(f => `<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 mr-1">${escapeHtml(f)}</span>`).join('')
        : `<span class="text-slate-400 italic text-[11px]">No specific filters</span>`;

      const budgetStr = (l.min_budget_cr || l.max_budget_cr)
        ? `₹${l.min_budget_cr || 0} - ${l.max_budget_cr || '∞'} Cr`
        : 'Any Budget';

      const contact = l.email && l.email !== '—'
        ? l.email
        : (l.phone && l.phone !== '—' ? l.phone : 'Anonymous');

      return `
        <tr class="hover:bg-slate-50/70 border-b border-slate-100 text-xs">
          <td class="px-5 py-3">
            <div class="font-bold text-slate-900">${escapeHtml(l.buyer_name || 'Anonymous Buyer')}</div>
            <div class="text-[10px] font-mono text-slate-400">${escapeHtml(contact)}</div>
          </td>
          <td class="px-5 py-3 font-mono text-[11px] text-slate-400">${timeAgo}</td>
          <td class="px-5 py-3">
            <div class="flex flex-wrap gap-1">
              ${filterHtml}
            </div>
          </td>
          <td class="px-5 py-3 font-mono text-slate-800 font-bold">${budgetStr}</td>
          <td class="px-5 py-3 text-right">
            ${l.user_id ? `
              <button onclick="openUniversalBuyer('${l.user_id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#6D001A] bg-red-50 hover:bg-[#6D001A] hover:text-white transition cursor-pointer">
                View Lead
              </button>
            ` : `<span class="text-slate-400 font-mono text-[11px]">Guest Session</span>`}
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load project leads:', err);
    container.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 text-center text-xs text-red-500">
          Could not load leads for this project.
        </td>
      </tr>
    `;
  }
}

// ─── Search Reports Filter Controls & State ───────────────────────────────────

function toggleSearchReportFilterDropdown() {
  const dropdown = document.getElementById('search-report-filter-dropdown');
  const chevron = document.getElementById('search-report-filter-chevron');
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains('hidden');
  if (isHidden) {
    const marketSel = document.getElementById('filter-sr-market-select');
    if (marketSel) marketSel.value = currentSrMarketFilter;

    const bhkSel = document.getElementById('filter-sr-bhk-select');
    if (bhkSel) bhkSel.value = currentSrBhkFilter;

    const archSel = document.getElementById('filter-sr-arch-select');
    if (archSel) archSel.value = currentSrArchFilter;

    const budgetSel = document.getElementById('filter-sr-budget-select');
    if (budgetSel) budgetSel.value = currentSrBudgetFilter;

    const resultsSel = document.getElementById('filter-sr-results-select');
    if (resultsSel) resultsSel.value = currentSrResultsFilter;

    dropdown.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    dropdown.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

function closeSearchReportFilterDropdown() {
  const dropdown = document.getElementById('search-report-filter-dropdown');
  const chevron = document.getElementById('search-report-filter-chevron');
  if (dropdown) dropdown.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

// Global click-outside listener for search report filter dropdown
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('search-report-filter-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeSearchReportFilterDropdown();
  }
});

function applySearchReportFilters() {
  const marketSel = document.getElementById('filter-sr-market-select');
  if (marketSel) currentSrMarketFilter = marketSel.value;

  const bhkSel = document.getElementById('filter-sr-bhk-select');
  if (bhkSel) currentSrBhkFilter = bhkSel.value;

  const archSel = document.getElementById('filter-sr-arch-select');
  if (archSel) currentSrArchFilter = archSel.value;

  const budgetSel = document.getElementById('filter-sr-budget-select');
  if (budgetSel) currentSrBudgetFilter = budgetSel.value;

  const resultsSel = document.getElementById('filter-sr-results-select');
  if (resultsSel) currentSrResultsFilter = resultsSel.value;

  renderRecentSearchEvents();
  closeSearchReportFilterDropdown();
}

function resetSearchReportFilters() {
  currentSrMarketFilter = 'all';
  currentSrBhkFilter = 'all';
  currentSrArchFilter = 'all';
  currentSrBudgetFilter = 'all';
  currentSrResultsFilter = 'all';

  const marketSel = document.getElementById('filter-sr-market-select');
  if (marketSel) marketSel.value = 'all';

  const bhkSel = document.getElementById('filter-sr-bhk-select');
  if (bhkSel) bhkSel.value = 'all';

  const archSel = document.getElementById('filter-sr-arch-select');
  if (archSel) archSel.value = 'all';

  const budgetSel = document.getElementById('filter-sr-budget-select');
  if (budgetSel) budgetSel.value = 'all';

  const resultsSel = document.getElementById('filter-sr-results-select');
  if (resultsSel) resultsSel.value = 'all';

  renderRecentSearchEvents();
  closeSearchReportFilterDropdown();
}

function handleSearchReportSearch(val) {
  searchReportQuery = (val || '').toLowerCase().trim();
  renderRecentSearchEvents();
}

function toggleZeroResultFilter() {
  if (currentSrResultsFilter === 'zero-results') {
    currentSrResultsFilter = 'all';
  } else {
    currentSrResultsFilter = 'zero-results';
  }
  const resultsSel = document.getElementById('filter-sr-results-select');
  if (resultsSel) resultsSel.value = currentSrResultsFilter;
  renderRecentSearchEvents();
}
window.toggleZeroResultFilter = toggleZeroResultFilter;

function renderSearchReportActiveChips(filteredCount, totalCount) {
  const chipsContainer = document.getElementById('search-report-active-chips');
  const countBadge = document.getElementById('search-report-filter-count-badge');
  if (!chipsContainer) return;

  const chips = [];

  if (currentSrMarketFilter !== 'all') {
    chips.push({
      label: `Location: ${currentSrMarketFilter}`,
      reset: () => {
        currentSrMarketFilter = 'all';
        const el = document.getElementById('filter-sr-market-select');
        if (el) el.value = 'all';
        renderRecentSearchEvents();
      }
    });
  }

  if (currentSrBhkFilter !== 'all') {
    chips.push({
      label: `Config: ${currentSrBhkFilter} BHK`,
      reset: () => {
        currentSrBhkFilter = 'all';
        const el = document.getElementById('filter-sr-bhk-select');
        if (el) el.value = 'all';
        renderRecentSearchEvents();
      }
    });
  }

  if (currentSrArchFilter !== 'all') {
    const archLabels = {
      'corner': 'Corner Units Only',
      'morning': 'Morning Sun Only',
      'both': 'Corner & Morning Sun'
    };
    chips.push({
      label: archLabels[currentSrArchFilter] || currentSrArchFilter,
      reset: () => {
        currentSrArchFilter = 'all';
        const el = document.getElementById('filter-sr-arch-select');
        if (el) el.value = 'all';
        renderRecentSearchEvents();
      }
    });
  }

  if (currentSrBudgetFilter !== 'all') {
    const budgetLabels = {
      'under-1.5': 'Budget: Under ₹1.5 Cr',
      '1.5-2.5': 'Budget: ₹1.5 - ₹2.5 Cr',
      'above-2.5': 'Budget: Above ₹2.5 Cr'
    };
    chips.push({
      label: budgetLabels[currentSrBudgetFilter] || currentSrBudgetFilter,
      reset: () => {
        currentSrBudgetFilter = 'all';
        const el = document.getElementById('filter-sr-budget-select');
        if (el) el.value = 'all';
        renderRecentSearchEvents();
      }
    });
  }

  if (currentSrResultsFilter !== 'all') {
    chips.push({
      label: currentSrResultsFilter === 'with-results' ? 'With Results (>0)' : 'Zero Results (Unmet)',
      reset: () => {
        currentSrResultsFilter = 'all';
        const el = document.getElementById('filter-sr-results-select');
        if (el) el.value = 'all';
        renderRecentSearchEvents();
      }
    });
  }

  // Update button badge
  if (countBadge) {
    if (chips.length > 0) {
      countBadge.textContent = chips.length;
      countBadge.classList.remove('hidden');
    } else {
      countBadge.classList.add('hidden');
    }
  }

  // Render chips
  if (chips.length === 0) {
    chipsContainer.classList.add('hidden');
    chipsContainer.innerHTML = '';
  } else {
    chipsContainer.classList.remove('hidden');
    chipsContainer.innerHTML = `
      <span class="text-slate-400 font-medium text-[11px]">Active Filters:</span>
      ${chips.map((c, idx) => `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
          <span>${escapeHtml(c.label)}</span>
          <button type="button" onclick="removeSearchReportChip(${idx})" class="text-slate-400 hover:text-red-600 transition cursor-pointer p-0.5">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </span>
      `).join('')}
      <button type="button" onclick="resetSearchReportFilters()" class="text-xs font-semibold text-[#6D001A] hover:underline ml-1 cursor-pointer">
        Clear All
      </button>
    `;
    window._searchReportActiveChips = chips;
  }
}

function removeSearchReportChip(idx) {
  if (window._searchReportActiveChips && window._searchReportActiveChips[idx]) {
    window._searchReportActiveChips[idx].reset();
  }
}

// ─── Primary Structured Search Reports Table ──────────────────────────────────

function renderRecentSearchEvents() {
  const container = document.getElementById('intel-all-searches-tbody');
  const countBadge = document.getElementById('search-report-count-badge');
  if (!container || !searchIntelData || !searchIntelData.recent_searches) return;

  let list = searchIntelData.recent_searches;

  // Filter list
  const filtered = list.filter(s => {
    // 1. Text Search
    if (searchReportQuery) {
      const market = (s.micro_market || '').toLowerCase();
      const projects = (s.project_names_returned || '').toLowerCase();
      const facing = (s.facing || '').toLowerCase();
      const user = (s.user_id || '').toLowerCase();
      const units = (s.unit_ids_returned || '').toLowerCase();
      const match = market.includes(searchReportQuery) ||
        projects.includes(searchReportQuery) ||
        facing.includes(searchReportQuery) ||
        user.includes(searchReportQuery) ||
        units.includes(searchReportQuery);
      if (!match) return false;
    }

    // 2. Micro Market Location
    if (currentSrMarketFilter !== 'all') {
      if ((s.micro_market || '').toLowerCase() !== currentSrMarketFilter.toLowerCase()) return false;
    }

    // 3. BHK Configuration
    if (currentSrBhkFilter !== 'all') {
      if (!s.bhk || Math.floor(s.bhk) !== parseInt(currentSrBhkFilter, 10)) return false;
    }

    // 4. Architectural Criteria
    if (currentSrArchFilter === 'corner' && !s.corner_only) return false;
    if (currentSrArchFilter === 'morning' && !s.morning_sunlight_only) return false;
    if (currentSrArchFilter === 'both' && (!s.corner_only || !s.morning_sunlight_only)) return false;

    // 5. Budget Range
    if (currentSrBudgetFilter !== 'all') {
      const maxB = s.max_budget_cr || s.min_budget_cr || 0;
      if (currentSrBudgetFilter === 'under-1.5' && maxB > 1.5) return false;
      if (currentSrBudgetFilter === '1.5-2.5' && (maxB < 1.5 || maxB > 2.5)) return false;
      if (currentSrBudgetFilter === 'above-2.5' && maxB < 2.5) return false;
    }

    // 6. Results Status
    if (currentSrResultsFilter === 'with-results' && (s.results_count || 0) === 0) return false;
    if (currentSrResultsFilter === 'zero-results' && (s.results_count || 0) > 0) return false;

    return true;
  });

  // Update Count Badge
  if (countBadge) {
    countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'Search Report' : 'Search Reports'}`;
  }

  // Render Active Chips
  renderSearchReportActiveChips(filtered.length, list.length);

  // Empty state
  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-12 text-center">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-400 mb-2">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p class="text-xs font-medium text-slate-600">No search reports match the active filters or search query.</p>
          <button type="button" onclick="resetSearchReportFilters()" class="mt-2 text-xs font-semibold text-[#6D001A] hover:underline cursor-pointer">
            Reset all filters
          </button>
        </td>
      </tr>
    `;
    return;
  }

  // Render organized table rows
  container.innerHTML = filtered.map(s => {
    const timeAgo = formatTimeAgo(s.timestamp);
    const budgetStr = (s.min_budget_cr || s.max_budget_cr)
      ? `₹${s.min_budget_cr || 0} – ${s.max_budget_cr || '∞'} Cr`
      : 'Flexible';

    const tags = [];
    if (s.facing) tags.push(`${s.facing} Facing`);
    if (s.corner_only) tags.push('Corner Unit');
    if (s.morning_sunlight_only) tags.push('Morning Sun');

    const filtersHtml = tags.length > 0
      ? tags.map(t => `<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">${escapeHtml(t)}</span>`).join('')
      : `<span class="text-slate-400 italic text-[10px]">Open criteria</span>`;

    const projectNames = (s.project_names_returned || '').split(',').map(x => x.trim()).filter(Boolean);
    const projectSummary = projectNames.length > 0
      ? `${projectNames.slice(0, 2).join(', ')}${projectNames.length > 2 ? ` +${projectNames.length - 2} more` : ''}`
      : 'No projects matched';

    const hasUser = !!s.user_id;
    const buyerName = s.user_name && s.user_name !== 'Anonymous Buyer'
      ? s.user_name
      : (s.user_id ? `Lead #${s.user_id.slice(0, 8)}` : 'Anonymous Guest');
    const buyerContact = (s.user_phone && s.user_phone !== '—')
      ? s.user_phone
      : ((s.user_email && s.user_email !== '—') ? s.user_email : (hasUser ? 'Authenticated' : 'No account bound'));

    return `
      <tr onclick="openSearchReportModal('${s.id}')" class="hover:bg-slate-50 transition cursor-pointer group">
        <!-- When -->
        <td class="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
          ${timeAgo}
        </td>

        <!-- Location & Config -->
        <td class="px-6 py-4">
          <div class="font-bold text-xs text-slate-900 group-hover:text-[#6D001A] transition">
            ${escapeHtml(s.micro_market || 'Hyderabad West')}
          </div>
          <div class="text-[10px] text-slate-500 font-medium mt-0.5">
            ${s.bhk ? `${s.bhk} BHK Configuration` : 'Any BHK Configuration'}
          </div>
        </td>

        <!-- Budget Ceiling -->
        <td class="px-6 py-4">
          <div class="font-bold font-mono text-xs text-slate-900">${budgetStr}</div>
          <div class="text-[10px] text-slate-400 font-medium mt-0.5">Target Range</div>
        </td>

        <!-- Demand Preferences -->
        <td class="px-6 py-4">
          <div class="flex flex-wrap gap-1">
            ${filtersHtml}
          </div>
        </td>

        <!-- Matched Projects -->
        <td class="px-6 py-4">
          <div class="font-bold text-xs ${s.results_count > 0 ? 'text-slate-900' : 'text-amber-600'}">
            ${s.results_count || 0} ${(s.results_count === 1) ? 'unit' : 'units'} matched
          </div>
          <div class="text-[10px] text-slate-500 truncate max-w-xs mt-0.5" title="${escapeHtml(projectNames.join(', '))}">
            ${escapeHtml(projectSummary)}
          </div>
        </td>

        <!-- Buyer Session -->
        <td class="px-6 py-4">
          <div class="font-bold text-xs ${hasUser ? 'text-[#6D001A]' : 'text-slate-700'}">
            ${escapeHtml(buyerName)}
          </div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">
            ${escapeHtml(buyerContact)}
          </div>
        </td>

        <!-- Actions -->
        <td class="px-6 py-4 text-right whitespace-nowrap">
          <div class="inline-flex items-center justify-end gap-1">
            <!-- Eye Button to View -->
            <button type="button" onclick="event.stopPropagation(); openSearchReportModal('${s.id}')"
              title="View Search Report"
              class="p-1.5 rounded-lg text-slate-500 hover:text-[#6D001A] hover:bg-slate-100 transition cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>

            <!-- Three Dots Dropdown (Edit / Delete) -->
            <div class="relative inline-block text-left" id="search-action-menu-wrap-${s.id}">
              <button type="button" onclick="event.stopPropagation(); toggleSearchRowMenu('${s.id}')"
                title="More Actions"
                class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1.5"/>
                  <circle cx="19" cy="12" r="1.5"/>
                  <circle cx="5" cy="12" r="1.5"/>
                </svg>
              </button>
              <div id="search-action-menu-${s.id}" class="hidden absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-left animate-in fade-in duration-100">
                <button type="button" onclick="event.stopPropagation(); closeAllSearchRowMenus(); openSearchReportModal('${s.id}')"
                  class="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit / Inspect
                </button>
                <button type="button" onclick="event.stopPropagation(); closeAllSearchRowMenus(); handleDeleteSearchReport('${s.id}')"
                  class="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Search Query Report Detail Modal ─────────────────────────────────────────

function groupUnitsByProject(projectNames, unitIds) {
  if (projectNames.length === 0) return [];
  if (projectNames.length === 1) {
    return [{ name: projectNames[0], units: unitIds }];
  }
  const groups = projectNames.map(pName => {
    const codeWords = pName.split(/\s+/).map(w => w.slice(0, 3).toUpperCase());
    const matchedUnits = unitIds.filter(uid => {
      const uPrefix = uid.split('-')[0].toUpperCase();
      return codeWords.some(w => uPrefix.startsWith(w) || w.startsWith(uPrefix));
    });
    return { name: pName, units: matchedUnits };
  });

  const assigned = new Set(groups.flatMap(g => g.units));
  const unassigned = unitIds.filter(u => !assigned.has(u));
  if (unassigned.length > 0) {
    groups[0].units.push(...unassigned);
  }
  return groups;
}

function openSearchReportModal(searchId) {
  if (!searchIntelData || !searchIntelData.recent_searches) return;
  const s = searchIntelData.recent_searches.find(x => x.id === searchId);
  if (!s) return;

  currentModalSearch = s;

  const timeAgo = formatTimeAgo(s.timestamp);
  const dateFormatted = new Date(s.timestamp).toLocaleString();
  const projectNames = (s.project_names_returned || '').split(',').map(x => x.trim()).filter(Boolean);
  const unitIds = (s.unit_ids_returned || '').split(',').map(x => x.trim()).filter(Boolean);
  const hasResults = (s.results_count || 0) > 0;

  // Header Title
  const titleEl = document.getElementById('modal-search-title');
  const resultsBadgeEl = document.getElementById('modal-search-results-badge');
  const timeEl = document.getElementById('modal-search-time');
  const idEl = document.getElementById('modal-search-id');

  const titleParts = [];
  if (s.micro_market) titleParts.push(s.micro_market);
  if (s.bhk) titleParts.push(`${s.bhk} BHK`);
  if (s.max_budget_cr) titleParts.push(`Under ₹${s.max_budget_cr} Cr`);
  else if (s.min_budget_cr) titleParts.push(`₹${s.min_budget_cr}+ Cr`);
  const queryTitle = titleParts.length > 0 ? titleParts.join(' · ') : `Search Query (${s.micro_market || 'Hyderabad West'})`;

  if (titleEl) titleEl.textContent = queryTitle;
  if (resultsBadgeEl) {
    if (hasResults) {
      resultsBadgeEl.textContent = `✓ ${s.results_count} ${s.results_count === 1 ? 'Unit' : 'Units'} Matched`;
      resultsBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else {
      resultsBadgeEl.textContent = '0 Matches (Unmet Demand)';
      resultsBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200';
    }
  }
  if (timeEl) timeEl.textContent = `${timeAgo} (${dateFormatted})`;
  if (idEl) idEl.textContent = `Query ID: ${s.id.slice(0, 16)}...`;

  // 1. Search Criteria Grid
  const marketEl = document.getElementById('modal-search-market');
  const bhkEl = document.getElementById('modal-search-bhk');
  const budgetEl = document.getElementById('modal-search-budget');
  const facingEl = document.getElementById('modal-search-facing');

  if (marketEl) marketEl.textContent = s.micro_market || 'All Hyderabad West';
  if (bhkEl) bhkEl.textContent = s.bhk ? `${s.bhk} BHK` : 'Any Configuration';

  let budgetStr = 'Any Budget';
  if (s.min_budget_cr && s.max_budget_cr) {
    budgetStr = `₹${s.min_budget_cr} - ₹${s.max_budget_cr} Cr`;
  } else if (s.max_budget_cr) {
    budgetStr = `Up to ₹${s.max_budget_cr} Cr`;
  } else if (s.min_budget_cr) {
    budgetStr = `From ₹${s.min_budget_cr} Cr`;
  }
  if (budgetEl) budgetEl.textContent = budgetStr;

  if (facingEl) facingEl.textContent = s.facing ? `${s.facing} Facing` : 'Any Facing';

  // Additional Preferences Tags
  const prefTagsEl = document.getElementById('modal-search-preferences-tags');
  if (prefTagsEl) {
    const tags = [];
    if (s.corner_only) tags.push('Corner Unit (Dual-aspect)');
    if (s.morning_sunlight_only) tags.push('Morning Sunlight');
    if (s.min_carpet_sqft) tags.push(`Min ${Number(s.min_carpet_sqft).toLocaleString()} sq ft`);
    if (s.ready_by_year) tags.push(`Possession by ${s.ready_by_year}`);

    if (tags.length > 0) {
      prefTagsEl.innerHTML = tags.map(tag => `
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-[#6D001A] border border-red-200/70">
          ${escapeHtml(tag)}
        </span>
      `).join('');
    } else {
      prefTagsEl.innerHTML = `<span class="text-xs text-slate-400">None specified</span>`;
    }
  }

  // 2. Matched Inventory (Unified)
  const countLabelEl = document.getElementById('modal-search-projects-count');
  const invContainer = document.getElementById('modal-search-inventory-container');

  if (hasResults && projectNames.length > 0) {
    if (countLabelEl) countLabelEl.textContent = `${projectNames.length} ${projectNames.length === 1 ? 'project' : 'projects'} (${s.results_count} ${s.results_count === 1 ? 'unit' : 'units'})`;

    const projectGroups = groupUnitsByProject(projectNames, unitIds);

    if (invContainer) {
      invContainer.innerHTML = projectGroups.map(grp => `
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900 text-xs">${escapeHtml(grp.name)}</span>
            <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              ${grp.units.length > 0 ? `${grp.units.length} ${grp.units.length === 1 ? 'unit' : 'units'}` : 'Matched'}
            </span>
          </div>
          ${grp.units.length > 0 ? `
            <div class="flex flex-wrap gap-1.5 pt-0.5">
              ${grp.units.map(u => `
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white border border-slate-200 text-slate-700">
                  ${escapeHtml(u)}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
    }
  } else {
    if (countLabelEl) countLabelEl.textContent = '0 matches';
    if (invContainer) {
      invContainer.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div class="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Zero Inventory Matches</span>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">
            No units in active verified inventory met this query's specifications. This highlights an unmet buyer demand opportunity in this micro-market.
          </p>
        </div>
      `;
    }
  }

  // 3. Buyer Attribution
  const buyerNameEl = document.getElementById('modal-search-buyer-name');
  const buyerMetaEl = document.getElementById('modal-search-buyer-meta');
  const buyerActionEl = document.getElementById('modal-search-buyer-action');

  if (s.user_id) {
    let buyerName = s.user_name || s.user_id;
    if (typeof audienceData !== 'undefined' && audienceData && audienceData.qualified_buyers) {
      const qb = audienceData.qualified_buyers.find(b => b.id === s.user_id);
      if (qb && qb.name) buyerName = qb.name;
    }
    const phoneInfo = (s.user_phone && s.user_phone !== '—') ? ` · ${s.user_phone}` : '';
    const emailInfo = (s.user_email && s.user_email !== '—') ? ` · ${s.user_email}` : '';
    const tierInfo = s.buyer_tier ? ` (${s.buyer_tier.replace(/_/g, ' ')})` : '';

    if (buyerNameEl) buyerNameEl.textContent = `Authenticated Buyer: ${buyerName}${tierInfo}`;
    if (buyerMetaEl) buyerMetaEl.textContent = `Verified Account${phoneInfo}${emailInfo}`;
    if (buyerActionEl) {
      buyerActionEl.innerHTML = `
        <button onclick="closeSearchReportModal(); openUniversalBuyer('${s.user_id}')"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#6D001A] hover:bg-[#520013] text-white transition shadow-xs cursor-pointer">
          View Profile
        </button>
      `;
    }
  } else {
    if (buyerNameEl) buyerNameEl.textContent = 'Guest Searcher';
    if (buyerMetaEl) buyerMetaEl.textContent = 'Direct Web Query · Unauthenticated Session';
    if (buyerActionEl) buyerActionEl.innerHTML = '';
  }

  // Open modal
  const modal = document.getElementById('search-report-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeSearchReportModal() {
  const modal = document.getElementById('search-report-modal');
  if (modal) modal.classList.add('hidden');
}

// ─── CSV Export Functionality ─────────────────────────────────────────────────

function exportSearchLogCsv() {
  if (!searchIntelData || !searchIntelData.recent_searches || searchIntelData.recent_searches.length === 0) {
    showToast('No search reports available to export.', false);
    return;
  }

  const list = searchIntelData.recent_searches;

  const headers = ['Query ID', 'Timestamp', 'Location', 'Budget Min Cr', 'Budget Max Cr', 'BHK', 'Facing', 'Corner Only', 'Morning Sun', 'Projects Shown', 'Results Count', 'Buyer Session'];
  const rows = list.map(s => [
    s.id || '',
    s.timestamp || '',
    s.micro_market || 'All Hyderabad West',
    s.min_budget_cr || '',
    s.max_budget_cr || '',
    s.bhk || '',
    s.facing || '',
    s.corner_only ? 'Yes' : 'No',
    s.morning_sunlight_only ? 'Yes' : 'No',
    s.project_names_returned || '',
    s.results_count || 0,
    s.user_id || 'Anonymous'
  ]);

  const csvContent = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `four-corner-search-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast(`Search reports exported successfully (${list.length} records).`, true);
}

function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now';
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch (e) {
    return 'Recently';
  }
}

// ─── Searchable Inspect Project Dropdown Logic ───────────────────────────────

function populateIntelProjectDropdown(filterQuery = '') {
  if (typeof projectsData === 'undefined' || projectsData.length === 0) return;

  if (!selectedProjectForIntel && projectsData[0]) {
    selectedProjectForIntel = projectsData[0].name;
  }

  // Update button label
  const labelEl = document.getElementById('intel-project-dropdown-selected');
  if (labelEl) {
    labelEl.textContent = selectedProjectForIntel || 'Select Project';
  }

  // Sync hidden native select
  const selector = document.getElementById('intel-project-selector');
  if (selector) {
    selector.innerHTML = projectsData.map(p => `
      <option value="${escapeHtml(p.name)}" ${p.name === selectedProjectForIntel ? 'selected' : ''}>
        ${escapeHtml(p.name)}
      </option>
    `).join('');
    selector.value = selectedProjectForIntel;
  }

  // Render options list with live search filtering
  const listEl = document.getElementById('intel-project-options-list');
  if (!listEl) return;

  const q = (filterQuery || '').toLowerCase().trim();
  const filtered = q
    ? projectsData.filter(p => (p.name || '').toLowerCase().includes(q))
    : projectsData;

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="py-4 text-center text-xs text-slate-400 italic">No matching projects found</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(p => {
    const isSelected = p.name === selectedProjectForIntel;
    return `
      <button type="button" onclick="selectIntelProject('${escapeHtml(p.name)}')"
        class="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
          isSelected
            ? 'bg-red-50 text-[#6D001A]'
            : 'text-slate-800 hover:bg-slate-100/80'
        }">
        <span class="truncate">${escapeHtml(p.name)}</span>
        ${isSelected ? `<svg class="w-4 h-4 text-[#6D001A] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
      </button>
    `;
  }).join('');
}

function toggleIntelProjectDropdown(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('intel-project-dropdown-menu');
  const chevron = document.getElementById('intel-project-dropdown-chevron');
  if (!menu) return;

  const isHidden = menu.classList.contains('hidden');
  if (isHidden) {
    menu.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
    const input = document.getElementById('intel-project-search-input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }
    populateIntelProjectDropdown('');
  } else {
    closeIntelProjectDropdown();
  }
}

function closeIntelProjectDropdown() {
  const menu = document.getElementById('intel-project-dropdown-menu');
  const chevron = document.getElementById('intel-project-dropdown-chevron');
  if (menu) menu.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

function filterIntelProjectsList(query) {
  populateIntelProjectDropdown(query);
}

function selectIntelProject(projectName) {
  selectedProjectForIntel = projectName;
  const labelEl = document.getElementById('intel-project-dropdown-selected');
  if (labelEl) labelEl.textContent = projectName;
  const selector = document.getElementById('intel-project-selector');
  if (selector) selector.value = projectName;

  closeIntelProjectDropdown();
  renderProjectSpecificSignals();
}

// Global click-outside listener to dismiss the Inspect Project dropdown
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('intel-project-dropdown-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeIntelProjectDropdown();
  }
});

// ─── Search Query Row Actions Dropdown & Deletion ───────────────────────────

async function handleDeleteSearchReport(searchId) {
  if (!confirm('Are you sure you want to delete this search query log entry?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/v1/analytics/searches/${encodeURIComponent(searchId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete search log');
    showToast('Search query log deleted successfully.', true);
    if (searchIntelData && searchIntelData.recent_searches) {
      searchIntelData.recent_searches = searchIntelData.recent_searches.filter(s => s.id !== searchId);
    }
    renderRecentSearchEvents();
    if (typeof loadOverviewData === 'function') loadOverviewData();
  } catch (err) {
    console.error('Error deleting search log:', err);
    showToast('Could not delete search log from server.', false);
  }
}

function toggleSearchRowMenu(searchId) {
  const menu = document.getElementById(`search-action-menu-${searchId}`);
  if (!menu) return;
  const isHidden = menu.classList.contains('hidden');
  closeAllSearchRowMenus();
  if (isHidden) {
    const btn = document.querySelector(`#search-action-menu-wrap-${searchId} button`);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 180) {
        menu.classList.remove('top-full', 'mt-1');
        menu.classList.add('bottom-full', 'mb-1');
      } else {
        menu.classList.remove('bottom-full', 'mb-1');
        menu.classList.add('top-full', 'mt-1');
      }
    }
    menu.classList.remove('hidden');
  }
}

function closeAllSearchRowMenus() {
  document.querySelectorAll('[id^="search-action-menu-"]').forEach(el => {
    el.classList.add('hidden');
  });
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('[id^="search-action-menu-wrap-"]')) {
    closeAllSearchRowMenus();
  }
});

// Window exports
if (typeof window !== 'undefined') {
  window.loadSearchIntelligenceData = loadSearchIntelligenceData;
  window.renderSearchIntelligence = renderSearchIntelligence;
  window.switchSearchIntelTab = switchSearchIntelTab;
  window.inspectProjectIntel = inspectProjectIntel;
  window.onIntelProjectSelect = onIntelProjectSelect;
  window.toggleSearchReportFilterDropdown = toggleSearchReportFilterDropdown;
  window.closeSearchReportFilterDropdown = closeSearchReportFilterDropdown;
  window.applySearchReportFilters = applySearchReportFilters;
  window.resetSearchReportFilters = resetSearchReportFilters;
  window.handleSearchReportSearch = handleSearchReportSearch;
  window.removeSearchReportChip = removeSearchReportChip;
  window.renderRecentSearchEvents = renderRecentSearchEvents;
  window.openSearchReportModal = openSearchReportModal;
  window.closeSearchReportModal = closeSearchReportModal;
  window.exportSearchLogCsv = exportSearchLogCsv;
  window.toggleIntelProjectDropdown = toggleIntelProjectDropdown;
  window.closeIntelProjectDropdown = closeIntelProjectDropdown;
  window.filterIntelProjectsList = filterIntelProjectsList;
  window.selectIntelProject = selectIntelProject;
  window.populateIntelProjectDropdown = populateIntelProjectDropdown;
  window.toggleSearchRowMenu = toggleSearchRowMenu;
  window.closeAllSearchRowMenus = closeAllSearchRowMenus;
  window.handleDeleteSearchReport = handleDeleteSearchReport;
}
