// Overview Intelligence Module for Four Corner Console

async function loadOverviewData() {
  try {
    const data = await fetchOverviewAnalytics();
    overviewData = data;
    renderOverview();
  } catch (err) {
    console.error('Failed to load overview analytics:', err);
  }
}

function renderOverview() {
  if (!overviewData || !overviewData.summary) return;

  const s = overviewData.summary;

  // 1. Metric Cards
  const kpiProjects = document.getElementById('kpi-verified-projects');
  if (kpiProjects) {
    kpiProjects.textContent = `${s.verified_projects} / ${s.total_projects}`;
  }
  const kpiPending = document.getElementById('kpi-pending-verification');
  if (kpiPending) {
    kpiPending.textContent = s.pending_verification > 0 ? `${s.pending_verification} pending review` : 'All verified';
  }

  const kpiSearches = document.getElementById('kpi-total-searches');
  if (kpiSearches) {
    kpiSearches.textContent = Number(s.total_searches).toLocaleString();
  }

  const kpiBuyers = document.getElementById('kpi-registered-buyers');
  if (kpiBuyers) {
    kpiBuyers.textContent = `${s.active_search_users} / ${s.total_registered_users}`;
  }

  const kpiInventory = document.getElementById('kpi-inventory-val');
  if (kpiInventory) {
    kpiInventory.textContent = `₹${s.total_inventory_val_cr} Cr`;
  }
  const kpiUnits = document.getElementById('kpi-total-units');
  if (kpiUnits) {
    kpiUnits.textContent = `${Number(s.total_units).toLocaleString()} units`;
  }

  // 2. Micro-Market Demand Breakdown
  const marketContainer = document.getElementById('overview-market-breakdown');
  if (marketContainer && overviewData.top_locations) {
    const maxVal = Math.max(...overviewData.top_locations.map(l => l.count), 1);
    marketContainer.innerHTML = overviewData.top_locations.map(loc => {
      const pct = Math.round((loc.count / maxVal) * 100);
      return `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-slate-700">${escapeHtml(loc.micro_market)}</span>
            <span class="font-mono text-slate-500 font-semibold">${loc.count} searches</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-[#6D001A] h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Budget Distribution
  const budgetContainer = document.getElementById('overview-budget-breakdown');
  if (budgetContainer && overviewData.budget_distribution) {
    budgetContainer.innerHTML = overviewData.budget_distribution.map(b => {
      return `
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[11px] text-slate-500 font-medium">${escapeHtml(b.tier)}</div>
          <div class="text-base font-bold text-slate-900 mt-0.5">${b.pct}%</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">${b.count} searches</div>
        </div>
      `;
    }).join('');
  }

  // 4. Top Exposed Projects by AI Search
  const topProjectsContainer = document.getElementById('overview-top-projects');
  if (topProjectsContainer && overviewData.top_exposed_projects) {
    topProjectsContainer.innerHTML = overviewData.top_exposed_projects.map((p, idx) => {
      return `
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="px-4 py-3 text-xs font-mono text-slate-400 font-bold">#${idx + 1}</td>
          <td class="px-4 py-3">
            <div class="text-xs font-semibold text-slate-900">${escapeHtml(p.name)}</div>
            <div class="text-[11px] text-slate-500">${escapeHtml(p.developer)}</div>
          </td>
          <td class="px-4 py-3 text-xs text-slate-600 font-medium">
            <span class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
              ${escapeHtml(p.micro_market)}
            </span>
          </td>
          <td class="px-4 py-3 text-xs font-mono font-bold text-[#6D001A] text-right">
            ${p.search_impressions}
          </td>
          <td class="px-4 py-3 text-right">
            <button onclick="inspectProjectIntelWithHighlight('${escapeHtml(p.name)}')" 
              class="px-2.5 py-1 text-[11px] font-semibold text-[#6D001A] bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200/60">
              View Searches
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}
