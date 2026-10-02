// Overview Page — Summary, Activity Feed, Buyer Distribution, Inventory Status

function renderOverview() {
  renderOverviewKPIs();
  renderRecentActivity();
  renderOverviewBuyerDistribution();
  renderInventoryByMarket();
  renderOpenInquiriesTable();
  renderTopBuyersByScore();
  renderSystemStatus();
}

// ─── Section 1: Summary KPI Cards ────────────────────────────────────────────
function renderOverviewKPIs() {
  const total = allBuyers.length;
  const highIntent = allBuyers.filter(b => (b.readiness_score || b.intent_score || 0) >= 60).length;
  const pendingInquiries = allInquiries.length;
  const totalProperties = allProperties.length;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('ov-kpi-buyers', total);
  set('ov-kpi-intent', highIntent);
  set('ov-kpi-inquiries', pendingInquiries);
  set('ov-kpi-properties', totalProperties);
}

// ─── Section 2: Recent Activity Feed ─────────────────────────────────────────
function renderRecentActivity() {
  const container = document.getElementById('ov-activity-feed');
  if (!container) return;

  // Build a combined activity list from buyers, inquiries, saved units
  const events = [];

  allInquiries.slice(0, 5).forEach(inq => {
    events.push({
      type: 'inquiry',
      label: `${inq.project_name || 'A property'} — Site visit request`,
      sub: `Unit ${inq.unit_id || '—'} · ${inq.inquiry_type || 'Inquiry'}`,
      time: inq.created_at,
      dot: 'bg-amber-500'
    });
  });

  allSavedUnits.slice(0, 5).forEach(s => {
    const buyer = allBuyers.find(b => b.id === s.user_id);
    events.push({
      type: 'saved',
      label: `${buyer ? (buyer.name || 'A buyer') : 'A buyer'} shortlisted Unit ${s.unit_id || '—'}`,
      sub: s.notes || 'Added to shortlisted portfolio',
      time: s.saved_at,
      dot: 'bg-blue-500'
    });
  });

  allBuyers.slice(0, 5).forEach(b => {
    events.push({
      type: 'registered',
      label: `${b.name || 'New buyer'} registered`,
      sub: `${b.email || '—'} · ${b.micro_market_pref || 'Hyderabad'}`,
      time: b.created_at,
      dot: 'bg-emerald-500'
    });
  });

  // Sort all events by time, newest first
  events.sort((a, b) => {
    const ta = a.time ? new Date(a.time).getTime() : 0;
    const tb = b.time ? new Date(b.time).getTime() : 0;
    return tb - ta;
  });

  const top10 = events.slice(0, 10);

  if (top10.length === 0) {
    container.innerHTML = `<div class="py-6 text-center text-slate-400 font-mono text-xs">No recent activity to display.</div>`;
    return;
  }

  container.innerHTML = top10.map(ev => {
    const timeStr = ev.time ? new Date(ev.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent';
    return `
      <div class="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        <span class="mt-1.5 w-2 h-2 rounded-full ${ev.dot} shrink-0"></span>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold text-slate-900 truncate">${escapeHtml(ev.label)}</div>
          <div class="text-[11px] text-slate-500 mt-0.5 truncate">${escapeHtml(ev.sub)}</div>
        </div>
        <div class="text-[10px] font-mono text-slate-400 shrink-0 text-right">${timeStr}</div>
      </div>
    `;
  }).join('');
}

// ─── Section 3: Buyer Intent Distribution ────────────────────────────────────
function renderOverviewBuyerDistribution() {
  const tiers = [
    { label: 'Qualified', range: 'Score 80 – 100', min: 80, max: 101, color: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Active', range: 'Score 60 – 79', min: 60, max: 80, color: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Prospecting', range: 'Score 40 – 59', min: 40, max: 60, color: 'bg-blue-500', textColor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Early Stage', range: 'Score below 40', min: 0, max: 40, color: 'bg-slate-400', textColor: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  const total = allBuyers.length || 1;

  const container = document.getElementById('ov-buyer-distribution');
  if (!container) return;

  container.innerHTML = tiers.map(t => {
    const count = allBuyers.filter(b => {
      const s = b.readiness_score || b.intent_score || 0;
      return s >= t.min && s < t.max;
    }).length;
    const pct = Math.round((count / total) * 100);

    return `
      <div class="flex items-center gap-4 py-2.5 border-b border-slate-100 last:border-0">
        <div class="w-36 shrink-0">
          <div class="text-xs font-semibold text-slate-900">${t.label}</div>
          <div class="text-[10px] text-slate-500 font-mono">${t.range}</div>
        </div>
        <div class="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div class="${t.color} h-2 rounded-full transition-all" style="width: ${pct}%"></div>
        </div>
        <div class="w-20 text-right shrink-0">
          <span class="text-xs font-mono font-bold text-slate-900">${count}</span>
          <span class="text-[10px] text-slate-500 ml-1">(${pct}%)</span>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Section 4: Inventory by Micro-Market ────────────────────────────────────
function renderInventoryByMarket() {
  const container = document.getElementById('ov-inventory-by-market');
  if (!container) return;

  if (!allProperties || allProperties.length === 0) {
    container.innerHTML = `<div class="py-6 text-center text-slate-400 font-mono text-xs">No property data loaded.</div>`;
    return;
  }

  // Group by micro_market
  const marketMap = {};
  allProperties.forEach(p => {
    const mkt = p.micro_market || 'Other';
    if (!marketMap[mkt]) marketMap[mkt] = { count: 0, totalRate: 0, rateCount: 0 };
    marketMap[mkt].count++;
    if (p.base_rate_per_sqft) {
      marketMap[mkt].totalRate += p.base_rate_per_sqft;
      marketMap[mkt].rateCount++;
    }
  });

  const rows = Object.entries(marketMap)
    .sort((a, b) => b[1].count - a[1].count);

  const totalUnits = allProperties.length;

  container.innerHTML = rows.map(([mkt, data]) => {
    const avgRate = data.rateCount > 0 ? Math.round(data.totalRate / data.rateCount) : null;
    const pct = Math.round((data.count / totalUnits) * 100);
    return `
      <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
        <td class="py-2.5 px-4 text-xs font-semibold text-slate-900">${escapeHtml(mkt)}</td>
        <td class="py-2.5 px-4 text-xs font-mono text-slate-700 text-center">${data.count} units</td>
        <td class="py-2.5 px-4 text-xs font-mono text-slate-700 text-center">
          ${avgRate ? `₹${avgRate.toLocaleString('en-IN')}/sqft` : '—'}
        </td>
        <td class="py-2.5 px-4 text-xs font-mono text-slate-500 text-right">${pct}%</td>
      </tr>
    `;
  }).join('');
}

// ─── Section 5: Open Inquiries Requiring Attention ───────────────────────────
function renderOpenInquiriesTable() {
  const container = document.getElementById('ov-open-inquiries');
  if (!container) return;

  const open = allInquiries.slice(0, 8);

  if (open.length === 0) {
    container.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-slate-400 font-mono text-xs">No pending inquiries.</td></tr>`;
    return;
  }

  container.innerHTML = open.map(inq => {
    const buyer = allBuyers.find(b => b.id === inq.user_id);
    const buyerName = buyer ? (buyer.name || 'Unknown') : 'Unknown';
    const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-IN') : '—';

    return `
      <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition text-xs">
        <td class="py-2.5 px-4 font-semibold text-slate-900">${escapeHtml(buyerName)}</td>
        <td class="py-2.5 px-4 text-slate-700">${escapeHtml(inq.project_name || inq.unit_id || '—')}</td>
        <td class="py-2.5 px-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
            ${escapeHtml(inq.inquiry_type || 'General')}
          </span>
        </td>
        <td class="py-2.5 px-4 font-mono text-slate-500 text-right">${dateStr}</td>
      </tr>
    `;
  }).join('');
}

// ─── Section 6: Top 5 Buyers by Readiness Score ──────────────────────────────
function renderTopBuyersByScore() {
  const container = document.getElementById('ov-top-buyers');
  if (!container) return;

  const sorted = [...allBuyers]
    .sort((a, b) => (b.readiness_score || b.intent_score || 0) - (a.readiness_score || a.intent_score || 0))
    .slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400 font-mono text-xs">No buyer data loaded.</td></tr>`;
    return;
  }

  container.innerHTML = sorted.map((b, idx) => {
    const score = b.readiness_score || b.intent_score || 0;
    let scoreBg = 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 80) scoreBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (score >= 60) scoreBg = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (score >= 40) scoreBg = 'bg-blue-50 text-blue-700 border-blue-200';

    const lastActive = b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : '—';

    return `
      <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition text-xs">
        <td class="py-2.5 px-4 font-mono text-slate-400 font-semibold">${idx + 1}</td>
        <td class="py-2.5 px-4 font-semibold text-slate-900">${escapeHtml(b.name || 'Member')}</td>
        <td class="py-2.5 px-4 text-center">
          <span class="px-2 py-0.5 rounded text-[11px] font-mono border font-bold ${scoreBg}">${score}</span>
        </td>
        <td class="py-2.5 px-4 text-slate-600">${escapeHtml(b.micro_market_pref || 'Any area')}</td>
        <td class="py-2.5 px-4 font-mono text-slate-700">${b.budget_max_cr ? `₹${b.budget_max_cr} Cr` : 'Flexible'}</td>
      </tr>
    `;
  }).join('');
}

// ─── Section 7: System Status ─────────────────────────────────────────────────
function renderSystemStatus() {
  const el = document.getElementById('ov-last-sync');
  if (el) el.textContent = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
