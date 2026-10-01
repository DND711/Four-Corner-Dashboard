// Property Inventory, Cost Sheets, and Manual Registration

function renderPropertiesGrid(props) {
  const grid = document.getElementById('properties-grid');
  const countEl = document.getElementById('prop-matched-count');
  if (!grid) return;

  if (countEl) countEl.textContent = props ? props.length : 0;

  if (!props || props.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 font-mono text-xs bg-dark-surface rounded-2xl border border-dark-border">
        No properties matched your search filters.
      </div>`;
    return;
  }

  grid.innerHTML = props.map(p => {
    return `
      <div class="bg-dark-surface rounded-2xl border border-dark-border p-5 flex flex-col justify-between hover:border-slate-600 transition shadow-sm group">
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <span class="text-[10px] font-mono font-bold text-brand-light uppercase tracking-wider">${escapeHtml(p.micro_market)}</span>
              <h3 class="text-base font-bold text-white tracking-tight leading-snug mt-0.5">${escapeHtml(p.project_name)}</h3>
              <div class="text-[11px] text-slate-400">${escapeHtml(p.developer)}</div>
            </div>
            <div class="text-right">
              <div class="text-base font-extrabold text-white num-font">₹${p.total_price_cr} Cr</div>
              <div class="text-[10px] font-mono text-slate-500">All-Inclusive</div>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-3 gap-2 my-3 p-2.5 bg-dark-base rounded-xl border border-dark-border text-center">
            <div>
              <div class="text-[9px] text-slate-500 uppercase font-mono">BHK</div>
              <div class="text-xs font-bold text-slate-200 mt-0.5">${p.bhk} BHK</div>
            </div>
            <div>
              <div class="text-[9px] text-slate-500 uppercase font-mono">True Carpet</div>
              <div class="text-xs font-bold text-emerald-400 mt-0.5 num-font">${p.carpet_area_sqft} sqft</div>
            </div>
            <div>
              <div class="text-[9px] text-slate-500 uppercase font-mono">Efficiency</div>
              <div class="text-xs font-bold text-slate-200 mt-0.5 num-font">${p.usable_efficiency_pct}%</div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-3">
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Unit ${escapeHtml(p.unit_id)}</span>
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">${escapeHtml(p.facing)} Facing</span>
            ${p.is_corner_unit ? '<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Corner Unit</span>' : ''}
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Handover: ${p.handover_date || p.handover_year || '2026'}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-dark-border grid grid-cols-2 gap-2">
          <button onclick="inspectCostSheet('${p.unit_id}')"
            class="w-full py-2 px-2.5 rounded-xl bg-dark-base hover:bg-slate-800 text-slate-200 text-xs font-medium border border-dark-border transition text-center cursor-pointer">
            Cost Sheet
          </button>
          <button onclick="downloadCostSheetCSV('${p.unit_id}')"
            class="w-full py-2 px-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-medium border border-red-900/30 transition text-center cursor-pointer flex items-center justify-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterPropertiesCatalog() {
  const q = (document.getElementById('prop-search-query')?.value || '').toLowerCase().trim();
  const market = document.getElementById('prop-market-select')?.value || '';
  const budget = parseFloat(document.getElementById('prop-budget-select')?.value) || null;
  const bhk = parseFloat(document.getElementById('prop-bhk-select')?.value) || null;
  const cornerOnly = document.getElementById('prop-corner-check')?.checked || false;
  const sunlightOnly = document.getElementById('prop-sunlight-check')?.checked || false;

  const filtered = allProperties.filter(p => {
    const matchesQ = !q ||
      (p.project_name || '').toLowerCase().includes(q) ||
      (p.unit_id || '').toLowerCase().includes(q) ||
      (p.developer || '').toLowerCase().includes(q);

    const matchesMarket = !market || (p.micro_market || '').toLowerCase().includes(market.toLowerCase());
    const matchesBudget = !budget || p.total_price_cr <= budget;
    const matchesBhk = !bhk || p.bhk === bhk;
    const matchesCorner = !cornerOnly || p.is_corner_unit === true;
    const matchesSunlight = !sunlightOnly || (p.has_morning_sunlight || (p.facing && p.facing.toLowerCase().includes('east')));

    return matchesQ && matchesMarket && matchesBudget && matchesBhk && matchesCorner && matchesSunlight;
  });

  renderPropertiesGrid(filtered);
}

async function inspectCostSheet(unitId) {
  try {
    const data = await fetchUnitPricing(unitId);

    document.getElementById('cs-project-title').textContent = `${data.project_name} · ${data.tower || 'Tower'}`;
    document.getElementById('cs-unit-subtitle').textContent = `Unit ${data.unit_id} · ${data.bhk} BHK · ${data.micro_market}`;

    const rows = [
      { label: 'Super Built-up Area', val: `${data.super_built_up_sqft} sqft` },
      { label: 'True Usable Carpet Area', val: `${data.carpet_area_sqft} sqft (${data.usable_efficiency_pct}% efficiency)` },
      { label: 'Base Rate per sqft', val: `₹${data.base_rate_per_sqft.toLocaleString('en-IN')}` },
      { label: 'Base Flat Cost', val: `₹${(data.super_built_up_sqft * data.base_rate_per_sqft).toLocaleString('en-IN')}` },
      { label: 'Floor Rise Charges', val: `₹${data.floor_rise_charges.toLocaleString('en-IN')}` },
      { label: 'Corner Premium', val: `₹${data.corner_premium_charges.toLocaleString('en-IN')}` },
      { label: 'Car Parking (2 slots)', val: `₹${data.car_parking_charges.toLocaleString('en-IN')}` },
      { label: 'Clubhouse Amenities', val: `₹${data.clubhouse_charges.toLocaleString('en-IN')}` },
      { label: 'Infrastructure & Generator', val: `₹${data.infra_charges.toLocaleString('en-IN')}` },
      { label: 'GST (5% Government Tax)', val: `₹${data.gst_inr.toLocaleString('en-IN')}` },
      { label: 'Total All-Inclusive (Out-the-Door)', val: `₹${data.total_price_cr} Cr (₹${data.total_out_the_door_inr.toLocaleString('en-IN')})`, highlight: true },
    ];

    const tbody = document.getElementById('cs-table-body');
    tbody.innerHTML = rows.map(r => `
      <tr class="${r.highlight ? 'bg-brand/20 font-bold text-white' : 'text-slate-300'}">
        <td class="py-2.5 px-4">${r.label}</td>
        <td class="py-2.5 px-4 text-right font-mono">${r.val}</td>
      </tr>
    `).join('');

    const dlBtn = document.getElementById('cs-download-btn');
    if (dlBtn) dlBtn.onclick = () => downloadCostSheetCSV(unitId);

    document.getElementById('cost-sheet-modal').classList.add('open');
  } catch (err) {
    showToast('Error loading cost sheet');
  }
}

function closeCostSheetModal() {
  document.getElementById('cost-sheet-modal').classList.remove('open');
}

function openAddPropertyModal() {
  document.getElementById('add-property-modal').classList.add('open');
  calculateUnitCostPreview();
}

function closeAddPropertyModal() {
  document.getElementById('add-property-modal').classList.remove('open');
}

function calculateUnitCostPreview() {
  const sbu = parseFloat(document.getElementById('inp-sbu')?.value) || 1850;
  const carpet = parseFloat(document.getElementById('inp-carpet')?.value) || 1380;
  const baseRate = parseFloat(document.getElementById('inp-base-rate')?.value) || 7500;
  const isCorner = document.getElementById('inp-corner')?.checked || false;
  const parking = parseFloat(document.getElementById('inp-parking')?.value) || 500000;
  const clubhouse = parseFloat(document.getElementById('inp-clubhouse')?.value) || 400000;

  const baseCost = sbu * baseRate;
  const cornerPremium = isCorner ? 250000 : 0;
  const floorRise = 200000;
  const infra = 300000;

  const subtotal = baseCost + floorRise + cornerPremium + parking + clubhouse + infra;
  const gst = subtotal * 0.05;
  const totalInr = Math.round(subtotal + gst);
  const totalCr = (totalInr / 10000000.0).toFixed(2);
  const eff = ((carpet / sbu) * 100).toFixed(1);

  const previewEl = document.getElementById('preview-total-price');
  const effEl = document.getElementById('preview-efficiency');
  if (previewEl) previewEl.textContent = `₹${totalCr} Cr · ₹${totalInr.toLocaleString('en-IN')}`;
  if (effEl) effEl.textContent = `${eff}% Carpet`;
}

async function submitNewProperty(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('btn-save-property');
  const origText = btn.innerHTML;
  btn.innerHTML = 'Saving to Database...';
  btn.disabled = true;

  const formData = new FormData(form);
  const payload = {
    project_name: formData.get('project_name'),
    developer: formData.get('developer'),
    micro_market: formData.get('micro_market'),
    rera_id: formData.get('rera_id'),
    handover_year: parseInt(formData.get('handover_year')),
    tower: formData.get('tower'),
    floor: parseInt(formData.get('floor')),
    bhk: parseFloat(formData.get('bhk')),
    facing: formData.get('facing'),
    is_corner_unit: form.is_corner_unit.checked,
    has_morning_sunlight: form.has_morning_sunlight.checked,
    super_built_up_sqft: parseInt(formData.get('super_built_up_sqft')),
    carpet_area_sqft: parseInt(formData.get('carpet_area_sqft')),
    balcony_sqft: parseInt(formData.get('balcony_sqft')),
    base_rate_per_sqft: parseInt(formData.get('base_rate_per_sqft')),
    car_parking_charges: parseInt(formData.get('car_parking_charges')),
    clubhouse_charges: parseInt(formData.get('clubhouse_charges'))
  };

  try {
    const data = await postNewProperty(payload);
    showToast(`Success: ${data.message || 'Property added'}`);
    closeAddPropertyModal();
    form.reset();
    await loadDashboardData();
    switchView('inventory');
  } catch (err) {
    console.error(err);
    showToast('Error saving property record');
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}
