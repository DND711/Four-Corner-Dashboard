// Buyer Pipeline, Inquiries, and Intent Profiles

function renderKPIs() {
  const totalBuyers = allBuyers.length;
  const highIntentCount = allBuyers.filter(b => (b.readiness_score || b.intent_score || 0) >= 60).length;
  const totalInquiries = allInquiries.length;
  const totalSaved = allSavedUnits.length;

  const tbEl = document.getElementById('kpi-total-buyers');
  const hiEl = document.getElementById('kpi-high-intent');
  const inqEl = document.getElementById('kpi-inquiries');
  const suEl = document.getElementById('kpi-saved-units');
  const inqBadge = document.getElementById('inquiry-count-badge');

  if (tbEl) tbEl.textContent = totalBuyers;
  if (hiEl) hiEl.textContent = highIntentCount;
  if (inqEl) inqEl.textContent = totalInquiries;
  if (suEl) suEl.textContent = totalSaved;
  if (inqBadge) inqBadge.textContent = `${totalInquiries} Inquiries`;
}

function renderBuyersTable(buyers) {
  const tbody = document.getElementById('buyers-table-body');
  if (!tbody) return;

  if (!buyers || buyers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-500 font-mono text-xs">
          No registered buyers match the current filter.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = buyers.map(b => {
    const score = b.readiness_score || b.intent_score || 0;
    let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
    let tierLabel = 'Casual Browser';

    if (score >= 80) {
      badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      tierLabel = 'High-Intent Buyer';
    } else if (score >= 60) {
      badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      tierLabel = 'Serious Evaluator';
    } else if (score >= 40) {
      badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      tierLabel = 'Warm Explorer';
    }

    const bd = b.intent_breakdown || {};
    const fin = bd.financial_precision ? bd.financial_precision.score : 0;
    const cmm = bd.commute_alignment ? bd.commute_alignment.score : 0;
    const arch = bd.architectural_depth ? bd.architectural_depth.score : 0;

    return `
      <tr class="hover:bg-dark-elevated/40 transition">
        <td class="py-3 px-4">
          <div class="font-bold text-white">${escapeHtml(b.name || 'Member')}</div>
          <div class="text-[11px] text-slate-400 font-mono">${escapeHtml(b.email || 'No email')}</div>
          <div class="text-[10px] text-slate-500 font-mono">${escapeHtml(b.phone || '')}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-200">${escapeHtml(b.micro_market_pref || 'Any Area')}</div>
          <div class="text-[11px] text-slate-400 font-mono">Max: ₹${b.budget_max_cr ? b.budget_max_cr + ' Cr' : 'Flexible'} · ${b.bhk_pref ? b.bhk_pref + ' BHK' : 'Any BHK'}</div>
        </td>
        <td class="py-3 px-4">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${badgeColor}">
            <span class="font-bold">${score}/100</span>
            <span>·</span>
            <span>${tierLabel}</span>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-[10px] text-slate-400">
          <div>Budget: <span class="text-white">${fin}/25</span> · Commute: <span class="text-white">${cmm}/20</span></div>
          <div>Carpet: <span class="text-white">${arch}/20</span></div>
        </td>
        <td class="py-3 px-4">
          <div class="font-mono text-[11px] text-slate-300">${b.saved_units_count || 0} saved · ${b.inquiries_count || 0} inquiries</div>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="openBuyerModal('${b.id}')"
            class="px-3 py-1.5 rounded-lg bg-dark-base hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs border border-dark-border transition cursor-pointer">
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

    return matchesQuery && matchesTier;
  });

  renderBuyersTable(filtered);
}

function renderInquiries(inquiries) {
  const container = document.getElementById('inquiries-container');
  if (!container) return;

  if (!inquiries || inquiries.length === 0) {
    container.innerHTML = `
      <div class="p-4 text-center text-slate-500 font-mono text-xs bg-dark-base rounded-xl border border-dark-border">
        No live inquiries received yet. Inquiries will appear automatically when users interact with ChatGPT or Claude.
      </div>`;
    return;
  }

  container.innerHTML = inquiries.map(inq => {
    const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleString() : 'Just now';
    return `
      <div class="p-3.5 bg-dark-base rounded-xl border border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-white text-xs">${escapeHtml(inq.project_name || 'Property Inquiry')}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">${escapeHtml(inq.unit_id || 'Unit')}</span>
              <span class="text-[10px] font-mono text-emerald-400 uppercase">${escapeHtml(inq.inquiry_type || 'General')}</span>
            </div>
            <p class="text-xs text-slate-300 mt-1">"${escapeHtml(inq.user_message || 'Interested in floor plan and pricing details.')}"</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-[10px] font-mono text-slate-500">${dateStr}</div>
          <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Status: ${escapeHtml(inq.status || 'Active')}</span>
        </div>
      </div>
    `;
  }).join('');
}

function openBuyerModal(buyerId) {
  const buyer = allBuyers.find(b => b.id === buyerId);
  if (!buyer) return;

  document.getElementById('modal-buyer-name').textContent = buyer.name || 'Member';
  document.getElementById('modal-buyer-sub').textContent = `${buyer.id} · Joined ${buyer.created_at ? new Date(buyer.created_at).toLocaleDateString() : ''}`;
  document.getElementById('modal-buyer-email').textContent = buyer.email || '--';
  document.getElementById('modal-buyer-phone').textContent = buyer.phone || '--';
  document.getElementById('modal-buyer-budget').textContent = buyer.budget_max_cr ? `₹${buyer.budget_max_cr} Cr` : 'Flexible';
  document.getElementById('modal-buyer-area').textContent = buyer.micro_market_pref || 'Any Area';

  const score = buyer.readiness_score || buyer.intent_score || 0;
  document.getElementById('modal-readiness-num').textContent = score;
  document.getElementById('modal-readiness-label').textContent = buyer.readiness_label || 'Evaluating properties';
  document.getElementById('modal-rec-action').textContent = `Recommended Action: ${buyer.recommended_action || 'Present verified floor plans and cost breakdown'}`;

  // Render Intent Bars
  const bd = buyer.intent_breakdown || {};
  const dimensions = [
    { label: 'Financial Precision & Budget Discipline', val: bd.financial_precision ? bd.financial_precision.score : 0, max: 25 },
    { label: 'Commute Alignment & Rush-Hour Realism', val: bd.commute_alignment ? bd.commute_alignment.score : 0, max: 20 },
    { label: 'Architectural Depth & Carpet Verification', val: bd.architectural_depth ? bd.architectural_depth.score : 0, max: 20 },
    { label: 'Legal Due Diligence & TS-RERA Verification', val: bd.legal_due_diligence ? bd.legal_due_diligence.score : 0, max: 15 },
    { label: 'Commitment Signals & Site Visit Engagement', val: bd.commitment_signals ? bd.commitment_signals.score : 0, max: 20 },
  ];

  const barsContainer = document.getElementById('modal-intent-bars');
  barsContainer.innerHTML = dimensions.map(d => {
    const pct = Math.round((d.val / d.max) * 100);
    return `
      <div class="p-2 bg-dark-base rounded-xl border border-dark-border">
        <div class="flex justify-between text-[11px] mb-1">
          <span class="text-slate-300">${d.label}</span>
          <span class="text-white font-mono font-bold">${d.val} / ${d.max} (${pct}%)</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div class="bg-brand-light h-1.5 rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Render Target Properties & Inquiries
  const buyerInquiries = allInquiries.filter(i => i.user_id === buyer.id);
  const buyerSaved = allSavedUnits.filter(s => s.user_id === buyer.id);
  const propContainer = document.getElementById('modal-target-properties');

  let propHtml = '';
  if (buyerSaved.length > 0) {
    propHtml += buyerSaved.map(s => `
      <div class="p-2.5 bg-dark-base rounded-xl border border-dark-border flex items-center justify-between">
        <div>
          <div class="font-bold text-white text-xs">Saved Unit: ${escapeHtml(s.unit_id)}</div>
          <div class="text-[11px] text-slate-400">${escapeHtml(s.notes || 'Shortlisted in portfolio')}</div>
        </div>
        <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Shortlisted</span>
      </div>
    `).join('');
  }

  if (buyerInquiries.length > 0) {
    propHtml += buyerInquiries.map(i => `
      <div class="p-2.5 bg-dark-base rounded-xl border border-dark-border flex items-center justify-between">
        <div>
          <div class="font-bold text-white text-xs">Inquiry: ${escapeHtml(i.project_name || i.unit_id)}</div>
          <div class="text-[11px] text-slate-400">"${escapeHtml(i.user_message || 'Visit request')}"</div>
        </div>
        <span class="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">${escapeHtml(i.inquiry_type || 'Inquiry')}</span>
      </div>
    `).join('');
  }

  if (!propHtml) {
    propHtml = `<div class="p-3 text-center text-slate-500 font-mono text-xs bg-dark-base rounded-xl">No specific units shortlisted yet</div>`;
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
