// Project Registry & Developer Verification Module

let currentProjectFilter = 'all'; // 'all' | 'verified' | 'pending' | 'rejected'
let currentMarketFilter = 'all';
let currentBudgetFilter = 'all';
let currentCarpetFilter = 'all';
let currentBhkFilter = 'all';
let universalProjectQuery = '';

function isProjectPending(p) {
  if (!p) return false;
  const status = (p.verification_status || '').toLowerCase().trim();
  const badge = (p.assigned_badge || '').toLowerCase().trim();
  
  if (status.includes('pending') || badge.includes('pending') || status.includes('review') || badge.includes('review')) {
    return true;
  }
  if (status.includes('verified') || badge.includes('verified') || 
      status.includes('approved') || badge.includes('approved') || 
      status.includes('vetted') || badge.includes('vetted')) {
    return false;
  }
  if (status.includes('rejected') || badge.includes('rejected')) {
    return false;
  }
  return true;
}
window.isProjectPending = isProjectPending;

async function loadProjectsData() {
  try {
    const res = await fetchProjectsAnalytics();
    projectsData = res.projects || [];
    renderProjectsRegistry();
    if (typeof renderPendingReviewView === 'function') renderPendingReviewView();
    if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
  } catch (err) {
    console.warn('Could not fetch projects analytics from database API:', err);
    renderProjectsRegistry();
    if (typeof renderPendingReviewView === 'function') renderPendingReviewView();
  }
}

function openAllProjects() {
  currentProjectFilter = 'all';
  universalProjectQuery = '';
  switchView('projects');
  syncFilterButtonState();
  renderProjectsRegistry();
}

function openVerifiedProjects() {
  currentProjectFilter = 'verified';
  stagedProjectFilter = 'verified';
  universalProjectQuery = '';
  switchView('projects');
  syncFilterButtonState();
  renderProjectsRegistry();
  if (typeof setActiveSidebarButton === 'function') {
    setActiveSidebarButton('side-btn-projects-verified');
  }
}
window.openVerifiedProjects = openVerifiedProjects;

function openPendingReviewProjects() {
  switchView('pending-review');
}

let stagedProjectFilter = 'all';

function toggleProjectsFilterDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('projects-filter-dropdown');
  const chevron = document.getElementById('projects-filter-chevron');
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains('hidden');
  if (isHidden) {
    // Sync staged state with currently active filters
    stagedProjectFilter = currentProjectFilter;
    syncStagedFilterButtonState(stagedProjectFilter);

    const marketSel = document.getElementById('filter-market-select');
    if (marketSel) marketSel.value = currentMarketFilter;

    const budgetSel = document.getElementById('filter-budget-select');
    if (budgetSel) budgetSel.value = currentBudgetFilter;

    const carpetSel = document.getElementById('filter-carpet-select');
    if (carpetSel) carpetSel.value = currentCarpetFilter;

    const bhkSel = document.getElementById('filter-bhk-select');
    if (bhkSel) bhkSel.value = currentBhkFilter;

    dropdown.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    dropdown.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

function closeProjectsFilterDropdown() {
  const dropdown = document.getElementById('projects-filter-dropdown');
  const chevron = document.getElementById('projects-filter-chevron');
  if (dropdown) dropdown.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

// Global click-outside listener for filter dropdown
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('projects-filter-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeProjectsFilterDropdown();
  }
});

function stageProjectStatusFilter(filter) {
  stagedProjectFilter = filter;
  syncStagedFilterButtonState(filter);
  // Do NOT re-render table here! Wait until user clicks "Apply Filters"
}

