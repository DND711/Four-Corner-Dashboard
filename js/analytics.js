// Market Intelligence, Micro-Market Benchmarks, and Developer Transparency Metrics
// Covers all Hyderabad micro-markets

const MICRO_MARKET_BENCHMARKS = [
  {
    market: 'Tellapur',
    corridor: 'ORR Exit 2 / Neopolis Radial',
    avgRateSqft: 7450,
    trend12m: '+16.2%',
    avg3BhkTicketCr: 1.88,
    avgCarpetEfficiency: 78.4,
    peakCommuteFinancialDistMin: 18,
    activeUnitsVerified: 84,
    demandSharePct: 42
  },
  {
    market: 'Kokapet',
    corridor: 'Golden Mile / SEZ Hub',
    avgRateSqft: 10200,
    trend12m: '+22.5%',
    avg3BhkTicketCr: 3.15,
    avgCarpetEfficiency: 75.2,
    peakCommuteFinancialDistMin: 12,
    activeUnitsVerified: 62,
    demandSharePct: 28
  },
  {
    market: 'Nanakramguda & Financial District',
    corridor: 'Core IT / WaveRock Corridor',
    avgRateSqft: 11500,
    trend12m: '+19.0%',
    avg3BhkTicketCr: 3.65,
    avgCarpetEfficiency: 73.8,
    peakCommuteFinancialDistMin: 6,
    activeUnitsVerified: 45,
    demandSharePct: 18
  },
  {
    market: 'Puppalguda & Narsingi',
    corridor: 'Outer Ring Road Link',
    avgRateSqft: 8600,
    trend12m: '+14.8%',
    avg3BhkTicketCr: 2.40,
    avgCarpetEfficiency: 76.5,
    peakCommuteFinancialDistMin: 16,
    activeUnitsVerified: 38,
    demandSharePct: 12
  }
];

const DEVELOPER_CARPET_INDEX = [
  {
    developer: 'Candeur Constructions',
    flagshipProject: 'Candeur Lakescape',
    microMarket: 'Serilingampally / Tellapur',
    quotedSbuSqft: 1850,
    verifiedCarpetSqft: 1450,
    efficiencyPct: 78.4,
    loadingPct: 21.6,
    reraId: 'P02400005724',
    escrowStatus: 'Verified 70% Escrow'
  },
  {
    developer: 'My Home Group',
    flagshipProject: 'My Home Tarkshya',
    microMarket: 'Kokapet',
    quotedSbuSqft: 2235,
    verifiedCarpetSqft: 1680,
    efficiencyPct: 75.2,
    loadingPct: 24.8,
    reraId: 'P02400001289',
    escrowStatus: 'Verified 70% Escrow'
  },
  {
    developer: 'Aparna Constructions',
    flagshipProject: 'Aparna Zenon',
    microMarket: 'Nanakramguda',
    quotedSbuSqft: 1690,
    verifiedCarpetSqft: 1245,
    efficiencyPct: 73.7,
    loadingPct: 26.3,
    reraId: 'P02400003411',
    escrowStatus: 'Verified 70% Escrow'
  },
  {
    developer: 'Rajapushpa Properties',
    flagshipProject: 'Rajapushpa Provincia',
    microMarket: 'Narsingi',
    quotedSbuSqft: 2020,
    verifiedCarpetSqft: 1530,
    efficiencyPct: 75.7,
    loadingPct: 24.3,
    reraId: 'P02400004120',
    escrowStatus: 'Verified 70% Escrow'
  }
];

const RUSH_HOUR_COMMUTE_MATRIX = [
  { origin: 'Tellapur (Exit 2)', destWiproCircle: '18 mins', destWaveRock: '20 mins', destDLFCyberCity: '26 mins', destMindspace: '34 mins' },
  { origin: 'Kokapet (Neopolis)', destWiproCircle: '10 mins', destWaveRock: '12 mins', destDLFCyberCity: '18 mins', destMindspace: '25 mins' },
  { origin: 'Nanakramguda', destWiproCircle: '6 mins', destWaveRock: '4 mins', destDLFCyberCity: '12 mins', destMindspace: '18 mins' },
  { origin: 'Puppalguda', destWiproCircle: '14 mins', destWaveRock: '16 mins', destDLFCyberCity: '20 mins', destMindspace: '28 mins' }
];

function renderAnalyticsView() {
  renderMicroMarketTable();
  renderDeveloperCarpetTable();
  renderCommuteMatrixTable();
  renderBuyerReadinessDistribution();
}

