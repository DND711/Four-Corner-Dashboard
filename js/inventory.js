// Property Inventory: Grid & Dense Spreadsheet Views, Cost Sheets, and Manual Registration

let inventoryViewMode = 'grid'; // 'grid' | 'table'
let currentSortField = 'price-asc';

function setInventoryView(mode) {
  inventoryViewMode = mode;
  const gridBtn = document.getElementById('view-toggle-grid');
  const tableBtn = document.getElementById('view-toggle-table');

  if (mode === 'grid') {
    if (gridBtn) gridBtn.className = "p-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 font-medium shadow-sm";
    if (tableBtn) tableBtn.className = "p-1.5 rounded-lg text-slate-500 hover:text-slate-900";
  } else {
    if (tableBtn) tableBtn.className = "p-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 font-medium shadow-sm";
    if (gridBtn) gridBtn.className = "p-1.5 rounded-lg text-slate-500 hover:text-slate-900";
  }

  filterPropertiesCatalog();
}

function handleInventorySort(sortVal) {
  currentSortField = sortVal;
  filterPropertiesCatalog();
}

function renderPropertiesGrid(props) {
  const container = document.getElementById('inventory-container');
  const countEl = document.getElementById('prop-matched-count');
  if (!container) return;

  if (countEl) countEl.textContent = props ? props.length : 0;

  if (!props || props.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 font-mono text-xs bg-white rounded-xl border border-slate-200">
        No properties match your current filters. Adjust your criteria or register a new property.
      </div>`;
    return;
  }

  if (inventoryViewMode === 'table') {
    renderPropertiesTableView(props, container);
  } else {
    renderPropertiesCardView(props, container);
  }
}

function renderPropertiesCardView(props, container) {
  const assetImages = [
    'assets/tower_exterior.jpg',
    'assets/floor_plan_blueprint.jpg',
    'assets/interior_sunlight.jpg',
    'assets/orr_highway_commute.jpg'
  ];

  container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5";
  container.innerHTML = props.map((p, idx) => {
    const imgUrl = assetImages[idx % assetImages.length];
    const efficiency = p.usable_efficiency_pct || ((p.carpet_area_sqft / p.super_built_up_sqft) * 100).toFixed(1);

    return `
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between group">
        <!-- Visual Header Image -->
        <div class="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img src="${imgUrl}" alt="${escapeHtml(p.project_name)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          <!-- Top Badges -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200">
              ${escapeHtml(p.micro_market)}
            </span>
            <span class="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#6D001A] text-white shadow-sm">
              ${p.bhk} BHK
            </span>
          </div>

          <!-- Bottom Badges -->
          <div class="absolute bottom-2.5 left-3 right-3 flex items-baseline justify-between text-white">
            <div>
              <div class="text-[11px] font-mono text-slate-200">Unit ${escapeHtml(p.unit_id)} · Tower ${escapeHtml(p.tower || 'A')}</div>
              <div class="text-sm font-extrabold tracking-tight">${escapeHtml(p.project_name)}</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-black num-font text-white">₹${p.total_price_cr} Cr</div>
              <div class="text-[9px] font-mono text-emerald-300 font-bold">All-Inclusive</div>
            </div>
          </div>
        </div>

        <!-- Body Details -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100">
              <span>Developer: <strong class="text-slate-800">${escapeHtml(p.developer)}</strong></span>
              <span class="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">${p.rera_id || 'TS-RERA Approved'}</span>
            </div>

            <!-- Spatial Efficiency Strip -->
            <div class="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center mb-3">
              <div>
                <div class="text-[9px] uppercase font-mono text-slate-400">Super Built-up</div>
                <div class="text-xs font-bold font-mono text-slate-700 mt-0.5">${p.super_built_up_sqft} sqft</div>
              </div>
              <div>
                <div class="text-[9px] uppercase font-mono text-slate-400">True Carpet</div>
                <div class="text-xs font-bold font-mono text-emerald-600 mt-0.5">${p.carpet_area_sqft} sqft</div>
              </div>
              <div>
                <div class="text-[9px] uppercase font-mono text-slate-400">Efficiency</div>
                <div class="text-xs font-bold font-mono text-slate-900 mt-0.5">${efficiency}%</div>
              </div>
            </div>

            <!-- Attributes -->
            <div class="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-600 mb-4">
              <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">${escapeHtml(p.facing || 'East')} Facing</span>
              ${p.is_corner_unit ? '<span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Corner Unit</span>' : ''}
              ${p.has_morning_sunlight ? '<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">Morning Sun</span>' : ''}
              <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Floor: ${p.floor || '16'}</span>
              <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Possession: ${p.handover_date || p.handover_year || 'Dec 2026'}</span>
            </div>
          </div>

          <!-- Bottom Action Strip -->
          <div class="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button onclick="inspectCostSheet('${p.unit_id}')"
              class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer text-center flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Cost Sheet</span>
            </button>
            <button onclick="downloadCostSheetCSV('${p.unit_id}')"
              class="w-full py-2 px-3 rounded-xl bg-[#6D001A] hover:bg-[#8A0021] text-white text-xs font-semibold transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPropertiesTableView(props, container) {
  container.className = "w-full overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm";
  container.innerHTML = `
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-mono border-b border-slate-200">
        <tr>
          <th class="py-3 px-4">Unit Identification</th>
          <th class="py-3 px-4">Project & Developer</th>
          <th class="py-3 px-4">Micro-Market</th>
          <th class="py-3 px-4">BHK & Facing</th>
          <th class="py-3 px-4">SBU / True Carpet</th>
          <th class="py-3 px-4">Carpet Efficiency</th>
          <th class="py-3 px-4">All-Inclusive Price</th>
          <th class="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-slate-700">
        ${props.map(p => {
          const efficiency = p.usable_efficiency_pct || ((p.carpet_area_sqft / p.super_built_up_sqft) * 100).toFixed(1);
          return `
            <tr class="data-row hover:bg-slate-50 transition">
              <td class="py-3 px-4 font-mono font-bold text-slate-900">
                <div>Unit ${escapeHtml(p.unit_id)}</div>
                <div class="text-[10px] text-slate-500 font-normal">Tower ${escapeHtml(p.tower || 'A')} · Floor ${p.floor || '1'}</div>
              </td>
              <td class="py-3 px-4">
                <div class="font-bold text-slate-900">${escapeHtml(p.project_name)}</div>
                <div class="text-[10px] text-slate-500">${escapeHtml(p.developer)}</div>
              </td>
              <td class="py-3 px-4 font-mono text-slate-700">
                ${escapeHtml(p.micro_market)}
              </td>
              <td class="py-3 px-4 font-mono">
                <span class="font-bold text-slate-900">${p.bhk} BHK</span> · ${escapeHtml(p.facing || 'East')}
                ${p.is_corner_unit ? '· <span class="text-emerald-700 font-bold">Corner</span>' : ''}
              </td>
              <td class="py-3 px-4 font-mono">
                <div>${p.super_built_up_sqft} SBU</div>
                <div class="text-emerald-700 font-bold">${p.carpet_area_sqft} Carpet</div>
              </td>
              <td class="py-3 px-4 font-mono">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${parseFloat(efficiency) >= 77 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'}">
                  ${efficiency}%
                </span>
              </td>
              <td class="py-3 px-4 font-mono">
                <div class="text-sm font-bold text-slate-900">₹${p.total_price_cr} Cr</div>
                <div class="text-[10px] text-slate-500">₹${p.base_rate_per_sqft || ''}/sqft base</div>
              </td>
              <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                <button onclick="inspectCostSheet('${p.unit_id}')"
                  class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer">
                  Cost Sheet
                </button>
                <button onclick="downloadCostSheetCSV('${p.unit_id}')"
                  class="px-2.5 py-1.5 rounded-lg bg-[#6D001A] hover:bg-[#8A0021] text-white text-xs font-semibold transition cursor-pointer shadow-sm">
                  CSV
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function filterPropertiesCatalog() {
  const q = (document.getElementById('prop-search-query')?.value || '').toLowerCase().trim();
  const market = document.getElementById('prop-market-select')?.value || '';
  const budget = parseFloat(document.getElementById('prop-budget-select')?.value) || null;
  const bhk = parseFloat(document.getElementById('prop-bhk-select')?.value) || null;
  const cornerOnly = document.getElementById('prop-corner-check')?.checked || false;
  const sunlightOnly = document.getElementById('prop-sunlight-check')?.checked || false;

  let filtered = allProperties.filter(p => {
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

  if (currentSortField === 'price-asc') {
    filtered.sort((a, b) => a.total_price_cr - b.total_price_cr);
  } else if (currentSortField === 'price-desc') {
    filtered.sort((a, b) => b.total_price_cr - a.total_price_cr);
  } else if (currentSortField === 'efficiency-desc') {
    filtered.sort((a, b) => (b.usable_efficiency_pct || 0) - (a.usable_efficiency_pct || 0));
  } else if (currentSortField === 'sbu-desc') {
    filtered.sort((a, b) => b.super_built_up_sqft - a.super_built_up_sqft);
  }

  renderPropertiesGrid(filtered);
}

// ─── Authentic Itemized Builder Cost Sheet Modal ───
async function inspectCostSheet(unitId) {
  try {
    const data = await fetchUnitPricing(unitId);

    document.getElementById('cs-project-title').textContent = data.project_name;
    document.getElementById('cs-unit-subtitle').textContent = `Unit ${data.unit_id} · Tower ${data.tower || 'A'} · Floor ${data.floor || '16'} · ${data.bhk} BHK · ${data.micro_market}`;
    document.getElementById('cs-developer-name').textContent = data.developer;
    document.getElementById('cs-rera-id').textContent = data.rera_id || 'P02400005724';

    // Spatial Metrics
    document.getElementById('cs-sbu-val').textContent = `${data.super_built_up_sqft} sqft`;
    document.getElementById('cs-carpet-val').textContent = `${data.carpet_area_sqft} sqft`;
    document.getElementById('cs-eff-val').textContent = `${data.usable_efficiency_pct}%`;
    document.getElementById('cs-loading-val').textContent = `${(100 - parseFloat(data.usable_efficiency_pct)).toFixed(1)}%`;

    // Ledger Rows grouped by ledger section
    const baseRate = data.base_rate_per_sqft;
    const baseCost = data.super_built_up_sqft * baseRate;
    const floorRise = data.floor_rise_charges || 0;
    const cornerPrem = data.corner_premium_charges || 0;
    const parking = data.car_parking_charges || 500000;
    const clubhouse = data.clubhouse_charges || 400000;
    const infra = data.infra_charges || 300000;
    const gst = data.gst_inr || Math.round((baseCost + floorRise + cornerPrem + parking + clubhouse + infra) * 0.05);
    const corpusFund = 100000;
    const advanceMaint = 120000;
    const totalOutTheDoor = baseCost + floorRise + cornerPrem + parking + clubhouse + infra + gst + corpusFund + advanceMaint;
    const totalCr = (totalOutTheDoor / 10000000.0).toFixed(2);

    const ledgerSections = [
      {
        category: '1. Basic Apartment Value',
        items: [
          { name: `Basic Rate (₹${baseRate.toLocaleString('en-IN')}/sqft × ${data.super_built_up_sqft} sqft SBU)`, amount: baseCost },
          { name: 'Floor Rise Premium Charges', amount: floorRise },
          { name: 'Corner Unit & Preferred Orientation Premium', amount: cornerPrem },
        ]
      },
      {
        category: '2. Parking & Amenities Infrastructure',
        items: [
          { name: 'Covered Car Parking Slots (2 Reserved Stalls)', amount: parking },
          { name: 'Clubhouse Access & Sports Infrastructure Fees', amount: clubhouse },
          { name: 'Dedicated Transformer, DG Backup & Water Supply Connection', amount: infra },
        ]
      },
      {
        category: '3. Statutory Government Levies & Society Funds',
        items: [
          { name: 'Goods & Services Tax (5% GST for Under Construction Housing)', amount: gst },
          { name: 'Corpus Fund Contribution (One-Time)', amount: corpusFund },
          { name: 'Advance Maintenance Charges (24 Months @ ₹3.5/sqft/mo)', amount: advanceMaint },
        ]
      }
    ];

    const tbody = document.getElementById('cs-table-body');
    let html = '';
    ledgerSections.forEach(sec => {
      html += `
        <tr class="bg-slate-50 border-y border-slate-200">
          <td colspan="2" class="py-2 px-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">${sec.category}</td>
        </tr>
      `;
      sec.items.forEach(item => {
        html += `
          <tr class="border-b border-slate-100 text-xs text-slate-700 hover:bg-slate-50">
            <td class="py-2.5 px-4">${item.name}</td>
            <td class="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">₹${item.amount.toLocaleString('en-IN')}</td>
          </tr>
        `;
      });
    });

    tbody.innerHTML = html;

    // Totals
    document.getElementById('cs-total-inr').textContent = `₹${totalOutTheDoor.toLocaleString('en-IN')}`;
    document.getElementById('cs-total-cr').textContent = `₹${totalCr} Cr`;
    document.getElementById('cs-effective-sqft').textContent = `₹${Math.round(totalOutTheDoor / data.carpet_area_sqft).toLocaleString('en-IN')}/sqft carpet`;

    // Download & Print
    document.getElementById('cs-download-btn').onclick = () => downloadCostSheetCSV(unitId);
    document.getElementById('cost-sheet-modal').classList.add('open');
  } catch (err) {
    showToast('Error loading itemized cost sheet');
  }
}

function closeCostSheetModal() {
  document.getElementById('cost-sheet-modal').classList.remove('open');
}

// ─── Manual Property Entry Modal ───
function openAddPropertyModal() {
  document.getElementById('add-property-modal').classList.add('open');
  calculateUnitCostPreview();
}

function closeAddPropertyModal() {
  document.getElementById('add-property-modal').classList.remove('open');
}

function calculateUnitCostPreview() {
  const sbu = parseFloat(document.getElementById('inp-sbu')?.value) || 1850;
  const carpet = parseFloat(document.getElementById('inp-carpet')?.value) || 1450;
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
  if (previewEl) previewEl.textContent = `₹${totalCr} Cr (₹${totalInr.toLocaleString('en-IN')})`;
  if (effEl) effEl.textContent = `${eff}% Carpet`;
}

async function submitNewProperty(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('btn-save-property');
  const origText = btn.innerHTML;
  btn.innerHTML = 'Registering Unit into Supabase...';
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
    balcony_sqft: parseInt(formData.get('balcony_sqft') || '100'),
    base_rate_per_sqft: parseInt(formData.get('base_rate_per_sqft')),
    car_parking_charges: parseInt(formData.get('car_parking_charges')),
    clubhouse_charges: parseInt(formData.get('clubhouse_charges'))
  };

  try {
    const data = await postNewProperty(payload);
    showToast(`Registered: ${data.message || 'Property unit added successfully'}`);
    closeAddPropertyModal();
    form.reset();
    await loadDashboardData();
    switchView('inventory');
  } catch (err) {
    console.error(err);
    showToast('Error registering property record in database');
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}
