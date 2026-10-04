// Audience & Campaign Marketing Module

let selectedAudienceBuyerId = null;
let currentModalCampaign = null;

// ─── Campaign Filters State ───────────────────────────────────────────────────

let currentCampaignStatusFilter = 'all';
let stagedCampaignStatusFilter = 'all';
let currentCampaignMarketFilter = 'all';
let currentCampaignBudgetFilter = 'all';
let currentCampaignLeadsFilter = 'all';
let currentCampaignIntentFilter = 'all';

function toggleCampaignFilterDropdown() {
  const dropdown = document.getElementById('campaign-filter-dropdown');
  const chevron = document.getElementById('campaign-filter-chevron');
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains('hidden');
  if (isHidden) {
    stagedCampaignStatusFilter = currentCampaignStatusFilter;
    syncStagedCampaignFilterButtons(stagedCampaignStatusFilter);

    const marketSel = document.getElementById('filter-camp-market-select');
    if (marketSel) marketSel.value = currentCampaignMarketFilter;

    const budgetSel = document.getElementById('filter-camp-budget-select');
    if (budgetSel) budgetSel.value = currentCampaignBudgetFilter;

    const leadsSel = document.getElementById('filter-camp-leads-select');
    if (leadsSel) leadsSel.value = currentCampaignLeadsFilter;

    const intentSel = document.getElementById('filter-camp-intent-select');
    if (intentSel) intentSel.value = currentCampaignIntentFilter;

    dropdown.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    dropdown.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

function closeCampaignFilterDropdown() {
  const dropdown = document.getElementById('campaign-filter-dropdown');
  const chevron = document.getElementById('campaign-filter-chevron');
  if (dropdown) dropdown.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

// Global click-outside listener for campaign filter dropdown
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('campaign-filter-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeCampaignFilterDropdown();
  }
});

function stageCampaignStatusFilter(status) {
  stagedCampaignStatusFilter = status;
  syncStagedCampaignFilterButtons(status);
}

function syncStagedCampaignFilterButtons(status) {
  ['all', 'verified', 'pending'].forEach(s => {
    const btn = document.getElementById(`btn-filter-camp-${s}`);
    if (btn) {
      if (s === status) {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs text-center transition cursor-pointer';
      } else {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 text-center transition cursor-pointer';
      }
    }
  });
}

function applyCampaignFilters() {
  currentCampaignStatusFilter = stagedCampaignStatusFilter;

  const marketSel = document.getElementById('filter-camp-market-select');
  if (marketSel) currentCampaignMarketFilter = marketSel.value;

  const budgetSel = document.getElementById('filter-camp-budget-select');
  if (budgetSel) currentCampaignBudgetFilter = budgetSel.value;

  const leadsSel = document.getElementById('filter-camp-leads-select');
  if (leadsSel) currentCampaignLeadsFilter = leadsSel.value;

  const intentSel = document.getElementById('filter-camp-intent-select');
  if (intentSel) currentCampaignIntentFilter = intentSel.value;

  renderCampaignByProject();
  closeCampaignFilterDropdown();
}

function resetCampaignFilters() {
  currentCampaignStatusFilter = 'all';
  stagedCampaignStatusFilter = 'all';
  currentCampaignMarketFilter = 'all';
  currentCampaignBudgetFilter = 'all';
  currentCampaignLeadsFilter = 'all';
  currentCampaignIntentFilter = 'all';

  const marketSel = document.getElementById('filter-camp-market-select');
  if (marketSel) marketSel.value = 'all';
  const budgetSel = document.getElementById('filter-camp-budget-select');
  if (budgetSel) budgetSel.value = 'all';
  const leadsSel = document.getElementById('filter-camp-leads-select');
  if (leadsSel) leadsSel.value = 'all';
  const intentSel = document.getElementById('filter-camp-intent-select');
  if (intentSel) intentSel.value = 'all';

  syncStagedCampaignFilterButtons('all');
  renderCampaignByProject();
  closeCampaignFilterDropdown();
}

function renderCampaignActiveChips(filteredCount, totalCount) {
  const chipsContainer = document.getElementById('campaign-active-chips');
  const countBadge = document.getElementById('campaign-filter-count-badge');
  if (!chipsContainer) return;

  const chips = [];

  if (currentCampaignStatusFilter !== 'all') {
    chips.push({
      label: `Status: ${currentCampaignStatusFilter === 'pending' ? 'Pending Review' : 'Verified'}`,
      reset: () => {
        currentCampaignStatusFilter = 'all';
        stagedCampaignStatusFilter = 'all';
        syncStagedCampaignFilterButtons('all');
        renderCampaignByProject();
      }
    });
  }

  if (currentCampaignMarketFilter !== 'all') {
    chips.push({
      label: `Location: ${currentCampaignMarketFilter}`,
      reset: () => {
        currentCampaignMarketFilter = 'all';
        const el = document.getElementById('filter-camp-market-select');
        if (el) el.value = 'all';
        renderCampaignByProject();
      }
    });
  }

  if (currentCampaignBudgetFilter !== 'all') {
    const budgetLabels = {
      'under-1.5': 'Budget: Under ₹1.5 Cr',
      '1.5-2.5': 'Budget: ₹1.5 - ₹2.5 Cr',
      'above-2.5': 'Budget: Above ₹2.5 Cr'
    };
    chips.push({
      label: budgetLabels[currentCampaignBudgetFilter] || `Budget: ${currentCampaignBudgetFilter}`,
      reset: () => {
        currentCampaignBudgetFilter = 'all';
        const el = document.getElementById('filter-camp-budget-select');
        if (el) el.value = 'all';
        renderCampaignByProject();
      }
    });
  }

  if (currentCampaignLeadsFilter !== 'all') {
    const leadsLabels = {
      'with-leads': 'Leads: With Leads (>0)',
      'high-leads': 'Leads: 5+ Leads'
    };
    chips.push({
      label: leadsLabels[currentCampaignLeadsFilter] || `Leads: ${currentCampaignLeadsFilter}`,
      reset: () => {
        currentCampaignLeadsFilter = 'all';
        const el = document.getElementById('filter-camp-leads-select');
        if (el) el.value = 'all';
        renderCampaignByProject();
      }
    });
  }

  if (currentCampaignIntentFilter !== 'all') {
    const intentLabels = {
      'high': 'Intent: High (≥70%)',
      'medium': 'Intent: Medium+ (≥40%)'
    };
    chips.push({
      label: intentLabels[currentCampaignIntentFilter] || `Intent: ${currentCampaignIntentFilter}`,
      reset: () => {
        currentCampaignIntentFilter = 'all';
        const el = document.getElementById('filter-camp-intent-select');
        if (el) el.value = 'all';
        renderCampaignByProject();
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

  // Render chip elements
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
          <button type="button" onclick="removeCampaignChip(${idx})" class="text-slate-400 hover:text-red-600 transition cursor-pointer p-0.5">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </span>
      `).join('')}
      <button type="button" onclick="resetCampaignFilters()" class="text-xs font-semibold text-[#6D001A] hover:underline ml-1 cursor-pointer">
        Clear All
      </button>
    `;
    window._campaignActiveChips = chips;
  }
}

function removeCampaignChip(idx) {
  if (window._campaignActiveChips && window._campaignActiveChips[idx]) {
    window._campaignActiveChips[idx].reset();
  }
}

// ─── By Project Campaign View ─────────────────────────────────────────────────

function renderCampaignByProject() {
  const tbody = document.getElementById('campaign-table-body');
  if (!tbody) return;

  const projects = (typeof projectsData !== 'undefined') ? projectsData : [];
  const buyers = (audienceData && audienceData.qualified_buyers) ? audienceData.qualified_buyers : [];

  // Filter projects according to active filters
  const filteredProjects = projects.filter(p => {
    // 1. Verification status
    if (currentCampaignStatusFilter === 'verified') {
      if ((p.verification_status || '').toLowerCase() !== 'verified') return false;
    } else if (currentCampaignStatusFilter === 'pending') {
      if ((p.verification_status || '').toLowerCase() === 'verified') return false;
    }

    // 2. Micro Market Location
    if (currentCampaignMarketFilter !== 'all') {
      if ((p.micro_market || '').toLowerCase() !== currentCampaignMarketFilter.toLowerCase()) return false;
    }

    // 3. Budget Tier
    if (currentCampaignBudgetFilter !== 'all') {
      const minP = p.min_price_cr || 0;
      const maxP = p.max_price_cr || minP;
      if (currentCampaignBudgetFilter === 'under-1.5' && minP > 1.5) return false;
      if (currentCampaignBudgetFilter === '1.5-2.5' && (maxP < 1.5 || minP > 2.5)) return false;
      if (currentCampaignBudgetFilter === 'above-2.5' && maxP < 2.5) return false;
    }

    // Find leads for this project
    const projectLeads = buyers.filter(b => {
      const inInterested = (b.interested_projects || []).some(ip => ip.toLowerCase().includes((p.name || '').toLowerCase()));
      const inHistory = (b.search_history || []).some(s => (s.project_names_returned || '').toLowerCase().includes((p.name || '').toLowerCase()));
      return inInterested || inHistory;
    });

    // 4. Leads Filter
    if (currentCampaignLeadsFilter === 'with-leads' && projectLeads.length === 0) return false;
    if (currentCampaignLeadsFilter === 'high-leads' && projectLeads.length < 5) return false;

    // 5. Intent Score Filter
    const avgScore = projectLeads.length > 0
      ? Math.round(projectLeads.reduce((acc, cur) => acc + (cur.readiness_score || 0), 0) / projectLeads.length)
      : null;

    if (currentCampaignIntentFilter === 'high' && (avgScore === null || avgScore < 70)) return false;
    if (currentCampaignIntentFilter === 'medium' && (avgScore === null || avgScore < 40)) return false;

    return true;
  });

  // Update Count Badge
  const countBadge = document.getElementById('campaign-count-badge');
  if (countBadge) {
    countBadge.textContent = `${filteredProjects.length} ${filteredProjects.length === 1 ? 'Campaign' : 'Campaigns'}`;
  }

  // Update Active Filter Chips
  renderCampaignActiveChips(filteredProjects.length, projects.length);

  // Render Table Rows
  if (filteredProjects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-14 text-xs text-slate-400">
          <div class="max-w-xs mx-auto space-y-2">
            <p class="font-medium text-slate-600">No campaigns match your filter criteria.</p>
            <p class="text-[11px] text-slate-400">Try adjusting your location, price, or lead volume filters.</p>
            <button onclick="resetCampaignFilters()" class="mt-2 text-xs font-bold text-[#6D001A] hover:underline cursor-pointer">
              Reset All Filters
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredProjects.map(p => {
    // Find buyers who have this project in their interested_projects or search history
    const projectLeads = buyers.filter(b => {
      const inInterested = (b.interested_projects || []).some(ip => ip.toLowerCase().includes((p.name || '').toLowerCase()));
      const inHistory = (b.search_history || []).some(s => (s.project_names_returned || '').toLowerCase().includes((p.name || '').toLowerCase()));
      return inInterested || inHistory;
    });

    const minPrice = p.min_price_cr ? `₹${p.min_price_cr} Cr` : '—';
    const maxPrice = p.max_price_cr ? `₹${p.max_price_cr} Cr` : '—';
    const priceText = (p.min_price_cr && p.max_price_cr) ? `${minPrice} – ${maxPrice}` : (minPrice !== '—' ? minPrice : 'Price on request');
    const isVerified = (p.verification_status || '').toLowerCase() === 'verified';
    
    const avgScore = projectLeads.length > 0
      ? Math.round(projectLeads.reduce((acc, cur) => acc + (cur.readiness_score || 0), 0) / projectLeads.length)
      : null;

    return `
      <tr class="hover:bg-slate-50/80 transition cursor-pointer group" onclick="openCampaignDetail('${p.id}')">
        <!-- 1. Campaign / Project -->
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 group-hover:text-[#6D001A] transition text-sm">${escapeHtml(p.name || 'Unnamed Project')}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
              ${isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div class="text-xs text-slate-400 mt-0.5">${escapeHtml(p.developer || 'Direct Developer')}</div>
        </td>

        <!-- 2. Target Location -->
        <td class="px-6 py-4">
          <span class="text-xs text-slate-700 font-medium">${escapeHtml(p.micro_market || 'Hyderabad')}</span>
        </td>

        <!-- 3. Price Range -->
        <td class="px-6 py-4">
          <span class="text-xs font-mono font-semibold text-slate-800">${priceText}</span>
        </td>

        <!-- 4. Matched Leads -->
        <td class="px-6 py-4">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${projectLeads.length > 0 ? 'bg-[#6D001A]/10 text-[#6D001A]' : 'bg-slate-100 text-slate-500'}">
            ${projectLeads.length} ${projectLeads.length === 1 ? 'lead' : 'leads'}
          </span>
        </td>

        <!-- 5. Avg. Intent Score -->
        <td class="px-6 py-4">
          ${avgScore !== null ? `
            <div class="flex items-center gap-2.5">
              <div class="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                <div class="bg-gradient-to-r from-amber-500 to-emerald-600 h-2 rounded-full" style="width: ${avgScore}%"></div>
              </div>
              <span class="font-mono text-xs font-bold text-slate-800">${avgScore}%</span>
            </div>
          ` : `
            <span class="text-slate-400 font-mono text-xs">—</span>
          `}
        </td>

        <!-- 6. Actions -->
        <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
          <button onclick="openCampaignDetail('${p.id}')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer inline-flex items-center gap-1.5">
            <span>View Brief</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openCampaignDetail(projectId) {
  const projects = (typeof projectsData !== 'undefined') ? projectsData : [];
  const buyers = (audienceData && audienceData.qualified_buyers) ? audienceData.qualified_buyers : [];
  const p = projects.find(x => String(x.id) === String(projectId));
  if (!p) {
    if (typeof showToast === 'function') showToast('Project campaign not found.', false);
    return;
  }

  // Filter matched leads
  const projectLeads = buyers.filter(b => {
    const inInterested = (b.interested_projects || []).some(ip => ip.toLowerCase().includes((p.name || '').toLowerCase()));
    const inHistory = (b.search_history || []).some(s => (s.project_names_returned || '').toLowerCase().includes((p.name || '').toLowerCase()));
    return inInterested || inHistory;
  });

  const minPrice = p.min_price_cr ? `₹${p.min_price_cr} Cr` : '—';
  const maxPrice = p.max_price_cr ? `₹${p.max_price_cr} Cr` : '—';
  const priceRange = (p.min_price_cr && p.max_price_cr) ? `${minPrice} – ${maxPrice}` : (minPrice !== '—' ? minPrice : 'Price on request');
  const impressions = p.search_impressions || 0;
  const avgReadiness = projectLeads.length > 0
    ? Math.round(projectLeads.reduce((acc, cur) => acc + (cur.readiness_score || 0), 0) / projectLeads.length)
    : '—';
  const isVerified = (p.verification_status || '').toLowerCase() === 'verified';

  // Strategy hook
  let hookText = `Direct developer pricing authenticating verified TS-RERA clearances and high carpet area efficiency in ${p.micro_market || 'Hyderabad'}.`;
  if (audienceData && audienceData.campaign_clusters) {
    const matchedCluster = audienceData.campaign_clusters.find(c => 
      (c.top_projects || []).some(tp => tp.toLowerCase().includes((p.name || '').toLowerCase())) ||
      (c.target_micro_markets || []).some(m => m.toLowerCase().includes((p.micro_market || '').toLowerCase()))
    );
    if (matchedCluster && matchedCluster.ad_creative_hook) {
      hookText = matchedCluster.ad_creative_hook;
    }
  }

  currentModalCampaign = {
    project: p,
    leads: projectLeads,
    hook: hookText,
    priceRange: priceRange
  };

  // Populate Header
  const modalName = document.getElementById('modal-campaign-name');
  const modalSubtitle = document.getElementById('modal-campaign-subtitle');
  const modalStatus = document.getElementById('modal-campaign-status');
  if (modalName) modalName.textContent = p.name || 'Campaign Brief';
  if (modalSubtitle) modalSubtitle.textContent = `${p.developer || 'Direct Developer'} · ${p.micro_market || 'Hyderabad'} · ${priceRange}`;
  if (modalStatus) {
    modalStatus.textContent = isVerified ? 'TS-RERA Verified' : 'Pending Verification';
    modalStatus.className = `px-2.5 py-0.5 rounded-full text-xs font-semibold ${isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`;
  }

  // Populate KPIs
  const leadsCountEl = document.getElementById('modal-campaign-leads-count');
  const impEl = document.getElementById('modal-campaign-impressions');
  const readinessEl = document.getElementById('modal-campaign-readiness');
  const budgetEl = document.getElementById('modal-campaign-budget');
  if (leadsCountEl) leadsCountEl.textContent = projectLeads.length;
  if (impEl) impEl.textContent = impressions.toLocaleString();
  if (readinessEl) readinessEl.textContent = avgReadiness !== '—' ? `${avgReadiness}/100` : '—';
  if (budgetEl) budgetEl.textContent = priceRange;

  // Populate Hook
  const hookEl = document.getElementById('modal-campaign-hook');
  if (hookEl) hookEl.textContent = `"${hookText}"`;

  // Keywords
  const keywordsContainer = document.getElementById('modal-campaign-keywords-container');
  if (keywordsContainer) {
    const keywords = (p.triggering_keywords && p.triggering_keywords.length > 0)
      ? p.triggering_keywords
      : ['TS-RERA Registered', 'Direct Developer Pricing', p.micro_market || 'Hyderabad', 'High Efficiency Floor Plan'];
    keywordsContainer.innerHTML = `
      <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Trigger Keywords:</span>
      ${keywords.map(k => `<span class="px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-700 font-medium">${escapeHtml(k)}</span>`).join('')}
    `;
  }

  // Populate Leads Table
  const leadsBadge = document.getElementById('modal-campaign-leads-badge');
  if (leadsBadge) leadsBadge.textContent = `${projectLeads.length} matched high-intent ${projectLeads.length === 1 ? 'buyer' : 'buyers'}`;

  const leadsTbody = document.getElementById('modal-campaign-leads-tbody');
  if (leadsTbody) {
    if (projectLeads.length === 0) {
      leadsTbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-xs text-slate-400">
            No high-intent buyers currently matched with this campaign project.
          </td>
        </tr>
      `;
    } else {
      leadsTbody.innerHTML = projectLeads.map(b => {
        const timeAgo = typeof formatTimeAgo === 'function' ? formatTimeAgo(b.last_active) : (b.last_active || 'Recent');
        const searchHistory = b.search_history || [];
        const latestSearch = searchHistory[0] || {};
        let filters = 'Direct Project Inquiry';
        if (latestSearch.filters_applied) {
          if (typeof latestSearch.filters_applied === 'string') {
            filters = latestSearch.filters_applied;
          } else if (typeof latestSearch.filters_applied === 'object') {
            filters = Object.entries(latestSearch.filters_applied).map(([k, v]) => `${k}: ${v}`).join(' · ');
          }
        } else if (b.interested_projects && b.interested_projects.length > 0) {
          filters = `Interested: ${b.interested_projects.join(', ')}`;
        }

        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="px-4 py-3 font-semibold text-slate-900">${escapeHtml(b.name || 'Anonymous Buyer')}</td>
            <td class="px-4 py-3 font-mono text-slate-600">
              <div>${escapeHtml(b.email || '—')}</div>
              ${b.phone ? `<div class="text-[10px] text-slate-400 mt-0.5">${escapeHtml(b.phone)}</div>` : ''}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-[#6D001A] h-1.5 rounded-full" style="width: ${b.readiness_score || 0}%"></div>
                </div>
                <span class="font-mono font-bold text-slate-800 text-[11px]">${b.readiness_score || 0}/100</span>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600 max-w-xs truncate" title="${escapeHtml(filters)}">
              ${escapeHtml(filters)}
            </td>
            <td class="px-4 py-3 text-right font-mono text-[11px] text-slate-400">
              ${escapeHtml(timeAgo)}
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Show modal
  const modal = document.getElementById('campaign-detail-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeCampaignDetailModal() {
  const modal = document.getElementById('campaign-detail-modal');
  if (modal) modal.classList.add('hidden');
}

function copyAdCreativeHook() {
  if (currentModalCampaign && currentModalCampaign.hook) {
    navigator.clipboard.writeText(currentModalCampaign.hook).then(() => {
      if (typeof showToast === 'function') showToast('Ad creative hook copied to clipboard!', true);
    }).catch(() => {
      if (typeof showToast === 'function') showToast('Failed to copy hook.', false);
    });
  }
}

function exportSingleProjectBrief() {
  if (!currentModalCampaign || !currentModalCampaign.project) {
    if (typeof showToast === 'function') showToast('No campaign selected to export.', false);
    return;
  }
  const p = currentModalCampaign.project;
  const leads = currentModalCampaign.leads || [];
  const briefPayload = {
    exported_at: new Date().toISOString(),
    campaign_project: p.name,
    developer: p.developer,
    micro_market: p.micro_market,
    price_range: currentModalCampaign.priceRange,
    ad_targeting_hook: currentModalCampaign.hook,
    triggering_keywords: p.triggering_keywords || [],
    total_matched_leads: leads.length,
    matched_leads: leads.map(l => ({
      name: l.name,
      email: l.email,
      phone: l.phone,
      readiness_score: l.readiness_score,
      last_active: l.last_active
    }))
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(briefPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `campaign-brief-${(p.name || 'project').toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  if (typeof showToast === 'function') showToast(`Campaign brief for ${p.name} exported.`, true);

  if (typeof recordExport === 'function') {
    recordExport(`Campaign brief for "${p.name}" exported (${leads.length} leads)`);
  }
}

async function loadAudienceData() {
  try {
    const data = await fetchAudienceAnalytics();
    audienceData = data;
    renderAudienceView();
    renderBuyerLeadsView();
    renderAdSegmentsView();
  } catch (err) {
    console.error('Failed to load audience analytics:', err);
  }
}

function cleanKeyDriver(driver) {
  const map = {
    'Carpet Area Efficiency > 73%': 'High carpet area efficiency',
    'TS-RERA Compliance': 'Verified legal documentation',
    'Zero Broker Protocol': 'Direct developer pricing',
    'Dual-Aspect Corner Ventilation': 'Corner unit preference',
    '100% Unobstructed Balcony Views': 'Open balcony views',
    'Direct ORR Access': 'Direct ORR access',
    'Early Handover 2025/2026': 'Handover by 2026',
    'Clear Land Title & GHMC Approval': 'Approved building plans',
    'Transparent Cost Sheet': 'Transparent cost breakdown'
  };
  return map[driver] || driver;
}

function renderAudienceView() {
  if (!audienceData) return;
  renderCampaignByProject();
}

function renderBuyerLeadsView() {
  if (!audienceData) return;
  renderBuyerLeadsTable();
}

function renderAdSegmentsView() {
  const clustersContainer = document.getElementById('audience-campaign-clusters');
  if (clustersContainer && audienceData && audienceData.campaign_clusters) {
    clustersContainer.innerHTML = audienceData.campaign_clusters.map(c => {
      const drivers = (c.key_drivers || []).map(cleanKeyDriver);

      return `
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                ${escapeHtml(c.configuration)}
              </span>
              <span class="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ${c.cluster_size || 0} Buyers
              </span>
            </div>

            <h3 class="text-sm font-bold text-slate-900 mt-2.5 leading-snug">${escapeHtml(c.name)}</h3>
            <div class="text-xs text-slate-500 font-medium mt-1">
              Target Markets: <span class="text-slate-800 font-semibold">${c.target_micro_markets.join(', ')}</span>
            </div>
            <div class="text-xs text-slate-500 font-medium mt-0.5">
              Budget: <span class="text-[#6D001A] font-bold">${escapeHtml(c.budget_bracket)}</span>
            </div>

            <!-- Ad Creative Angle / Hook -->
            <div class="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Campaign Creative Hook:</div>
              <div class="text-slate-800 font-medium italic mt-1 leading-relaxed">
                "${escapeHtml(c.ad_creative_hook)}"
              </div>
            </div>

            <!-- Core Conversion Drivers -->
            <div class="mt-3 flex flex-wrap gap-1.5">
              ${drivers.map(d => `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium border border-slate-200">${escapeHtml(d)}</span>`).join('')}
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div class="text-[11px] text-slate-500">
              Projects: <span class="font-medium text-slate-800">${(c.top_projects || []).join(', ')}</span>
            </div>
            <button onclick="exportCampaignCluster('${c.id}')"
              class="px-2.5 py-1 text-xs font-semibold text-[#6D001A] bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200/60 cursor-pointer">
              Export Segment
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ─── Buyer Leads Filters State & Controls ──────────────────────────────────────

let buyerSearchQuery = '';
let currentBuyerTierFilter = 'all';
let stagedBuyerTierFilter = 'all';
let currentBuyerMarketFilter = 'all';
let currentBuyerBudgetFilter = 'all';
let currentBuyerEngagementFilter = 'all';
let currentModalBuyer = null;

function toggleBuyerFilterDropdown() {
  const dropdown = document.getElementById('buyer-filter-dropdown');
  const chevron = document.getElementById('buyer-filter-chevron');
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains('hidden');
  if (isHidden) {
    stagedBuyerTierFilter = currentBuyerTierFilter;
    syncStagedBuyerTierButtons(stagedBuyerTierFilter);

    const marketSel = document.getElementById('filter-buyer-market-select');
    if (marketSel) marketSel.value = currentBuyerMarketFilter;

    const budgetSel = document.getElementById('filter-buyer-budget-select');
    if (budgetSel) budgetSel.value = currentBuyerBudgetFilter;

    const engSel = document.getElementById('filter-buyer-engagement-select');
    if (engSel) engSel.value = currentBuyerEngagementFilter;

    dropdown.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    dropdown.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

function closeBuyerFilterDropdown() {
  const dropdown = document.getElementById('buyer-filter-dropdown');
  const chevron = document.getElementById('buyer-filter-chevron');
  if (dropdown) dropdown.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

// Global click-outside listener for buyer filter dropdown
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('buyer-filter-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeBuyerFilterDropdown();
  }
});

function stageBuyerTierFilter(tier) {
  stagedBuyerTierFilter = tier;
  syncStagedBuyerTierButtons(tier);
}

function syncStagedBuyerTierButtons(tier) {
  ['all', 'high', 'casual'].forEach(t => {
    const btn = document.getElementById(`btn-filter-buyer-${t}`);
    if (btn) {
      if (t === tier) {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs text-center transition cursor-pointer';
      } else {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 text-center transition cursor-pointer';
      }
    }
  });
}

function applyBuyerFilters() {
  currentBuyerTierFilter = stagedBuyerTierFilter;

  const marketSel = document.getElementById('filter-buyer-market-select');
  if (marketSel) currentBuyerMarketFilter = marketSel.value;

  const budgetSel = document.getElementById('filter-buyer-budget-select');
  if (budgetSel) currentBuyerBudgetFilter = budgetSel.value;

  const engSel = document.getElementById('filter-buyer-engagement-select');
  if (engSel) currentBuyerEngagementFilter = engSel.value;

  renderBuyerLeadsTable();
  closeBuyerFilterDropdown();
}

function resetBuyerFilters() {
  currentBuyerTierFilter = 'all';
  stagedBuyerTierFilter = 'all';
  currentBuyerMarketFilter = 'all';
  currentBuyerBudgetFilter = 'all';
  currentBuyerEngagementFilter = 'all';
  syncStagedBuyerTierButtons('all');

  const marketSel = document.getElementById('filter-buyer-market-select');
  if (marketSel) marketSel.value = 'all';

  const budgetSel = document.getElementById('filter-buyer-budget-select');
  if (budgetSel) budgetSel.value = 'all';

  const engSel = document.getElementById('filter-buyer-engagement-select');
  if (engSel) engSel.value = 'all';

  renderBuyerLeadsTable();
  closeBuyerFilterDropdown();
}

function handleBuyerLeadsSearch(val) {
  buyerSearchQuery = (val || '').toLowerCase().trim();
  renderBuyerLeadsTable();
}

function renderBuyerActiveChips(filteredCount, totalCount) {
  const chipsContainer = document.getElementById('buyer-active-chips');
  const countBadge = document.getElementById('buyer-filter-count-badge');
  if (!chipsContainer) return;

  const chips = [];

  if (currentBuyerTierFilter !== 'all') {
    chips.push({
      label: currentBuyerTierFilter === 'high' ? 'Tier: High Intent (≥70)' : 'Tier: Casual Browser',
      reset: () => {
        currentBuyerTierFilter = 'all';
        syncStagedBuyerTierButtons('all');
        renderBuyerLeadsTable();
      }
    });
  }

  if (currentBuyerMarketFilter !== 'all') {
    chips.push({
      label: `Location: ${currentBuyerMarketFilter}`,
      reset: () => {
        currentBuyerMarketFilter = 'all';
        const el = document.getElementById('filter-buyer-market-select');
        if (el) el.value = 'all';
        renderBuyerLeadsTable();
      }
    });
  }

  if (currentBuyerBudgetFilter !== 'all') {
    const budgetLabels = {
      'under-1.5': 'Max Budget: Under ₹1.5 Cr',
      '1.5-2.5': 'Max Budget: ₹1.5 - ₹2.5 Cr',
      'above-2.5': 'Max Budget: Above ₹2.5 Cr'
    };
    chips.push({
      label: budgetLabels[currentBuyerBudgetFilter] || `Budget: ${currentBuyerBudgetFilter}`,
      reset: () => {
        currentBuyerBudgetFilter = 'all';
        const el = document.getElementById('filter-buyer-budget-select');
        if (el) el.value = 'all';
        renderBuyerLeadsTable();
      }
    });
  }

  if (currentBuyerEngagementFilter !== 'all') {
    const engLabels = {
      'searches-5': 'Activity: 5+ Searches',
      'has-inquiries': 'Activity: With Inquiries',
      'has-saved': 'Activity: With Saved Units'
    };
    chips.push({
      label: engLabels[currentBuyerEngagementFilter] || `Activity: ${currentBuyerEngagementFilter}`,
      reset: () => {
        currentBuyerEngagementFilter = 'all';
        const el = document.getElementById('filter-buyer-engagement-select');
        if (el) el.value = 'all';
        renderBuyerLeadsTable();
      }
    });
  }

  // Update button filter count badge
  if (countBadge) {
    if (chips.length > 0) {
      countBadge.textContent = chips.length;
      countBadge.classList.remove('hidden');
    } else {
      countBadge.classList.add('hidden');
    }
  }

  // Render chip elements
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
          <button type="button" onclick="removeBuyerChip(${idx})" class="text-slate-400 hover:text-red-600 transition cursor-pointer p-0.5">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </span>
      `).join('')}
      <button type="button" onclick="resetBuyerFilters()" class="text-xs font-semibold text-[#6D001A] hover:underline ml-1 cursor-pointer">
        Clear All
      </button>
    `;
    window._buyerActiveChips = chips;
  }
}

function removeBuyerChip(idx) {
  if (window._buyerActiveChips && window._buyerActiveChips[idx]) {
    window._buyerActiveChips[idx].reset();
  }
}

// ─── Buyer Leads Structured Minimal Table ──────────────────────────────────────

function renderBuyerLeadsTable() {
  const tbody = document.getElementById('buyer-leads-table-body');
  const countBadge = document.getElementById('buyer-leads-count-badge');
  if (!tbody) return;

  const buyers = (audienceData && audienceData.qualified_buyers) ? audienceData.qualified_buyers : [];

  // Filter buyers
  const filtered = buyers.filter(b => {
    // 1. Text Search
    if (buyerSearchQuery) {
      const name = (b.name || '').toLowerCase();
      const email = (b.email || '').toLowerCase();
      const phone = (b.phone || '').toLowerCase();
      const market = (b.micro_market_pref || '').toLowerCase();
      const projects = (b.interested_projects || []).join(' ').toLowerCase();
      const searchMatch = name.includes(buyerSearchQuery) ||
        email.includes(buyerSearchQuery) ||
        phone.includes(buyerSearchQuery) ||
        market.includes(buyerSearchQuery) ||
        projects.includes(buyerSearchQuery);
      if (!searchMatch) return false;
    }

    // 2. Intent / Readiness Tier
    if (currentBuyerTierFilter === 'high') {
      const isHigh = (b.readiness_score >= 70) || (b.buyer_tier || '').includes('HIGH') || (b.buyer_tier || '').includes('COMMIT');
      if (!isHigh) return false;
    } else if (currentBuyerTierFilter === 'casual') {
      const isCasual = (b.readiness_score < 40) || (b.buyer_tier || '').includes('CASUAL');
      if (!isCasual) return false;
    }

    // 3. Micro Market Location
    if (currentBuyerMarketFilter !== 'all') {
      const bMarket = (b.micro_market_pref || '').toLowerCase();
      const filterMarket = currentBuyerMarketFilter.toLowerCase();
      const inSearchHist = (b.search_history || []).some(s => (s.micro_market || '').toLowerCase().includes(filterMarket));
      if (!bMarket.includes(filterMarket) && !inSearchHist) return false;
    }

    // 4. Budget Bracket
    if (currentBuyerBudgetFilter !== 'all') {
      const maxBudget = b.budget_max_cr || 0;
      if (currentBuyerBudgetFilter === 'under-1.5' && maxBudget > 1.5) return false;
      if (currentBuyerBudgetFilter === '1.5-2.5' && (maxBudget < 1.5 || maxBudget > 2.5)) return false;
      if (currentBuyerBudgetFilter === 'above-2.5' && maxBudget < 2.5) return false;
    }

    // 5. Engagement Activity
    if (currentBuyerEngagementFilter !== 'all') {
      const totalSearches = b.total_searches || (b.search_history ? b.search_history.length : 0);
      const savedCount = b.saved_units_count || (b.saved_units ? b.saved_units.length : 0);
      const inqCount = b.inquiries_count || (b.inquiries ? b.inquiries.length : 0);

      if (currentBuyerEngagementFilter === 'searches-5' && totalSearches < 5) return false;
      if (currentBuyerEngagementFilter === 'has-inquiries' && inqCount === 0) return false;
      if (currentBuyerEngagementFilter === 'has-saved' && savedCount === 0) return false;
    }

    return true;
  });

  // Update Count Badge
  if (countBadge) {
    countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'Buyer Lead' : 'Buyer Leads'}`;
  }

  // Render Active Filter Chips
  renderBuyerActiveChips(filtered.length, buyers.length);

  // Empty state
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-12 text-center">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-400 mb-2">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p class="text-xs font-medium text-slate-600">No buyer leads match the active filters or search query.</p>
          <button type="button" onclick="resetBuyerFilters()" class="mt-2 text-xs font-semibold text-[#6D001A] hover:underline cursor-pointer">
            Reset all filters
          </button>
        </td>
      </tr>
    `;
    return;
  }

  // Render organized table rows
  tbody.innerHTML = filtered.map(b => {
    const initials = (b.name || 'AB').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const score = b.readiness_score || 0;
    const scoreColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-blue-500' : 'bg-slate-400';
    const scoreTextColor = score >= 70 ? 'text-emerald-700' : score >= 40 ? 'text-blue-700' : 'text-slate-700';

    // Tier badge
    let tierLabel = 'Casual Browser';
    let tierClass = 'bg-slate-100 text-slate-700 border border-slate-200';
    if (score >= 70 || (b.buyer_tier || '').includes('HIGH') || (b.buyer_tier || '').includes('COMMIT')) {
      tierLabel = 'High Intent';
      tierClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (score >= 40 || (b.buyer_tier || '').includes('ENGAGED') || (b.buyer_tier || '').includes('MEDIUM')) {
      tierLabel = 'Engaged Lead';
      tierClass = 'bg-blue-50 text-blue-700 border border-blue-200';
    }

    const totalSearches = b.total_searches || (b.search_history ? b.search_history.length : 1);
    const savedCount = b.saved_units_count || (b.saved_units ? b.saved_units.length : 0);
    const inqCount = b.inquiries_count || (b.inquiries ? b.inquiries.length : 0);

    const budgetDisplay = b.budget_max_cr ? `₹${Number(b.budget_max_cr).toFixed(2)} Cr` : 'Flexible';
    const bhkDisplay = b.bhk_pref ? `${b.bhk_pref} BHK` : 'Any BHK';

    return `
      <tr onclick="openBuyerDetailModal('${b.id}')" class="hover:bg-slate-50 transition cursor-pointer group">
        <!-- Buyer & Contact -->
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#6D001A] group-hover:text-white text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 transition shadow-2xs">
              ${initials}
            </div>
            <div>
              <div class="font-bold text-xs text-slate-900 group-hover:text-[#6D001A] transition">${escapeHtml(b.name || 'Anonymous Buyer')}</div>
              <div class="text-[11px] text-slate-500 font-mono mt-0.5">
                ${escapeHtml(b.email || '—')}${b.phone ? ` · <span class="text-slate-400">${escapeHtml(b.phone)}</span>` : ''}
              </div>
            </div>
          </div>
        </td>

        <!-- Intent Tier -->
        <td class="px-6 py-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${tierClass}">
            ${tierLabel}
          </span>
        </td>

        <!-- Location Pref -->
        <td class="px-6 py-4">
          <div class="text-xs font-semibold text-slate-800">${escapeHtml(b.micro_market_pref || 'Hyderabad West')}</div>
          <div class="text-[10px] text-slate-400 font-medium mt-0.5">${bhkDisplay} Preferred</div>
        </td>

        <!-- Max Budget -->
        <td class="px-6 py-4">
          <div class="font-bold font-mono text-xs text-slate-900">${budgetDisplay}</div>
          <div class="text-[10px] text-slate-400 font-medium mt-0.5">Budget Ceiling</div>
        </td>

        <!-- Readiness Score -->
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="${scoreColor} h-1.5 rounded-full" style="width: ${score}%"></div>
            </div>
            <span class="font-mono font-bold text-xs ${scoreTextColor}">${score}/100</span>
          </div>
        </td>

        <!-- Engagement Signals -->
        <td class="px-6 py-4">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium font-mono">${totalSearches} ${totalSearches === 1 ? 'search' : 'searches'}</span>
            ${savedCount > 0 ? `<span class="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-medium border border-blue-100">${savedCount} saved</span>` : ''}
            ${inqCount > 0 ? `<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">${inqCount} inq</span>` : ''}
          </div>
        </td>

        <!-- Actions -->
        <td class="px-6 py-4 text-right">
          <button onclick="event.stopPropagation(); openBuyerDetailModal('${b.id}')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6D001A] bg-red-50 hover:bg-[#6D001A] hover:text-white border border-red-200/80 transition cursor-pointer shadow-2xs">
            <span>View Profile</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Buyer Profile Detail Modal ───────────────────────────────────────────

function openBuyerDetailModal(buyerId) {
  if (!audienceData || !audienceData.qualified_buyers) return;
  const b = audienceData.qualified_buyers.find(x => x.id === buyerId);
  if (!b) return;

  currentModalBuyer = b;

  const timeAgo = typeof formatTimeAgo === 'function' ? formatTimeAgo(b.last_active || b.last_activity_at) : 'Active recently';
  const totalSearches = b.total_searches || (b.search_history ? b.search_history.length : 1);
  const initials = (b.name || 'AB').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const score = b.readiness_score || 0;

  // Header Elements
  const avatarEl = document.getElementById('modal-buyer-avatar');
  const nameEl = document.getElementById('modal-buyer-name');
  const tierBadgeEl = document.getElementById('modal-buyer-tier-badge');
  const emailEl = document.getElementById('modal-buyer-email');
  const phoneEl = document.getElementById('modal-buyer-phone');

  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl) nameEl.textContent = b.name || 'Anonymous Buyer';
  if (emailEl) emailEl.textContent = b.email || '—';
  if (phoneEl) phoneEl.textContent = b.phone || '—';

  if (tierBadgeEl) {
    if (score >= 70 || (b.buyer_tier || '').includes('HIGH') || (b.buyer_tier || '').includes('COMMIT')) {
      tierBadgeEl.textContent = 'High Intent Lead';
      tierBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (score >= 40 || (b.buyer_tier || '').includes('ENGAGED') || (b.buyer_tier || '').includes('MEDIUM')) {
      tierBadgeEl.textContent = 'Engaged Searcher';
      tierBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200';
    } else {
      tierBadgeEl.textContent = 'Casual Browser';
      tierBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  // 4 KPI Cards
  const scoreEl = document.getElementById('modal-buyer-score');
  const readinessLabelEl = document.getElementById('modal-buyer-readiness-label');
  const budgetEl = document.getElementById('modal-buyer-budget');
  const bhkPrefEl = document.getElementById('modal-buyer-bhk-pref');
  const marketEl = document.getElementById('modal-buyer-market');
  const searchesEl = document.getElementById('modal-buyer-searches-count');
  const lastActiveEl = document.getElementById('modal-buyer-last-active');

  if (scoreEl) scoreEl.textContent = score;
  if (readinessLabelEl) readinessLabelEl.textContent = b.readiness_label || (score >= 70 ? 'Ready for Site Tour' : score >= 40 ? 'Actively Evaluating' : 'Initial Research');
  if (budgetEl) budgetEl.textContent = b.budget_max_cr ? `₹${Number(b.budget_max_cr).toFixed(2)} Cr` : 'Flexible';
  if (bhkPrefEl) bhkPrefEl.textContent = b.bhk_pref ? `${b.bhk_pref} BHK Target Configuration` : 'Any Configuration';
  if (marketEl) marketEl.textContent = b.micro_market_pref || 'Hyderabad West';
  if (searchesEl) searchesEl.textContent = `${totalSearches} ${totalSearches === 1 ? 'Search' : 'Searches'}`;
  if (lastActiveEl) lastActiveEl.textContent = `Last active ${timeAgo}`;

  // Intent Scoring Breakdown (5 Dimensions)
  const dimsContainer = document.getElementById('modal-buyer-dimensions');
  if (dimsContainer) {
    let breakdown = null;
    try {
      if (typeof b.intent_breakdown === 'string') {
        breakdown = JSON.parse(b.intent_breakdown);
      } else if (typeof b.intent_breakdown === 'object') {
        breakdown = b.intent_breakdown;
      }
    } catch (e) {
      breakdown = null;
    }

    const defaultDims = [
      { key: 'financial_precision', label: 'Financial Precision', defaultScore: Math.min(25, Math.round(score * 0.25)), max: 25 },
      { key: 'commute_alignment', label: 'Commute Alignment', defaultScore: Math.min(20, Math.round(score * 0.20)), max: 20 },
      { key: 'architectural_depth', label: 'Architectural Depth', defaultScore: Math.min(20, Math.round(score * 0.20)), max: 20 },
      { key: 'legal_due_diligence', label: 'Legal Diligence', defaultScore: Math.min(15, Math.round(score * 0.15)), max: 15 },
      { key: 'commitment_signals', label: 'Commitment Signals', defaultScore: Math.min(20, Math.round(score * 0.20)), max: 20 }
    ];

    dimsContainer.innerHTML = defaultDims.map(d => {
      const dimData = breakdown && breakdown[d.key] ? breakdown[d.key] : null;
      const dimScore = dimData && typeof dimData.score === 'number' ? dimData.score : d.defaultScore;
      const dimMax = dimData && typeof dimData.max === 'number' ? dimData.max : d.max;
      const pct = Math.min(100, Math.round((dimScore / dimMax) * 100));

      return `
        <div class="p-3 rounded-lg bg-white border border-slate-200">
          <div class="text-[10px] font-medium text-slate-500 truncate">${escapeHtml(d.label)}</div>
          <div class="flex items-baseline justify-between mt-1">
            <span class="font-bold font-mono text-sm text-slate-900">${dimScore}</span>
            <span class="text-[10px] font-mono text-slate-400">/${dimMax}</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div class="bg-[#6D001A] h-1 rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Search History Timeline
  const history = b.search_history || [];
  const histBadge = document.getElementById('modal-buyer-history-badge');
  const histList = document.getElementById('modal-buyer-history-list');

  if (histBadge) histBadge.textContent = `${history.length} ${history.length === 1 ? 'search event' : 'search events'}`;
  if (histList) {
    if (history.length === 0) {
      histList.innerHTML = `
        <div class="text-center py-6 text-xs text-slate-400">
          No search event logs recorded for this buyer profile yet.
        </div>
      `;
    } else {
      histList.innerHTML = history.map((s, idx) => {
        const sTime = typeof formatTimeAgo === 'function' ? formatTimeAgo(s.timestamp) : (s.timestamp || 'Recently');
        const filters = [];
        if (s.micro_market) filters.push(s.micro_market);
        if (s.bhk) filters.push(`${s.bhk} BHK`);
        if (s.min_budget_cr || s.max_budget_cr) filters.push(`₹${s.min_budget_cr || 0} - ₹${s.max_budget_cr || '∞'} Cr`);
        if (s.facing) filters.push(`${s.facing} Facing`);
        if (s.corner_only) filters.push('Corner Only');
        if (s.morning_sunlight_only) filters.push('Morning Sun');

        const pNames = (s.project_names_returned || '').split(',').map(x => x.trim()).filter(Boolean);

        return `
          <div class="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">${escapeHtml(s.micro_market || 'Hyderabad West Corridor')} Search</span>
              <span class="font-mono text-slate-400 text-[10px]">${sTime}</span>
            </div>
            <div class="flex flex-wrap gap-1">
              ${filters.length > 0 ? filters.map(f => `
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-white text-slate-700 border border-slate-200">${escapeHtml(f)}</span>
              `).join('') : '<span class="text-slate-400 text-[10px] italic">No granular filters applied</span>'}
            </div>
            ${pNames.length > 0 ? `
              <div class="text-[11px] text-slate-500 pt-0.5">
                Returned: <span class="text-slate-800 font-medium">${escapeHtml(pNames.join(', '))}</span>
                <span class="font-mono text-slate-400 text-[10px]">(${s.results_count || pNames.length} units matched)</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }

  // Saved Properties
  const saved = b.saved_units || [];
  const savedList = document.getElementById('modal-buyer-saved-list');
  if (savedList) {
    if (saved.length === 0) {
      savedList.innerHTML = `
        <div class="text-center py-4 text-xs text-slate-400 italic">
          No shortlisted properties saved yet.
        </div>
      `;
    } else {
      savedList.innerHTML = saved.map(su => `
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <div class="font-bold text-slate-900">${escapeHtml(su.project_name || 'Project')}</div>
            <div class="text-[10px] text-slate-500">${su.bhk || 3} BHK · ${su.carpet_area_sqft || '—'} sq ft · ${escapeHtml(su.micro_market || '')}</div>
          </div>
          <div class="font-bold text-slate-900 font-mono text-xs">₹${su.total_price_cr || '—'} Cr</div>
        </div>
      `).join('');
    }
  }

  // Direct Inquiries
  const inq = b.inquiries || [];
  const inqList = document.getElementById('modal-buyer-inquiries-list');
  if (inqList) {
    if (inq.length === 0) {
      inqList.innerHTML = `
        <div class="text-center py-4 text-xs text-slate-400 italic">
          No direct developer inquiries submitted.
        </div>
      `;
    } else {
      inqList.innerHTML = inq.map(item => `
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900">${escapeHtml(item.project_name || 'Project Inquiry')}</span>
            <span class="font-mono text-[10px] text-slate-400">${typeof formatTimeAgo === 'function' ? formatTimeAgo(item.created_at) : ''}</span>
          </div>
          <div class="text-slate-600 text-[11px]">${escapeHtml(item.user_message || item.inquiry_type || 'Requested callback')}</div>
        </div>
      `).join('');
    }
  }

  // Open modal
  const modal = document.getElementById('buyer-detail-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeBuyerDetailModal() {
  const modal = document.getElementById('buyer-detail-modal');
  if (modal) modal.classList.add('hidden');
}

function exportCurrentModalBuyer() {
  if (currentModalBuyer && typeof exportSingleLead === 'function') {
    exportSingleLead(currentModalBuyer.id);
  }
}

function selectAudienceBuyer(buyerId) {
  openBuyerDetailModal(buyerId);
}

// Export Campaign Brief in JSON format
function exportAllCampaignData() {
  if (!audienceData) {
    showToast('Audience data not loaded yet.', false);
    return;
  }

  // Filter buyers with readiness score >= 40 (or all if filtered set is empty)
  let qualifiedLeads = (audienceData.qualified_buyers || []).filter(b => (b.readiness_score || 0) >= 40);
  if (qualifiedLeads.length === 0) {
    qualifiedLeads = audienceData.qualified_buyers || [];
  }

  const exportPayload = {
    exported_at: new Date().toISOString(),
    campaign_type: 'Omnichannel Digital Targeting',
    platform: 'Four Corner',
    total_audience_reach: audienceData.total_audience_reach || qualifiedLeads.length,
    campaign_clusters: audienceData.campaign_clusters,
    qualified_buyer_leads: qualifiedLeads.map(b => ({
      id: b.id,
      name: b.name,
      email: b.email,
      phone: b.phone,
      readiness_score: b.readiness_score,
      interested_projects: b.interested_projects,
      saved_units_count: b.saved_units_count,
      inquiries_count: b.inquiries_count
    }))
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `four-corner-campaign-brief-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('Campaign brief exported successfully.', true);

  // Track in export history
  if (typeof recordExport === 'function') {
    const clusterCount = (audienceData.campaign_clusters || []).length;
    recordExport(`Full campaign brief exported (${clusterCount} segments, ${qualifiedLeads.length} leads)`);
  }
}


function exportCampaignCluster(clusterId) {
  if (!audienceData || !audienceData.campaign_clusters) return;
  const cluster = audienceData.campaign_clusters.find(c => c.id === clusterId);
  if (!cluster) return;

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cluster, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `campaign-${cluster.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`Segment "${cluster.name}" exported successfully.`, true);

  // Track in export history
  if (typeof recordExport === 'function') {
    recordExport(`"${cluster.name}" segment exported`);
  }
}

function exportSingleLead(userId) {
  if (!audienceData || !audienceData.qualified_buyers) return;
  const buyer = audienceData.qualified_buyers.find(b => b.id === userId);
  if (!buyer) return;

  const csvContent = 'data:text/csv;charset=utf-8,' + [
    'Name,Email,Phone,Readiness Score,Interested Projects,Saved Units',
    `"${buyer.name}","${buyer.email}","${buyer.phone}","${buyer.readiness_score}","${(buyer.interested_projects || []).join('; ')}","${buyer.saved_units_count || 0}"`
  ].join('\n');

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodeURI(csvContent));
  downloadAnchor.setAttribute('download', `lead-${buyer.id}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`Lead data for ${buyer.name} exported.`, true);
}

// Window exports for HTML onclick handlers
if (typeof window !== 'undefined') {
  window.openCampaignDetail = openCampaignDetail;
  window.closeCampaignDetailModal = closeCampaignDetailModal;
  window.copyAdCreativeHook = copyAdCreativeHook;
  window.exportSingleProjectBrief = exportSingleProjectBrief;
  window.exportAllCampaignData = exportAllCampaignData;
  window.exportCampaignCluster = exportCampaignCluster;
  window.exportSingleLead = exportSingleLead;
  window.switchCampaignTab = switchCampaignTab;
  window.renderAudienceView = renderAudienceView;
  window.renderBuyerLeadsView = renderBuyerLeadsView;
  window.renderAdSegmentsView = renderAdSegmentsView;
  // Campaign Filters
  window.toggleCampaignFilterDropdown = toggleCampaignFilterDropdown;
  window.closeCampaignFilterDropdown = closeCampaignFilterDropdown;
  window.stageCampaignStatusFilter = stageCampaignStatusFilter;
  window.applyCampaignFilters = applyCampaignFilters;
  window.resetCampaignFilters = resetCampaignFilters;
  window.removeCampaignChip = removeCampaignChip;
  // Buyer Leads Table, Filters & Modal
  window.toggleBuyerFilterDropdown = toggleBuyerFilterDropdown;
  window.closeBuyerFilterDropdown = closeBuyerFilterDropdown;
  window.stageBuyerTierFilter = stageBuyerTierFilter;
  window.applyBuyerFilters = applyBuyerFilters;
  window.resetBuyerFilters = resetBuyerFilters;
  window.handleBuyerLeadsSearch = handleBuyerLeadsSearch;
  window.removeBuyerChip = removeBuyerChip;
  window.renderBuyerLeadsTable = renderBuyerLeadsTable;
  window.openBuyerDetailModal = openBuyerDetailModal;
  window.closeBuyerDetailModal = closeBuyerDetailModal;
  window.exportCurrentModalBuyer = exportCurrentModalBuyer;
  window.selectAudienceBuyer = selectAudienceBuyer;
  window.exportProjectsData = exportProjectsData;
  window.exportBuyerLeadsJson = exportBuyerLeadsJson;
}

function exportProjectsData(format = 'csv') {
  const projects = (typeof projectsData !== 'undefined' && Array.isArray(projectsData)) ? projectsData : [];
  if (projects.length === 0) {
    if (typeof showToast === 'function') showToast('No projects available to export.', false);
    return;
  }

  if (format === 'json') {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `four-corner-projects-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (typeof showToast === 'function') showToast('Projects exported in JSON format.', true);
  } else {
    const headers = ['ID', 'Project Name', 'Developer', 'Micro Market', 'RERA ID', 'Verification Status', 'Total Units', 'Search Impressions', 'Price Starting Cr'];
    const rows = projects.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.developer || '').replace(/"/g, '""')}"`,
      `"${(p.micro_market || '').replace(/"/g, '""')}"`,
      `"${(p.rera_id || '').replace(/"/g, '""')}"`,
      `"${(p.verification_status || 'Verified').replace(/"/g, '""')}"`,
      p.total_units || 0,
      p.search_impressions || 0,
      p.price_starting_cr || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
    const a = document.createElement('a');
    a.setAttribute('href', csvContent);
    a.setAttribute('download', `four-corner-projects-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (typeof showToast === 'function') showToast('Projects exported in CSV format.', true);
  }

  if (typeof recordExport === 'function') {
    recordExport(`Projects registry exported (${projects.length} developments, ${format.toUpperCase()})`);
  }
}
window.exportProjectsData = exportProjectsData;

function exportBuyerLeadsJson() {
  const buyers = (typeof audienceData !== 'undefined' && audienceData.all_buyers) ? audienceData.all_buyers : [];
  if (buyers.length === 0) {
    if (typeof showToast === 'function') showToast('No buyer leads available to export.', false);
    return;
  }
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(buyers, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `four-corner-buyer-leads-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof showToast === 'function') showToast('Buyer leads exported in JSON format.', true);

  if (typeof recordExport === 'function') {
    recordExport(`Buyer leads dataset exported (${buyers.length} qualified buyers, JSON)`);
  }
}
window.exportBuyerLeadsJson = exportBuyerLeadsJson;