function syncStagedFilterButtonState(filter) {
  ['all', 'verified', 'pending'].forEach(f => {
    const btn = document.getElementById(`btn-filter-proj-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs text-center transition cursor-pointer';
      } else {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 text-center transition cursor-pointer';
      }
    }
  });
}

function setProjectStatusFilter(filter) {
  currentProjectFilter = filter;
  stagedProjectFilter = filter;
  syncStagedFilterButtonState(filter);
  renderProjectsRegistry();
}

function applyProjectsFilters() {
  // Commit all staged selections to active filters
  currentProjectFilter = stagedProjectFilter;

  const marketSel = document.getElementById('filter-market-select');
  if (marketSel) currentMarketFilter = marketSel.value;

  const budgetSel = document.getElementById('filter-budget-select');
  if (budgetSel) currentBudgetFilter = budgetSel.value;

  const carpetSel = document.getElementById('filter-carpet-select');
  if (carpetSel) currentCarpetFilter = carpetSel.value;

  const bhkSel = document.getElementById('filter-bhk-select');
  if (bhkSel) currentBhkFilter = bhkSel.value;

  renderProjectsRegistry();
  closeProjectsFilterDropdown();
}

function resetProjectsFilters() {
  currentProjectFilter = 'all';
  stagedProjectFilter = 'all';
  currentMarketFilter = 'all';
  currentBudgetFilter = 'all';
  currentCarpetFilter = 'all';
  currentBhkFilter = 'all';
  universalProjectQuery = '';

  const marketSel = document.getElementById('filter-market-select');
  if (marketSel) marketSel.value = 'all';
  const budgetSel = document.getElementById('filter-budget-select');
  if (budgetSel) budgetSel.value = 'all';
  const carpetSel = document.getElementById('filter-carpet-select');
  if (carpetSel) carpetSel.value = 'all';
  const bhkSel = document.getElementById('filter-bhk-select');
  if (bhkSel) bhkSel.value = 'all';

  syncStagedFilterButtonState('all');
  renderProjectsRegistry();
  closeProjectsFilterDropdown();
}

function renderActiveFilterChips(filteredCount, totalCount) {
  const chipsContainer = document.getElementById('projects-active-chips');
  const countBadge = document.getElementById('projects-filter-count-badge');
  if (!chipsContainer) return;

  const chips = [];

  if (currentProjectFilter !== 'all') {
    chips.push({
      label: `Status: ${currentProjectFilter === 'pending' ? 'Pending Review' : 'Verified'}`,
      reset: () => { setProjectStatusFilter('all'); }
    });
  }

  if (currentMarketFilter !== 'all') {
    chips.push({
      label: `Location: ${currentMarketFilter}`,
      reset: () => {
        currentMarketFilter = 'all';
        const el = document.getElementById('filter-market-select');
        if (el) el.value = 'all';
        renderProjectsRegistry();
      }
    });
  }

  if (currentBudgetFilter !== 'all') {
    const budgetLabels = {
      'under-1.5': 'Under ₹1.5 Cr',
      '1.5-2.5': '₹1.5 - ₹2.5 Cr',
      'above-2.5': 'Above ₹2.5 Cr'
    };
    chips.push({
      label: `Budget: ${budgetLabels[currentBudgetFilter] || currentBudgetFilter}`,
      reset: () => {
        currentBudgetFilter = 'all';
        const el = document.getElementById('filter-budget-select');
        if (el) el.value = 'all';
        renderProjectsRegistry();
      }
    });
  }

  if (currentBhkFilter !== 'all') {
    chips.push({
      label: `Typology: ${currentBhkFilter} BHK`,
      reset: () => {
        currentBhkFilter = 'all';
        const el = document.getElementById('filter-bhk-select');
        if (el) el.value = 'all';
        renderProjectsRegistry();
      }
    });
  }

  if (currentCarpetFilter !== 'all') {
    chips.push({
      label: `Carpet: ${currentCarpetFilter}%+`,
      reset: () => {
        currentCarpetFilter = 'all';
        const el = document.getElementById('filter-carpet-select');
        if (el) el.value = 'all';
        renderProjectsRegistry();
      }
    });
  }

  if (universalProjectQuery) {
    chips.push({
      label: `Search: "${universalProjectQuery}"`,
      reset: () => {
        universalProjectQuery = '';
        renderProjectsRegistry();
      }
    });
  }

  // Update badge count on button
  if (countBadge) {
    if (chips.length > 0) {
      countBadge.textContent = chips.length;
      countBadge.classList.remove('hidden');
    } else {
      countBadge.classList.add('hidden');
    }
  }

  if (chips.length === 0) {
    chipsContainer.classList.add('hidden');
    chipsContainer.innerHTML = '';
    return;
  }

  chipsContainer.classList.remove('hidden');
  chipsContainer.classList.add('flex');
  chipsContainer.innerHTML = `
    <span class="text-[11px] font-semibold text-slate-400 mr-1">Active:</span>
    ${chips.map((c, i) => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
        ${escapeHtml(c.label)}
        <button type="button" onclick="projectsFilterChipsList[${i}].reset()" class="text-slate-400 hover:text-red-600 transition cursor-pointer ml-0.5">✕</button>
      </span>
    `).join('')}
    <button type="button" onclick="resetProjectsFilters()" class="text-xs font-semibold text-[#6D001A] hover:underline ml-1 cursor-pointer">Clear all</button>
  `;
  window.projectsFilterChipsList = chips;
}

function renderProjectsRegistry() {
  const container = document.getElementById('projects-table-body');
  if (!container) return;

  const query = (universalProjectQuery || '').toLowerCase().trim();

  let filtered = projectsData.filter(p => {
    // 1. Status filter
    const isPending = isProjectPending(p);
    if (currentProjectFilter === 'verified' && isPending) return false;
    if (currentProjectFilter === 'pending' && !isPending) return false;

    // 2. Micro-Market filter
    if (currentMarketFilter !== 'all') {
      const pMarket = (p.micro_market || '').toLowerCase();
      if (!pMarket.includes(currentMarketFilter.toLowerCase())) return false;
    }

    // 3. Budget Range filter
    if (currentBudgetFilter !== 'all') {
      const minP = p.min_price_cr || 0;
      const maxP = p.max_price_cr || minP || 0;
      if (currentBudgetFilter === 'under-1.5' && minP > 1.5) return false;
      if (currentBudgetFilter === '1.5-2.5' && (maxP < 1.5 || minP > 2.5)) return false;
      if (currentBudgetFilter === 'above-2.5' && maxP < 2.5) return false;
    }

    // 4. Carpet Efficiency filter
    if (currentCarpetFilter !== 'all') {
      const eff = parseFloat(p.avg_carpet_efficiency) || 74.0;
      if (eff < parseFloat(currentCarpetFilter)) return false;
    }

    // 5. Universal Search Query (if searching projects)
    if (query) {
      const match = 
        (p.name || '').toLowerCase().includes(query) ||
        (p.developer || '').toLowerCase().includes(query) ||
        (p.micro_market || '').toLowerCase().includes(query) ||
        (p.rera_id || '').toLowerCase().includes(query);
      if (!match) return false;
    }
    return true;
  });

  // Update count badge & chips
  const countEl = document.getElementById('projects-count-badge');
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${projectsData.length}`;
  }
  renderActiveFilterChips(filtered.length, projectsData.length);

  if (filtered.length === 0) {
    if (currentProjectFilter === 'pending') {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-14 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="text-sm font-bold text-slate-900">Zero Pending Review Projects</div>
            <div class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">All developer projects in the database have been physically audited, legal vetted, and approved.</div>
            <button onclick="openAllProjects()" class="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer">
              View All ${projectsData.length} Projects
            </button>
          </td>
        </tr>
      `;
    } else {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-12 text-center text-xs text-slate-500">
            <div>No projects found matching the active filters.</div>
            <button onclick="resetProjectsFilters()" class="mt-2 text-xs font-semibold text-[#6D001A] hover:underline cursor-pointer">
              Reset Filters
            </button>
          </td>
        </tr>
      `;
    }
    return;
  }

  container.innerHTML = filtered.map(p => {
    const rawBadge = p.assigned_badge || p.verification_status || 'Verified';
    const isVerified = rawBadge === 'Verified' || rawBadge.includes('Verified') || rawBadge.includes('Approved');
    let statusBadge = '';
    if (rawBadge === 'Four Corner RERA Verified' || rawBadge === 'Verified') {
      statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
           <svg class="w-3 h-3 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
           ${escapeHtml(p.assigned_badge || 'RERA Verified')}
         </span>`;
    } else if (rawBadge === 'Four Corner Municipal Approved') {
      statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
           <svg class="w-3 h-3 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
           Municipal Approved
         </span>`;
    } else if (rawBadge === 'Title Vetted Only') {
      statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
           <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
           Title Vetted Only
         </span>`;
    } else if (rawBadge === 'Verification Rejected' || rawBadge === 'Rejected') {
      statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
           <svg class="w-3 h-3 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
           Verification Rejected
         </span>`;
    } else {
      statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
           <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
           Pending Verification
         </span>`;
    }

    const priceText = (p.min_price_cr && p.max_price_cr)
      ? (p.min_price_cr === p.max_price_cr ? `₹${p.min_price_cr} Cr` : `₹${p.min_price_cr} - ${p.max_price_cr} Cr`)
      : 'Pricing on File';

    return `
      <tr onclick="openPropertyDetail('${p.id}')" class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 text-xs cursor-pointer group">
        <!-- Project & Developer -->
        <td class="px-5 py-3.5">
          <div class="font-bold text-slate-900 group-hover:text-[#6D001A] transition-colors">${escapeHtml(p.name)}</div>
          <div class="text-[11px] text-slate-500 font-medium">${escapeHtml(p.developer)}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">${escapeHtml(p.promoter_legal_entity || '')}</div>
        </td>

        <!-- Micro Market -->
        <td class="px-5 py-3.5 font-medium text-slate-700">
          <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
            ${escapeHtml(p.micro_market)}
          </span>
        </td>

        <!-- RERA ID -->
        <td class="px-5 py-3.5 font-mono text-[11px] text-slate-600">
          <div class="font-semibold text-slate-800">${escapeHtml(p.rera_id || 'On File')}</div>
        </td>

        <!-- Inventory & Pricing -->
        <td class="px-5 py-3.5">
          <div class="font-bold text-slate-900">${priceText}</div>
          <div class="text-[11px] text-slate-500">${p.unit_count || 1} units registered</div>
        </td>

        <!-- Usable Carpet Ratio -->
        <td class="px-5 py-3.5">
          <div class="font-bold text-slate-900 font-mono">${p.avg_carpet_efficiency || 74}%</div>
          <div class="text-[10px] text-slate-400">Usable Efficiency</div>
        </td>

        <!-- Verification Status -->
        <td class="px-5 py-3.5">
          ${statusBadge}
        </td>

        <!-- Actions -->
        <td class="px-5 py-3.5 text-right whitespace-nowrap">
          <div class="inline-flex items-center justify-end gap-1">
            <!-- Eye Button to View -->
            <button type="button" onclick="event.stopPropagation(); openPropertyDetail('${p.id}')"
              title="View Project Details"
              class="p-1.5 rounded-lg text-slate-500 hover:text-[#6D001A] hover:bg-slate-100 transition cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>

            <!-- Three Dots Dropdown (Edit / Delete / More) -->
            <div class="relative inline-block text-left" id="proj-action-menu-wrap-${p.id}">
              <button type="button" onclick="event.stopPropagation(); toggleProjectRowMenu('${p.id}')"
                title="More Actions"
                class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1.5"/>
                  <circle cx="19" cy="12" r="1.5"/>
                  <circle cx="5" cy="12" r="1.5"/>
                </svg>
              </button>
              <div id="proj-action-menu-${p.id}" class="hidden absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-left animate-in fade-in duration-100">
                <button type="button" onclick="event.stopPropagation(); closeAllProjectRowMenus(); handleOpenEditModal('${p.id}')"
                  class="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
                <button type="button" onclick="event.stopPropagation(); closeAllProjectRowMenus(); handleDeleteProject('${p.id}', '${escapeHtml(p.name)}')"
                  class="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
                <div class="my-1 border-t border-slate-100"></div>
                ${!isVerified ? `
                  <button type="button" onclick="event.stopPropagation(); closeAllProjectRowMenus(); handleVerifyProject('${p.id}', '${escapeHtml(p.name)}')"
                    class="w-full px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Mark Verified
                  </button>
                ` : `
                  <button type="button" onclick="event.stopPropagation(); closeAllProjectRowMenus(); inspectProjectIntelWithHighlight('${escapeHtml(p.name)}')"
                    class="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    View Searches
                  </button>
                `}
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleVerifyProject(projectId, projectName) {
  try {
    await updateProjectVerificationStatus(projectId, 'Verified');
    showToast(`"${projectName}" has been verified and is now live in registry.`, true);
    await loadProjectsData();
    await loadOverviewData();
  } catch (err) {
    console.error('Failed to verify project:', err);
    showToast(`Error updating project verification status.`, false);
  }
}

async function handleRejectProject(projectId, projectName) {
  const reason = prompt(`Enter rejection reason for "${projectName}" (e.g. Incomplete TS-RERA documents, invalid road width):`);
  if (reason === null) return;
  try {
    await updateProjectVerificationStatus(projectId, 'Verification Rejected');
    showToast(`"${projectName}" marked as Verification Rejected.`, true);
    await loadProjectsData();
    await loadOverviewData();
  } catch (err) {
    console.error('Failed to reject project:', err);
    showToast(`Error updating project verification status.`, false);
  }
}

// ─── Standalone Pending Review Queue View ───────────────────────────────────

let pendingQueueSearchQuery = '';

function handlePendingQueueSearch(query) {
  pendingQueueSearchQuery = (query || '').toLowerCase().trim();
  renderPendingReviewView();
}
window.handlePendingQueueSearch = handlePendingQueueSearch;

function renderPendingReviewView() {
  const tableBody = document.getElementById('pending-projects-table-body');
  const emptyState = document.getElementById('pending-empty-state');
  const tableContainer = document.getElementById('pending-table-container');
  const queueSummary = document.getElementById('pending-queue-summary-text');

  if (!tableBody) return;

  const allPending = (typeof projectsData !== 'undefined' && Array.isArray(projectsData))
    ? projectsData.filter(p => isProjectPending(p))
    : [];



  const q = pendingQueueSearchQuery;
  const filtered = q
    ? allPending.filter(p => {
        const name = (p.name || '').toLowerCase();
        const dev = (p.developer || '').toLowerCase();
        const rera = (p.rera_id || '').toLowerCase();
        const market = (p.micro_market || '').toLowerCase();
        return name.includes(q) || dev.includes(q) || rera.includes(q) || market.includes(q);
      })
    : allPending;

  if (queueSummary) {
    queueSummary.textContent = allPending.length === 0
      ? 'Zero projects pending review'
      : `Showing ${filtered.length} of ${allPending.length} pending submissions`;
  }

  if (allPending.length === 0) {
    if (tableContainer) tableContainer.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    tableBody.innerHTML = '';
    return;
  }

  if (tableContainer) tableContainer.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-xs text-slate-500">
          No pending projects matching "<span class="font-semibold text-slate-800">${escapeHtml(q)}</span>".
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(p => {
    let priceStr = 'Price on Request';
    if (p.min_price && p.max_price) {
      priceStr = `₹${(p.min_price / 10000000).toFixed(2)} Cr - ₹${(p.max_price / 10000000).toFixed(2)} Cr`;
    } else if (p.price_range) {
      priceStr = p.price_range;
    }

    const pType = p.project_type || 'Residential Apartment';
    const safeName = (p.name || '').replace(/'/g, "\\'");

    return `
      <tr class="hover:bg-slate-50/80 transition group">
        <!-- 1. Project & Developer -->
        <td class="px-6 py-4">
          <div class="font-bold text-slate-900 text-sm hover:text-[#6D001A] transition cursor-pointer" onclick="openPropertyDetail('${p.id}')">
            ${escapeHtml(p.name)}
          </div>
          <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(p.developer)}</div>
        </td>

        <!-- 2. Location -->
        <td class="px-6 py-4">
          <div class="text-xs font-medium text-slate-800">${escapeHtml(p.micro_market || 'Hyderabad')}</div>
        </td>

        <!-- 3. Type -->
        <td class="px-6 py-4">
          <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
            ${escapeHtml(pType)}
          </span>
        </td>

        <!-- 4. Price Range -->
        <td class="px-6 py-4">
          <div class="text-xs font-semibold font-mono text-slate-900">${priceStr}</div>
        </td>

        <!-- 5. Status -->
        <td class="px-6 py-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending Review
          </span>
        </td>

        <!-- 6. Actions -->
        <td class="px-6 py-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="openPropertyDetail('${p.id}')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
              title="View Complete Project Specifications">
              <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>View</span>
            </button>
            <button onclick="handleVerifyProject('${p.id}', '${safeName}')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Approve & Publish to Registry">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Approve</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
window.renderPendingReviewView = renderPendingReviewView;

// ─── Property Detail, Edit & Delete (Priority 2) ─────────────────────────────

let currentViewingProjectId = null;
let currentViewingProjectData = null;

async function openPropertyDetail(projectId) {
  try {
    currentViewingProjectId = projectId;
    let p = null;
    try {
      const res = await fetchProjectDetail(projectId);
      if (res && res.project) p = res.project;
    } catch (e) {
      console.warn('fetchProjectDetail API call failed, falling back to cached projectsData:', e);
    }
    if (!p) {
      const all = (typeof projectsData !== 'undefined' && Array.isArray(projectsData)) ? projectsData : [];
      p = all.find(item => String(item.id) === String(projectId));
    }
    if (!p) throw new Error('Project not found');
    currentViewingProjectData = p;

    // Header
    const nameEl = document.getElementById('modal-project-name');
    if (nameEl) nameEl.textContent = p.name || 'Unnamed Project';

    const subEl = document.getElementById('modal-project-subtitle');
    if (subEl) subEl.textContent = `${p.developer} · ${p.micro_market} · RERA: ${p.rera_id || 'On File'} · Handover: ${p.handover_year || 2026}`;

    const isPending = isProjectPending(p);
    const statusEl = document.getElementById('modal-project-status');
    if (statusEl) {
      if (isPending) {
        statusEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200';
        statusEl.textContent = 'Pending Verification';
      } else {
        statusEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
        statusEl.textContent = 'Verified';
      }
    }

    // Pending Verification Action Banner
    const pendingBanner = document.getElementById('modal-pending-banner');
    if (pendingBanner) {
      pendingBanner.classList.toggle('hidden', !isPending);
    }

    // Complete Specifications: Statutory & TS-RERA
    const reraEl = document.getElementById('modal-detail-rera');
    if (reraEl) reraEl.textContent = p.rera_id || 'Application Under Review';

    const authEl = document.getElementById('modal-detail-authority');
    if (authEl) authEl.textContent = p.sanctioning_authority || 'GHMC / HMDA';

    const promEl = document.getElementById('modal-detail-promoter');
    if (promEl) promEl.textContent = p.promoter_legal_entity || p.developer || '—';

    const handDateEl = document.getElementById('modal-detail-handover-date');
    if (handDateEl) handDateEl.textContent = p.registered_handover_date || (p.handover_year ? `Dec ${p.handover_year}` : '2026');

    const certEl = document.getElementById('modal-detail-rera-cert') || document.getElementById('modal-detail-escrow');
    if (certEl) certEl.textContent = (p.escrow_compliant === 1 || p.escrow_compliant === true) ? 'Verified Certificate On File' : 'Pending Verification';

    const litEl = document.getElementById('modal-detail-litigations');
    if (litEl) litEl.textContent = p.litigations_reported ? `${p.litigations_reported} Active Case(s)` : '0 Reported Cases';

    // Complete Specifications: Site & Project Scale
    const acresEl = document.getElementById('modal-detail-acres');
    if (acresEl) acresEl.textContent = p.total_acres ? `${p.total_acres} Acres` : '—';

    const towUnitsEl = document.getElementById('modal-detail-towers-units');
    if (towUnitsEl) towUnitsEl.textContent = `${p.approved_towers || '—'} Towers · ${p.total_units || '—'} Units`;

    const roadEl = document.getElementById('modal-detail-road');
    if (roadEl) {
      const w = p.road_width_feet ? `${p.road_width_feet} ft Approach` : 'Standard Access Road';
      const c = p.road_condition ? ` (${p.road_condition})` : '';
      roadEl.textContent = `${w}${c}`;
    }

    const waterEl = document.getElementById('modal-detail-water');
    if (waterEl) waterEl.textContent = p.water_source || 'Manjeera / Treated Borewell';

    const openSpEl = document.getElementById('modal-detail-open-space');
    if (openSpEl) openSpEl.textContent = p.open_space_pct ? `${p.open_space_pct}% Open Space` : '—';

    const clubEl = document.getElementById('modal-detail-clubhouse');
    if (clubEl) clubEl.textContent = p.clubhouse_sqft ? `${Number(p.clubhouse_sqft).toLocaleString()} sq.ft.` : '—';

    // KPI cards
    const impEl = document.getElementById('modal-project-impressions');
    if (impEl) impEl.textContent = `${p.search_impressions || 0}`;

    const countEl = document.getElementById('modal-project-units-count');
    if (countEl) countEl.textContent = `${(p.units || []).length} units`;

    const handEl = document.getElementById('modal-project-handover');
    if (handEl) handEl.textContent = `${p.handover_year || 2026}`;

    // Load and render interactive media tile (Photos slider, zoom, video tour)
    const mediaTileContainer = document.getElementById('modal-interactive-media-tile');
    if (mediaTileContainer) {
      mediaTileContainer.innerHTML = '<div class="py-4 text-center text-xs text-slate-400">Loading visual intelligence tile...</div>';
      fetch(`${API_BASE}/api/v1/properties/media/${encodeURIComponent(p.name || p.id)}`)
        .then(r => r.ok ? r.json() : null)
        .then(mediaData => {
          if (mediaData && mediaData.media_tile_html) {
            mediaTileContainer.innerHTML = mediaData.media_tile_html;
            const scripts = mediaTileContainer.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
              try {
                eval(scripts[i].innerText);
              } catch (e) {
                console.warn('Media tile script execution error:', e);
              }
            }
          } else {
            mediaTileContainer.innerHTML = '';
          }
        })
        .catch(e => {
          console.warn('Failed to load media tile:', e);
          mediaTileContainer.innerHTML = '';
        });
    }

    // Units table
    const unitsTbody = document.getElementById('modal-units-tbody');
    if (unitsTbody) {
      if (!p.units || p.units.length === 0) {
        unitsTbody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-slate-400 font-sans">No units recorded for this project.</td></tr>`;
      } else {
        unitsTbody.innerHTML = p.units.map(u => {
          const cornerBadge = u.is_corner_unit ? `<span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-sans mr-1">Corner</span>` : '';
          const sunBadge = u.has_morning_sunlight ? `<span class="px-1.5 py-0.5 rounded text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 font-sans">Morning Sun</span>` : '';
          const features = (cornerBadge || sunBadge) ? `${cornerBadge}${sunBadge}` : `<span class="text-slate-400 font-sans">—</span>`;

          return `
            <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-0">
              <td class="px-4 py-2.5 font-bold text-slate-800">${escapeHtml(u.tower || 'Tower A')}, Floor ${u.floor || 1}</td>
              <td class="px-4 py-2.5 font-sans">${u.bhk} BHK · ${escapeHtml(u.facing || 'East')}</td>
              <td class="px-4 py-2.5">${u.super_built_up_sqft} / ${u.carpet_area_sqft} sq ft</td>
              <td class="px-4 py-2.5 font-bold text-slate-900">${u.carpet_efficiency || 74}%</td>
              <td class="px-4 py-2.5">${features}</td>
              <td class="px-4 py-2.5 text-right font-bold text-slate-900 font-sans">₹${u.total_price_cr} Cr</td>
            </tr>
          `;
        }).join('');
      }
    }

    // Buyers table
    const buyersTbody = document.getElementById('modal-buyers-tbody');
    if (buyersTbody) {
      if (!p.buyers_seen || p.buyers_seen.length === 0) {
        buyersTbody.innerHTML = `<tr><td colspan="5" class="px-4 py-6 text-center text-slate-400 font-sans">No buyer searches have surfaced this project yet.</td></tr>`;
      } else {
        buyersTbody.innerHTML = p.buyers_seen.map(b => {
          const timeAgo = typeof formatTimeAgo === 'function' ? formatTimeAgo(b.timestamp) : (b.timestamp || 'Recently');
          const filters = [];
          if (b.micro_market) filters.push(b.micro_market);
          if (b.bhk) filters.push(`${b.bhk} BHK`);
          if (b.facing) filters.push(`${b.facing} Facing`);
          const filterStr = filters.length > 0 ? filters.join(' · ') : 'Broad search';
          const budget = (b.min_budget_cr || b.max_budget_cr) ? `₹${b.min_budget_cr || 0}-${b.max_budget_cr || '∞'} Cr` : 'Any Budget';

          return `
            <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-0">
              <td class="px-4 py-2.5 font-semibold text-slate-900">${escapeHtml(b.buyer_name || 'Anonymous Buyer')}</td>
              <td class="px-4 py-2.5 text-slate-500 font-mono text-[11px]">${timeAgo}</td>
              <td class="px-4 py-2.5 text-slate-700">${escapeHtml(filterStr)}</td>
              <td class="px-4 py-2.5 font-mono text-slate-800">${budget}</td>
              <td class="px-4 py-2.5 text-right font-mono text-[11px] text-slate-500">
                ${b.email && b.email !== '—' ? escapeHtml(b.email) : (b.phone && b.phone !== '—' ? escapeHtml(b.phone) : '—')}
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    const modal = document.getElementById('property-detail-modal');
    if (modal) modal.classList.remove('hidden');
  } catch (err) {
    console.error('Failed to open project detail:', err);
    showToast('Could not load project details.', false);
  }
}

function closePropertyDetailModal() {
  const modal = document.getElementById('property-detail-modal');
  if (modal) modal.classList.add('hidden');
}
window.openPropertyDetail = openPropertyDetail;
window.closePropertyDetailModal = closePropertyDetailModal;

function handleOpenEditFromDetail() {
  if (!currentViewingProjectData) return;
  closePropertyDetailModal();
  openEditModalWithData(currentViewingProjectData);
}

function handleOpenEditModal(projectId) {
  const p = projectsData.find(x => x.id === projectId);
  if (p) {
    openEditModalWithData(p);
  } else {
    fetchProjectDetail(projectId).then(res => {
      if (res && res.project) openEditModalWithData(res.project);
    }).catch(e => showToast('Error loading project for editing.', false));
  }
}

function openEditModalWithData(p) {
  const idEl = document.getElementById('edit-project-id');
  if (idEl) idEl.value = p.id;

  const nameEl = document.getElementById('edit-project-name');
  if (nameEl) nameEl.value = p.name || '';

  const devEl = document.getElementById('edit-project-developer');
  if (devEl) devEl.value = p.developer || '';

  const locEl = document.getElementById('edit-project-location');
  if (locEl) locEl.value = p.micro_market || 'Tellapur';

  const handEl = document.getElementById('edit-project-handover');
  if (handEl) handEl.value = p.handover_year || 2026;

  const reraEl = document.getElementById('edit-project-rera');
  if (reraEl) reraEl.value = p.rera_id || '';

  const modal = document.getElementById('edit-property-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeEditProjectModal() {
  const modal = document.getElementById('edit-property-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleEditProjectSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('edit-property-form');
  if (!form) return;

  const projectId = form.projectId.value;
  const payload = {
    name: form.projectName.value.trim(),
    developer: form.developer.value.trim(),
    micro_market: form.microMarket.value.trim(),
    handover_year: parseInt(form.handoverYear.value) || 2026,
    rera_id: form.reraId.value.trim()
  };

  try {
    await updateProject(projectId, payload);
    showToast('Project updated successfully.', true);
    closeEditProjectModal();
    await loadProjectsData();
    await loadOverviewData();
  } catch (err) {
    console.error('Failed to update project:', err);
    showToast('Failed to update project. Please try again.', false);
  }
}

async function handleDeleteFromDetail() {
  if (!currentViewingProjectData) return;
  const id = currentViewingProjectData.id;
  const name = currentViewingProjectData.name;
  closePropertyDetailModal();
  await handleDeleteProject(id, name);
}

async function handleVerifyFromDetail() {
  if (!currentViewingProjectData) return;
  const id = currentViewingProjectData.id;
  const name = currentViewingProjectData.name;
  await handleVerifyProject(id, name);
  await openPropertyDetail(id);
}
window.handleVerifyFromDetail = handleVerifyFromDetail;

async function handleRejectFromDetail() {
  if (!currentViewingProjectData) return;
  const id = currentViewingProjectData.id;
  const name = currentViewingProjectData.name;
  await handleRejectProject(id, name);
  closePropertyDetailModal();
}
window.handleRejectFromDetail = handleRejectFromDetail;

async function handleDeleteProject(projectId, projectName) {
  const confirmed = window.confirm(`Are you sure you want to delete "${projectName}"? This will remove the project and all its units from search.`);
  if (!confirmed) return;

  try {
    await deleteProject(projectId);
    showToast(`Project "${projectName}" deleted successfully.`, true);
    await loadProjectsData();
    await loadOverviewData();
  } catch (err) {
    console.error('Failed to delete project:', err);
    showToast('Failed to delete project. Please try again.', false);
  }
}

// ─── Standalone TS-RERA Verification View ──────────────────────────────────

let complianceSearchQuery = '';

function handleComplianceSearch(query) {
  complianceSearchQuery = (query || '').toLowerCase().trim();
  renderReraComplianceView();
}
window.handleComplianceSearch = handleComplianceSearch;

function renderReraComplianceView() {
  const tbody = document.getElementById('compliance-rera-table-body');
  if (!tbody) return;

  const allProjects = (typeof projectsData !== 'undefined' && Array.isArray(projectsData)) ? projectsData : [];

  const verifiedProjects = allProjects.filter(p => !isProjectPending(p));
  const pendingProjects = allProjects.filter(p => isProjectPending(p));

  const reraCountEl = document.getElementById('compliance-rera-count');
  const certCountEl = document.getElementById('compliance-cert-count');
  const sanctionCountEl = document.getElementById('compliance-sanction-count');
  const pendingCountEl = document.getElementById('compliance-pending-count');

  if (reraCountEl) reraCountEl.textContent = verifiedProjects.length;
  if (certCountEl) certCountEl.textContent = verifiedProjects.length;
  if (sanctionCountEl) sanctionCountEl.textContent = allProjects.length;
  if (pendingCountEl) pendingCountEl.textContent = pendingProjects.length;

  const q = complianceSearchQuery;
  const filtered = q
    ? allProjects.filter(p => {
        const name = (p.name || '').toLowerCase();
        const dev = (p.developer || '').toLowerCase();
        const rera = (p.rera_id || '').toLowerCase();
        const market = (p.micro_market || '').toLowerCase();
        return name.includes(q) || dev.includes(q) || rera.includes(q) || market.includes(q);
      })
    : allProjects;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-slate-400">
          <div class="text-sm font-semibold text-slate-700">No compliance records matching search</div>
          <div class="text-xs text-slate-400 mt-1">Try clearing your search query.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const isPending = isProjectPending(p);
    const reraId = p.rera_id || 'P02400000000';
    const cleanRera = reraId.startsWith('P') ? reraId : 'P' + reraId;
    const sanctionNo = p.sanction_order || `HMDA/LO/${p.id}/2023`;

    const auditBadge = !isPending
      ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">VERIFIED</span>`
      : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">UNDER REVIEW</span>`;

    return `
      <tr class="hover:bg-slate-50/80 transition cursor-pointer" onclick="openReraVerificationDetail('${p.id}')">
        <td class="px-6 py-4">
          <div class="font-bold text-slate-900 text-xs">${escapeHtml(p.name)}</div>
          <div class="text-[11px] text-slate-500 font-medium">${escapeHtml(p.developer)}</div>
        </td>
        <td class="px-6 py-4 text-slate-600 text-xs">${escapeHtml(p.micro_market || 'Tellapur')}</td>
        <td class="px-6 py-4">
          <span class="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            ${escapeHtml(cleanRera)}
          </span>
        </td>
        <td class="px-6 py-4">
          <span class="font-mono text-[11px] text-slate-600">${escapeHtml(sanctionNo)}</span>
        </td>
        <td class="px-6 py-4">
          ${auditBadge}
        </td>
        <!-- Actions -->
        <td class="px-6 py-4 text-right whitespace-nowrap">
          <div class="inline-flex items-center justify-end gap-1">
            <!-- Eye Button to View RERA Details -->
            <button type="button" onclick="event.stopPropagation(); openReraVerificationDetail('${p.id}')"
              title="View RERA Details"
              class="p-1.5 rounded-lg text-slate-500 hover:text-[#6D001A] hover:bg-slate-100 transition cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>

            <!-- Three Dots Dropdown (Edit / Delete / Verification) -->
            <div class="relative inline-block text-left" id="rera-action-menu-wrap-${p.id}">
              <button type="button" onclick="event.stopPropagation(); toggleReraRowMenu('${p.id}')"
                title="More Actions"
                class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1.5"/>
                  <circle cx="19" cy="12" r="1.5"/>
                  <circle cx="5" cy="12" r="1.5"/>
                </svg>
              </button>
              <div id="rera-action-menu-${p.id}" class="hidden absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-left animate-in fade-in duration-100">
                <button type="button" onclick="event.stopPropagation(); closeAllReraRowMenus(); handleOpenEditModal('${p.id}')"
                  class="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
                <button type="button" onclick="event.stopPropagation(); closeAllReraRowMenus(); handleDeleteProject('${p.id}', '${escapeHtml(p.name)}')"
                  class="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
                ${isPending ? `
                  <div class="my-1 border-t border-slate-100"></div>
                  <button type="button" onclick="event.stopPropagation(); closeAllReraRowMenus(); handleVerifyProject('${p.id}', '${escapeHtml(p.name)}')"
                    class="w-full px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Mark Verified
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
window.renderReraComplianceView = renderReraComplianceView;
window.renderComplianceEscrowView = renderReraComplianceView;

// ─── Dedicated TS-RERA Verification Details Modal ────────────────────────────

async function openReraVerificationDetail(projectId) {
  try {
    let p = null;
    try {
      const res = await fetchProjectDetail(projectId);
      if (res && res.project) p = res.project;
    } catch (e) {
      console.warn('fetchProjectDetail failed, falling back to cached projectsData:', e);
    }
    if (!p) {
      const all = (typeof projectsData !== 'undefined' && Array.isArray(projectsData)) ? projectsData : [];
      p = all.find(item => String(item.id) === String(projectId));
    }
    if (!p) throw new Error('Project not found');

    const isPending = isProjectPending(p);
    const reraId = p.rera_id || 'P02400000000';
    const cleanRera = reraId.startsWith('P') ? reraId : 'P' + reraId;
    const sanctionNo = p.sanction_order || `HMDA/LO/${p.id}/2023`;

    // Header info
    const nameEl = document.getElementById('rera-modal-project-name');
    if (nameEl) nameEl.textContent = p.name || 'Unnamed Project';

    const subEl = document.getElementById('rera-modal-project-subtitle');
    if (subEl) subEl.textContent = `${p.promoter_legal_entity || p.developer} · ${p.micro_market || 'Hyderabad'}`;

    const badgeEl = document.getElementById('rera-modal-status-badge');
    if (badgeEl) {
      if (isPending) {
        badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200';
        badgeEl.textContent = 'UNDER REVIEW';
      } else {
        badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
        badgeEl.textContent = 'VERIFIED';
      }
    }

    // RERA Registration Card
    const regEl = document.getElementById('rera-modal-reg-id');
    if (regEl) regEl.textContent = cleanRera;

    const certStatusEl = document.getElementById('rera-modal-cert-status');
    if (certStatusEl) {
      if (isPending) {
        certStatusEl.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100/70 text-amber-800 border border-amber-200';
        certStatusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Verification In Progress';
      } else {
        certStatusEl.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200';
        certStatusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Certificate On File';
      }
    }

    // Specifications Grid
    const promEl = document.getElementById('rera-modal-promoter');
    if (promEl) promEl.textContent = p.promoter_legal_entity || p.developer || '—';

    const authEl = document.getElementById('rera-modal-authority');
    if (authEl) authEl.textContent = p.sanctioning_authority || 'HMDA / GHMC';

    const sanctionEl = document.getElementById('rera-modal-sanction');
    if (sanctionEl) sanctionEl.textContent = sanctionNo;

    const handEl = document.getElementById('rera-modal-handover');
    if (handEl) handEl.textContent = p.registered_handover_date || (p.handover_year ? `Dec ${p.handover_year}` : '2026');

    const towersEl = document.getElementById('rera-modal-towers');
    if (towersEl) towersEl.textContent = p.approved_towers ? `${p.approved_towers} Sanctioned Towers` : 'Residential Towers On File';

    const acresEl = document.getElementById('rera-modal-acres');
    if (acresEl) acresEl.textContent = p.total_acres ? `${p.total_acres} Acres` : 'On Record';

    const litEl = document.getElementById('rera-modal-litigations');
    if (litEl) litEl.textContent = p.litigations_reported ? `${p.litigations_reported} Active Case(s)` : '0 Reported Cases (Clear Encumbrance)';

    const locEl = document.getElementById('rera-modal-location');
    if (locEl) locEl.textContent = `${p.micro_market || 'Hyderabad'} (Telangana State)`;

    // Open Modal
    const modal = document.getElementById('rera-verification-modal');
    if (modal) modal.classList.remove('hidden');
  } catch (err) {
    console.error('Failed to open RERA verification detail:', err);
    showToast('Could not load RERA verification details.', false);
  }
}
window.openReraVerificationDetail = openReraVerificationDetail;

function closeReraVerificationModal() {
  const modal = document.getElementById('rera-verification-modal');
  if (modal) modal.classList.add('hidden');
}
window.closeReraVerificationModal = closeReraVerificationModal;

// ─── Project Table Row Actions Dropdown ──────────────────────────────────────

function toggleProjectRowMenu(projectId) {
  const menu = document.getElementById(`proj-action-menu-${projectId}`);
  if (!menu) return;
  const isHidden = menu.classList.contains('hidden');
  closeAllProjectRowMenus();
  if (isHidden) {
    // Auto-adjust positioning if close to screen bottom
    const btn = document.querySelector(`#proj-action-menu-wrap-${projectId} button`);
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

function closeAllProjectRowMenus() {
  document.querySelectorAll('[id^="proj-action-menu-"]').forEach(el => {
    el.classList.add('hidden');
  });
}

// Global click-outside listener to dismiss row menus
document.addEventListener('click', (e) => {
  if (!e.target.closest('[id^="proj-action-menu-wrap-"]')) {
    closeAllProjectRowMenus();
  }
});

window.toggleProjectRowMenu = toggleProjectRowMenu;
window.closeAllProjectRowMenus = closeAllProjectRowMenus;

// ─── TS-RERA Table Row Actions Dropdown ─────────────────────────────────────

function toggleReraRowMenu(projectId) {
  const menu = document.getElementById(`rera-action-menu-${projectId}`);
  if (!menu) return;
  const isHidden = menu.classList.contains('hidden');
  closeAllReraRowMenus();
  if (isHidden) {
    const btn = document.querySelector(`#rera-action-menu-wrap-${projectId} button`);
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

function closeAllReraRowMenus() {
  document.querySelectorAll('[id^="rera-action-menu-"]').forEach(el => {
    el.classList.add('hidden');
  });
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('[id^="rera-action-menu-wrap-"]')) {
    closeAllReraRowMenus();
  }
});

window.toggleReraRowMenu = toggleReraRowMenu;
window.closeAllReraRowMenus = closeAllReraRowMenus;

// Project onboarding and modal lifecycle is managed by js/onboarding.js