function renderMicroMarketTable() {
  const tbody = document.getElementById('micro-market-table-body');
  if (!tbody) return;

  tbody.innerHTML = MICRO_MARKET_BENCHMARKS.map(m => `
    <tr class="data-row border-b border-slate-100 hover:bg-slate-50 transition text-xs">
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${m.market}</div>
        <div class="text-[10px] text-slate-500 font-mono">${m.corridor}</div>
      </td>
      <td class="py-3 px-4 font-mono font-medium text-slate-800">
        ₹${m.avgRateSqft.toLocaleString('en-IN')}/sqft
      </td>
      <td class="py-3 px-4 font-mono font-bold text-emerald-600">
        ${m.trend12m}
      </td>
      <td class="py-3 px-4 font-mono text-slate-900 font-bold">
        ₹${m.avg3BhkTicketCr.toFixed(2)} Cr
      </td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
          ${m.avgCarpetEfficiency}% Carpet
        </span>
      </td>
      <td class="py-3 px-4 font-mono text-slate-700">
        ${m.peakCommuteFinancialDistMin} mins (8:30 AM)
      </td>
      <td class="py-3 px-4 text-right font-mono text-slate-500 font-bold">
        ${m.demandSharePct}%
      </td>
    </tr>
  `).join('');
}

function renderDeveloperCarpetTable() {
  const tbody = document.getElementById('developer-carpet-table-body');
  if (!tbody) return;

  tbody.innerHTML = DEVELOPER_CARPET_INDEX.map(d => `
    <tr class="data-row border-b border-slate-100 hover:bg-slate-50 transition text-xs">
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${d.developer}</div>
        <div class="text-[11px] text-slate-500">${d.flagshipProject} · ${d.microMarket}</div>
      </td>
      <td class="py-3 px-4 font-mono text-slate-700">
        ${d.quotedSbuSqft} sqft
      </td>
      <td class="py-3 px-4 font-mono text-emerald-700 font-bold">
        ${d.verifiedCarpetSqft} sqft
      </td>
      <td class="py-3 px-4 font-mono text-slate-600">
        ${d.loadingPct}% Loading
      </td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-medium">
          ${d.reraId}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <span class="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          ${d.escrowStatus}
        </span>
      </td>
    </tr>
  `).join('');
}

function renderCommuteMatrixTable() {
  const tbody = document.getElementById('commute-matrix-table-body');
  if (!tbody) return;

  tbody.innerHTML = RUSH_HOUR_COMMUTE_MATRIX.map(c => `
    <tr class="data-row border-b border-slate-100 hover:bg-slate-50 transition text-xs">
      <td class="py-3 px-4 font-bold text-slate-900">
        ${c.origin}
      </td>
      <td class="py-3 px-4 font-mono text-slate-700">
        ${c.destWiproCircle}
      </td>
      <td class="py-3 px-4 font-mono text-slate-700">
        ${c.destWaveRock}
      </td>
      <td class="py-3 px-4 font-mono text-slate-700">
        ${c.destDLFCyberCity}
      </td>
      <td class="py-3 px-4 font-mono text-slate-700">
        ${c.destMindspace}
      </td>
    </tr>
  `).join('');
}

function renderBuyerReadinessDistribution() {
  const high = allBuyers.filter(b => (b.readiness_score || b.intent_score || 0) >= 80).length;
  const serious = allBuyers.filter(b => {
    const s = b.readiness_score || b.intent_score || 0;
    return s >= 60 && s < 80;
  }).length;
  const warm = allBuyers.filter(b => {
    const s = b.readiness_score || b.intent_score || 0;
    return s >= 40 && s < 60;
  }).length;
  const casual = allBuyers.filter(b => (b.readiness_score || b.intent_score || 0) < 40).length;

  const total = allBuyers.length || 1;
  const highPct = Math.round((high / total) * 100);
  const seriousPct = Math.round((serious / total) * 100);
  const warmPct = Math.round((warm / total) * 100);
  const casualPct = Math.round((casual / total) * 100);

  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setEl('tier-count-high', `${high} buyers (${highPct}%)`);
  setEl('tier-count-serious', `${serious} buyers (${seriousPct}%)`);
  setEl('tier-count-warm', `${warm} buyers (${warmPct}%)`);
  setEl('tier-count-casual', `${casual} buyers (${casualPct}%)`);

  const setBar = (id, pct) => {
    const el = document.getElementById(id);
    if (el) el.style.width = `${pct}%`;
  };

  setBar('tier-bar-high', highPct);
  setBar('tier-bar-serious', seriousPct);
  setBar('tier-bar-warm', warmPct);
  setBar('tier-bar-casual', casualPct);
}
