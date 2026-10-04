// CSV Downloadable Sheets Engine

function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Downloaded: ${filename}`);
}

function exportBuyersCSV() {
  if (!allBuyers.length) {
    showToast('No buyers to export');
    return;
  }
  const headers = ['Buyer ID', 'Name', 'Email', 'Phone', 'Intent Score', 'Buyer Tier', 'Readiness Label', 'Max Budget Cr', 'BHK Preference', 'Micro Market', 'Saved Units Count', 'Inquiries Count', 'Recommended Action'];
  const rows = allBuyers.map(b => [
    `"${b.id || ''}"`,
    `"${b.name || ''}"`,
    `"${b.email || ''}"`,
    `"${b.phone || ''}"`,
    b.readiness_score || b.intent_score || 0,
    `"${b.buyer_tier || ''}"`,
    `"${b.readiness_label || ''}"`,
    b.budget_max_cr || '',
    b.bhk_pref || '',
    `"${b.micro_market_pref || ''}"`,
    b.saved_units_count || 0,
    b.inquiries_count || 0,
    `"${b.recommended_action || ''}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`four_corner_buyer_pipeline_${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

function exportInventoryCSV() {
  if (!allProperties.length) {
    showToast('No properties to export');
    return;
  }
  const headers = ['Unit ID', 'Project Name', 'Developer', 'Micro Market', 'RERA ID', 'BHK', 'Facing', 'Is Corner Unit', 'Carpet Area Sqft', 'Super Built Up Sqft', 'Usable Efficiency %', 'Total Price Cr', 'Handover Date'];
  const rows = allProperties.map(p => [
    `"${p.unit_id || ''}"`,
    `"${p.project_name || ''}"`,
    `"${p.developer || ''}"`,
    `"${p.micro_market || ''}"`,
    `"${p.rera_id || ''}"`,
    p.bhk || '',
    `"${p.facing || ''}"`,
    p.is_corner_unit ? 'Yes' : 'No',
    p.carpet_area_sqft || '',
    p.super_built_up_sqft || '',
    p.usable_efficiency_pct || '',
    p.total_price_cr || '',
    `"${p.handover_date || ''}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`four_corner_verified_inventory_${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

async function downloadCostSheetCSV(unitId) {
  try {
    const data = await fetchUnitPricing(unitId);
    const headers = ['Cost Component', 'Amount / Metric'];
    const rows = [
      ['Project Name', `"${data.project_name}"`],
      ['Unit ID', `"${data.unit_id}"`],
      ['Developer', `"${data.developer}"`],
      ['Micro Market', `"${data.micro_market}"`],
      ['BHK', data.bhk],
      ['Super Built-up Area (sqft)', data.super_built_up_sqft],
      ['True Usable Carpet Area (sqft)', data.carpet_area_sqft],
      ['Usable Carpet Efficiency %', `${data.usable_efficiency_pct}%`],
      ['Base Rate per sqft (INR)', data.base_rate_per_sqft],
      ['Base Flat Cost (INR)', data.super_built_up_sqft * data.base_rate_per_sqft],
      ['Floor Rise Charges (INR)', data.floor_rise_charges],
      ['Corner Premium Charges (INR)', data.corner_premium_charges],
      ['Clubhouse Charges (INR)', data.clubhouse_charges],
      ['Car Parking Charges (INR)', data.car_parking_charges],
      ['Infrastructure Charges (INR)', data.infra_charges],
      ['GST Tax 5% (INR)', data.gst_inr],
      ['Total Out-The-Door Price (INR)', data.total_out_the_door_inr],
      ['Total Price in Crores (INR Cr)', data.total_price_cr]
    ];

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`cost_sheet_${unitId}_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  } catch (err) {
    showToast('Error exporting cost sheet');
  }
}

function exportSingleBuyerProfileCSV(buyer) {
  const headers = ['Field', 'Value'];
  const bd = buyer.intent_breakdown || {};
  const rows = [
    ['Buyer ID', `"${buyer.id}"`],
    ['Name', `"${buyer.name}"`],
    ['Email', `"${buyer.email}"`],
    ['Phone', `"${buyer.phone}"`],
    ['Budget Ceiling (Cr)', buyer.budget_max_cr || 'Flexible'],
    ['BHK Preference', buyer.bhk_pref || 'Any'],
    ['Micro Market', `"${buyer.micro_market_pref || 'Any'}"`],
    ['Overall Intent Score', `${buyer.readiness_score || buyer.intent_score || 0} / 100`],
    ['Readiness Tier', `"${buyer.buyer_tier || ''}"`],
    ['Readiness Label', `"${buyer.readiness_label || ''}"`],
    ['Budget Readiness Score', bd.financial_precision ? `${bd.financial_precision.score}/25` : '0/25'],
    ['Commute Alignment Score', bd.commute_alignment ? `${bd.commute_alignment.score}/20` : '0/20'],
    ['Carpet Area & Plan Score', bd.architectural_depth ? `${bd.architectural_depth.score}/20` : '0/20'],
    ['RERA & Legal Verification Score', bd.legal_due_diligence ? `${bd.legal_due_diligence.score}/15` : '0/15'],
    ['Direct Inquiries Score', bd.commitment_signals ? `${bd.commitment_signals.score}/20` : '0/20'],
    ['Recommended Action', `"${buyer.recommended_action || ''}"`]
  ];

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`buyer_profile_${buyer.id}.csv`, csv);
}

function exportAwarenessReportCSV() {
  const headers = ['Metric', 'Score', 'Description'];
  const rows = [
    ['Usable Carpet Area Validation', '82%', '"Buyers evaluating usable carpet area rather than gross built-up measurements"'],
    ['Peak Commute Validation', '78%', '"Travel time calculated using 8:30-10:00 AM peak traffic rather than off-peak estimates"'],
    ['Total Cost Review', '91%', '"Buyers reviewing total out-the-door costs including floor rise, GST, and infra charges"'],
    ['TS-RERA Compliance Verification', '88%', '"Verification of project registration, approved layout plans, and statutory sanctions"'],
    ['Tellapur Demand Share', '42%', '"Demand for ORR Exit 2 corridor connectivity to Financial District"'],
    ['Kokapet Demand Share', '28%', '"Demand for high-rise developments near Neopolis"'],
    ['Nanakramguda Demand Share', '18%', '"Walk-to-work IT tech corridor demand"'],
    ['Puppalguda Demand Share', '12%', '"Residential alternative to Financial District"']
  ];
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`four_corner_awareness_report_${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
