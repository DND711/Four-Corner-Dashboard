// Buyer Pipeline & Lead Intelligence

function renderKPIs() {
  const totalBuyers = allBuyers.length;
  const highIntentCount = allBuyers.filter(b => (b.readiness_score || b.intent_score || 0) >= 60).length;
  const totalInquiries = allInquiries.length;
  const totalSaved = allSavedUnits.length;

  // Calculate Total Pipeline Purchasing Power
  let totalPipelineGmvCr = 0;
  allBuyers.forEach(b => {
    if (b.budget_max_cr) {
      totalPipelineGmvCr += parseFloat(b.budget_max_cr);
    } else {
      totalPipelineGmvCr += 2.0; // conservative estimate for serious buyers
    }
  });

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('kpi-total-buyers', totalBuyers);
  setEl('kpi-high-intent', highIntentCount);
  setEl('kpi-inquiries', totalInquiries);
  setEl('kpi-pipeline-gmv', `₹${totalPipelineGmvCr.toFixed(1)} Cr`);
  setEl('inquiry-count-badge', `${totalInquiries} Pending Requests`);
}

function renderBuyersTable(buyers) {
  const tbody = document.getElementById('buyers-table-body');
  if (!tbody) return;

  if (!buyers || buyers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-500 font-mono text-xs">
          No registered buyers match the selected filters.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = buyers.map(b => {
    const score = b.readiness_score || b.intent_score || 0;
    let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
    let tierLabel = 'Casual Browser';
    let dotColor = 'bg-slate-400';

    if (score >= 80) {
      badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      tierLabel = 'High Intent';
      dotColor = 'bg-emerald-400';
    } else if (score >= 60) {
      badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      tierLabel = 'Active Evaluator';
      dotColor = 'bg-amber-400';
    } else if (score >= 40) {
      badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      tierLabel = 'Active Searcher';
      dotColor = 'bg-blue-400';
    }

    const bd = b.intent_breakdown || {};
    const fin = bd.financial_precision ? bd.financial_precision.score : 0;
    const cmm = bd.commute_alignment ? bd.commute_alignment.score : 0;
    const arch = bd.architectural_depth ? bd.architectural_depth.score : 0;
    const leg = bd.legal_due_diligence ? bd.legal_due_diligence.score : 0;
    const act = bd.commitment_signals ? bd.commitment_signals.score : 0;

    // Initials Avatar
    const name = b.name || 'Member';
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return `
      <tr class="data-row hover:bg-white/5 transition border-b border-white/5 text-xs">
        <!-- Buyer Identity & Contact -->
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-mono font-bold text-white text-[11px] shrink-0">
              ${initials}
            </div>
            <div>
              <div class="font-bold text-white flex items-center gap-1.5">
                <span>${escapeHtml(name)}</span>
                <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
              </div>
              <div class="text-[11px] text-slate-400 font-mono">${escapeHtml(b.email || 'No email')}</div>
              <div class="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <span>${escapeHtml(b.phone || 'No phone')}</span>
                ${b.phone ? `<button onclick="copyToClipboard('${b.phone}')" class="text-slate-400 hover:text-white cursor-pointer" title="Copy Phone">Copy</button>` : ''}
              </div>
            </div>
          </div>
        </td>

        <!-- Search Criteria -->
        <td class="py-3 px-4 font-mono">
          <div class="font-medium text-slate-200">${escapeHtml(b.micro_market_pref || 'West Corridor')}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">
            Budget: <strong class="text-white">₹${b.budget_max_cr ? b.budget_max_cr + ' Cr' : 'Flexible'}</strong>
          </div>
          <div class="text-[10px] text-slate-500">${b.bhk_pref ? b.bhk_pref + ' BHK' : 'Any BHK Configuration'}</div>
        </td>

        <!-- Readiness Score -->
        <td class="py-3 px-4">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${badgeColor}">
            <span class="font-bold">${score}/100</span>
            <span>·</span>
            <span>${tierLabel}</span>
          </div>
          <div class="w-28 bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div class="${score >= 70 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-blue-400'} h-1.5 rounded-full" style="width: ${score}%"></div>
          </div>
        </td>

        <!-- Intent Breakdown -->
        <td class="py-3 px-4 font-mono text-[10px] text-slate-400">
          <div class="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <div>Budget: <span class="text-white font-medium">${fin}/25</span></div>
            <div>Commute: <span class="text-white font-medium">${cmm}/20</span></div>
            <div>Carpet: <span class="text-white font-medium">${arch}/20</span></div>
            <div>RERA: <span class="text-white font-medium">${leg}/15</span></div>
          </div>
        </td>

        <!-- Shortlisted & Inquiries -->
        <td class="py-3 px-4 font-mono text-[11px]">
          <div class="text-slate-300">
            <span class="font-bold text-white">${b.saved_units_count || 0}</span> saved units
          </div>
          <div class="text-slate-400 text-[10px] mt-0.5">
            <span class="text-amber-400 font-bold">${b.inquiries_count || 0}</span> inquiries
          </div>
        </td>

        <!-- Actions -->
        <td class="py-3 px-4 text-right">
          <button onclick="openBuyerModal('${b.id}')"
            class="px-3 py-1.5 rounded-lg bg-dark-base hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs border border-white/10 transition cursor-pointer">
            View Profile
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterBuyersTable() {
  const q = (document.getElementById('buyer-search-input')?.value || '').toLowerCase().trim();
  const tier = document.getElementById('buyer-tier-filter')?.value || 'ALL';
  const market = document.getElementById('buyer-market-filter')?.value || 'ALL';

  const filtered = allBuyers.filter(b => {
    const matchesQuery = !q || 
      (b.name || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.phone || '').toLowerCase().includes(q) ||
      (b.micro_market_pref || '').toLowerCase().includes(q);

    const score = b.readiness_score || b.intent_score || 0;
    let matchesTier = true;
    if (tier === 'HIGH_INTENT') matchesTier = score >= 80;
    else if (tier === 'SERIOUS_EVALUATOR') matchesTier = score >= 60 && score < 80;
    else if (tier === 'WARM_EXPLORER') matchesTier = score >= 40 && score < 60;
    else if (tier === 'CASUAL_BROWSER') matchesTier = score < 40;

    let matchesMarket = true;
    if (market !== 'ALL') {
      matchesMarket = (b.micro_market_pref || '').toLowerCase().includes(market.toLowerCase());
    }

    return matchesQuery && matchesTier && matchesMarket;
  });

  renderBuyersTable(filtered);
}

function renderInquiries(inquiries) {
  const container = document.getElementById('inquiries-container');
  if (!container) return;

  if (!inquiries || inquiries.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-500 font-mono text-xs surface-card rounded-xl">
        No active site visit or pricing inquiries in queue.
      </div>`;
    return;
  }

  container.innerHTML = inquiries.map(inq => {
    const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleString() : 'Recent';
    return `
      <div class="p-4 bg-dark-base rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-bold text-white text-xs">${escapeHtml(inq.project_name || 'Property Inquiry')}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-white/10 font-bold">Unit ${escapeHtml(inq.unit_id || 'Unit')}</span>
              <span class="text-[10px] font-mono text-emerald-400 uppercase font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">${escapeHtml(inq.inquiry_type || 'Site Visit')}</span>
            </div>
            <p class="text-xs text-slate-300 mt-1">"${escapeHtml(inq.user_message || 'Requested site visit and blueprint inspection.')}"</p>
          </div>
        </div>
        <div class="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
          <div class="text-[10px] font-mono text-slate-500">${dateStr}</div>
          <button onclick="showToast('Site visit assignment confirmed')" class="px-2.5 py-1 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer">
            Confirm Visit
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openBuyerModal(buyerId) {
  const buyer = allBuyers.find(b => b.id === buyerId);
  if (!buyer) return;

  document.getElementById('modal-buyer-name').textContent = buyer.name || 'Member';
  document.getElementById('modal-buyer-sub').textContent = `User ID: ${buyer.id} · Registered ${buyer.created_at ? new Date(buyer.created_at).toLocaleDateString() : 'Active'}`;
  document.getElementById('modal-buyer-email').textContent = buyer.email || '--';
  document.getElementById('modal-buyer-phone').textContent = buyer.phone || '--';
  document.getElementById('modal-buyer-budget').textContent = buyer.budget_max_cr ? `₹${buyer.budget_max_cr} Cr` : 'Flexible';
  document.getElementById('modal-buyer-area').textContent = buyer.micro_market_pref || 'Any Area';

  const score = buyer.readiness_score || buyer.intent_score || 0;
  document.getElementById('modal-readiness-num').textContent = score;
  document.getElementById('modal-readiness-label').textContent = buyer.readiness_label || 'Active lead evaluating verified properties';
  document.getElementById('modal-rec-action').textContent = `Operational Next Step: ${buyer.recommended_action || 'Present floor plans and arrange builder visit'}`;

  // 5 Intent Dimensions
  const bd = buyer.intent_breakdown || {};
  const dimensions = [
    { label: 'Budget Precision & Capital Readiness', val: bd.financial_precision ? bd.financial_precision.score : 0, max: 25 },
    { label: 'Commute Alignment (8:30 AM Peak Tolerance)', val: bd.commute_alignment ? bd.commute_alignment.score : 0, max: 20 },
    { label: 'Usable Carpet Ratio Scrutiny', val: bd.architectural_depth ? bd.architectural_depth.score : 0, max: 20 },
    { label: 'TS-RERA 70% Escrow & Sanction Due Diligence', val: bd.legal_due_diligence ? bd.legal_due_diligence.score : 0, max: 15 },
    { label: 'Action Signals & Site Visit Engagement', val: bd.commitment_signals ? bd.commitment_signals.score : 0, max: 20 },
  ];

  const barsContainer = document.getElementById('modal-intent-bars');
  barsContainer.innerHTML = dimensions.map(d => {
    const pct = Math.round((d.val / d.max) * 100);
    return `
      <div class="p-2.5 bg-dark-base rounded-xl border border-white/5">
        <div class="flex justify-between text-xs mb-1.5">
          <span class="text-slate-300 font-medium">${d.label}</span>
          <span class="text-white font-mono font-bold">${d.val} / ${d.max} (${pct}%)</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div class="bg-[#6D001A] h-1.5 rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Shortlisted Properties & Inquiries
  const buyerInquiries = allInquiries.filter(i => i.user_id === buyer.id);
  const buyerSaved = allSavedUnits.filter(s => s.user_id === buyer.id);
  const propContainer = document.getElementById('modal-target-properties');

  let propHtml = '';
  if (buyerSaved.length > 0) {
    propHtml += buyerSaved.map(s => `
      <div class="p-3 bg-dark-base rounded-xl border border-white/5 flex items-center justify-between">
        <div>
          <div class="font-bold text-white text-xs">Saved Unit: ${escapeHtml(s.unit_id)}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">${escapeHtml(s.notes || 'Added to shortlisted portfolio')}</div>
        </div>
        <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">Shortlisted</span>
      </div>
    `).join('');
  }

  if (buyerInquiries.length > 0) {
    propHtml += buyerInquiries.map(i => `
      <div class="p-3 bg-dark-base rounded-xl border border-white/5 flex items-center justify-between">
        <div>
          <div class="font-bold text-white text-xs">Inquiry: ${escapeHtml(i.project_name || i.unit_id)}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">"${escapeHtml(i.user_message || 'Visit request')}"</div>
        </div>
        <span class="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">${escapeHtml(i.inquiry_type || 'Inquiry')}</span>
      </div>
    `).join('');
  }

  if (!propHtml) {
    propHtml = `<div class="p-4 text-center text-slate-500 font-mono text-xs bg-dark-base rounded-xl border border-white/5">No specific units shortlisted yet</div>`;
  }
  propContainer.innerHTML = propHtml;

  // Profile Download button
  const downloadBtn = document.getElementById('modal-download-profile-btn');
  if (downloadBtn) {
    downloadBtn.onclick = () => exportSingleBuyerProfileCSV(buyer);
  }

  document.getElementById('buyer-detail-modal').classList.add('open');
}

function closeBuyerModal() {
  document.getElementById('buyer-detail-modal').classList.remove('open');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied to clipboard: ${text}`);
  }).catch(() => {
    showToast(`Phone: ${text}`);
  });
}
