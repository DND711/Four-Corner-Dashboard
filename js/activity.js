// Activity Feed, Export History, and Trend Chart Module

let activityFeedOpen = false;
let activityPollInterval = null;
let lastKnownSearchCount = null;

// ─── Activity Feed ────────────────────────────────────────────────────────────

function openActivityFeed() {
  activityFeedOpen = true;
  const drawer = document.getElementById('activity-feed-drawer');
  const overlay = document.getElementById('activity-feed-overlay');
  const dot = document.getElementById('activity-dot');
  if (drawer) drawer.classList.remove('translate-x-full');
  if (overlay) overlay.classList.remove('hidden');
  if (dot) dot.classList.add('hidden');
  loadActivityFeed();
}

function closeActivityFeed() {
  activityFeedOpen = false;
  const drawer = document.getElementById('activity-feed-drawer');
  const overlay = document.getElementById('activity-feed-overlay');
  if (drawer) drawer.classList.add('translate-x-full');
  if (overlay) overlay.classList.add('hidden');
}

async function loadActivityFeed() {
  const container = document.getElementById('activity-feed-list');
  if (!container) return;

  try {
    const data = await fetchActivityFeed(20);
    const events = data.events || [];

    if (events.length === 0) {
      container.innerHTML = `<div class="text-xs text-slate-400 text-center py-6">No recent activity found.</div>`;
      return;
    }

    container.innerHTML = events.map(e => {
      const isSearch = e.type === 'search';
      const timeStr = typeof formatTimeAgo === 'function' ? formatTimeAgo(e.timestamp) : 'Recently';
      const dotColor = isSearch ? 'bg-blue-400' : 'bg-emerald-500';
      const icon = isSearch
        ? `<svg class="w-3 h-3 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
        : `<svg class="w-3 h-3 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;

      return `
        <div class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div class="mt-0.5 shrink-0">${icon}</div>
          <div class="flex-1 min-w-0">
            <div class="text-slate-800 leading-snug">${escapeHtml(e.summary)}</div>
            <div class="text-slate-400 font-mono mt-0.5">${timeStr}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="text-xs text-red-400 text-center py-6">Could not load activity. Make sure the server is running.</div>`;
  }
}

// ─── Dedicated Full-Page Activity Log View ───────────────────────────────────

let fullActivityEventsCache = [];
let fullActivitySearchQuery = '';

function handleFullActivitySearch(query) {
  fullActivitySearchQuery = (query || '').toLowerCase().trim();
  renderFullActivityTable();
}
window.handleFullActivitySearch = handleFullActivitySearch;

async function renderFullPageActivityLog() {
  const tbody = document.getElementById('full-activity-tbody');
  const countBadge = document.getElementById('full-activity-count-badge');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400">Loading activity feed...</td></tr>`;

  try {
    const data = await fetchActivityFeed(100);
    fullActivityEventsCache = data.events || [];
    renderFullActivityTable();
  } catch (err) {
    console.error('Error loading full activity log:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-medium">Failed to load activity logs from server.</td></tr>`;
    if (countBadge) countBadge.textContent = '0 events';
  }
}
window.renderFullPageActivityLog = renderFullPageActivityLog;

function renderFullActivityTable() {
  const tbody = document.getElementById('full-activity-tbody');
  const countBadge = document.getElementById('full-activity-count-badge');
  if (!tbody) return;

  const q = fullActivitySearchQuery;
  const filtered = q
    ? fullActivityEventsCache.filter(e => {
        const sum = (e.summary || '').toLowerCase();
        const typ = (e.type || '').toLowerCase();
        const act = (e.actor || e.user_name || e.channel || e.session_id || '').toLowerCase();
        return sum.includes(q) || typ.includes(q) || act.includes(q);
      })
    : fullActivityEventsCache;

  if (countBadge) {
    countBadge.textContent = `${filtered.length} events`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-12 text-center text-slate-400">
          <div class="text-sm font-semibold text-slate-700">No activity events found</div>
          <div class="text-xs text-slate-400 mt-1">${q ? 'Try clearing your search query' : 'Audit records will appear as searches, compliance reviews, and project updates occur.'}</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    const isSearch = e.type === 'search';
    const isAudit = e.type === 'audit' || e.type === 'verification';
    const isProject = e.type === 'project' || e.type === 'project_submission';
    const isLead = e.type === 'lead' || e.type === 'inquiry';

    let catBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">Audit Event</span>`;
    if (isSearch) {
      catBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Search Query</span>`;
    } else if (isAudit) {
      catBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Compliance Audit</span>`;
    } else if (isProject) {
      catBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Project Onboarding</span>`;
    } else if (isLead) {
      catBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Buyer Inquiry</span>`;
    }

    const timeAgo = typeof formatTimeAgo === 'function' ? formatTimeAgo(e.timestamp) : 'Recently';
    const fullDate = e.timestamp ? new Date(e.timestamp).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '—';

    const actorName = e.user_name || e.actor || (e.session_id ? `Session #${escapeHtml(e.session_id).substring(0, 8)}` : (isSearch ? 'MCP Client (Claude / ChatGPT)' : 'Admin Console'));
    const channel = e.channel || (e.user_name ? 'Web Portal' : (isSearch ? 'MCP Protocol (SSE)' : 'Admin Console'));

    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="px-6 py-3.5 whitespace-nowrap">
          <div class="text-xs font-semibold text-slate-800">${timeAgo}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">${fullDate}</div>
        </td>
        <td class="px-6 py-3.5 whitespace-nowrap">
          ${catBadge}
        </td>
        <td class="px-6 py-3.5">
          <div class="text-xs font-medium text-slate-900 max-w-lg leading-relaxed">${escapeHtml(e.summary || 'Audit event recorded')}</div>
        </td>
        <td class="px-6 py-3.5 whitespace-nowrap">
          <div class="text-xs font-semibold text-slate-800">${escapeHtml(actorName)}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">${escapeHtml(channel)}</div>
        </td>
        <td class="px-6 py-3.5 text-right whitespace-nowrap">
          <span class="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Logged
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function startActivityPolling() {
  if (activityPollInterval) return;
  activityPollInterval = setInterval(async () => {
    try {
      const data = await fetchOverviewAnalytics();
      const currentCount = data?.summary?.total_searches || 0;
      if (lastKnownSearchCount !== null && currentCount > lastKnownSearchCount) {
        const dot = document.getElementById('activity-dot');
        if (dot && !activityFeedOpen) dot.classList.remove('hidden');
      }
      lastKnownSearchCount = currentCount;
      if (activityFeedOpen) loadActivityFeed();
    } catch (err) {
      // Server not reachable — show offline banner
      const banner = document.getElementById('offline-banner');
      if (banner) banner.classList.remove('hidden');
    }
  }, 30000);
}

// ─── Export History (localStorage) ────────────────────────────────────────────

const EXPORT_HISTORY_KEY = 'fc_export_history';

function recordExport(description) {
  const history = getExportHistory();
  history.unshift({
    timestamp: new Date().toISOString(),
    description
  });
  // Keep last 50 entries
  localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  renderExportHistory();
}

function getExportHistory() {
  try {
    return JSON.parse(localStorage.getItem(EXPORT_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function clearExportHistory() {
  localStorage.removeItem(EXPORT_HISTORY_KEY);
  renderExportHistory();
  showToast('Export history cleared.', true);
}

function renderExportHistory() {
  const container = document.getElementById('export-history-list');
  if (!container) return;

  const history = getExportHistory();
  if (history.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-400 text-center py-4">No exports recorded yet.</div>`;
    return;
  }

  container.innerHTML = history.map(item => {
    const timeStr = typeof formatTimeAgo === 'function' ? formatTimeAgo(item.timestamp) : 'Recently';
    const dateStr = new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div class="flex items-center gap-2.5">
          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span class="text-slate-700 font-medium">${escapeHtml(item.description)}</span>
        </div>
        <span class="text-slate-400 font-mono shrink-0 ml-2">${timeStr}</span>
      </div>
    `;
  }).join('');
}

// ─── 7-Day Trend Chart (SVG) ───────────────────────────────────────────────────

async function loadAndRenderTrendChart() {
  const container = document.getElementById('overview-trend-chart');
  const badge = document.getElementById('trend-total-badge');
  if (!container) return;

  try {
    const data = await fetchTrends(7);
    const days = data.days || [];

    const total = days.reduce((sum, d) => sum + (d.searches || 0), 0);
    if (badge) badge.textContent = `${total} searches this week`;

    if (days.length === 0) {
      container.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-slate-400">No search data yet.</div>`;
      return;
    }

    const maxVal = Math.max(...days.map(d => d.searches), 1);
    const width = 100;
    const height = 100;
    const padX = 4;
    const padY = 8;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;
    const n = days.length;

    // Build polyline points
    const points = days.map((d, i) => {
      const x = padX + (i / (n - 1 || 1)) * chartW;
      const y = padY + chartH - (d.searches / maxVal) * chartH;
      return `${x},${y}`;
    }).join(' ');

    // Build fill area (close the path at bottom)
    const firstX = padX;
    const lastX = padX + chartW;
    const bottomY = padY + chartH;
    const areaPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`;

    // X-axis labels (every other day for space)
    const labels = days.map((d, i) => {
      if (i % 2 !== 0 && i !== n - 1) return '';
      const date = new Date(d.date);
      const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const x = padX + (i / (n - 1 || 1)) * chartW;
      return `<text x="${x}" y="${height}" text-anchor="middle" class="text-[6px] fill-slate-400" style="font-size:6px;fill:#94a3b8;">${label}</text>`;
    }).join('');

    // Dot markers
    const dots = days.map((d, i) => {
      const x = padX + (i / (n - 1 || 1)) * chartW;
      const y = padY + chartH - (d.searches / maxVal) * chartH;
      return `<circle cx="${x}" cy="${y}" r="2" fill="#6D001A" stroke="white" stroke-width="1">
        <title>${d.date}: ${d.searches} searches</title>
      </circle>`;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height + 10}" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6D001A" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#6D001A" stop-opacity="0.01"/>
          </linearGradient>
        </defs>
        <!-- Area fill -->
        <polygon points="${areaPoints}" fill="url(#trendGrad)"/>
        <!-- Line -->
        <polyline points="${points}" fill="none" stroke="#6D001A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Dots -->
        ${dots}
        <!-- X labels -->
        ${labels}
      </svg>
    `;
  } catch (err) {
    if (container) container.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-slate-400">Could not load trend data.</div>`;
  }
}

// End of activity module. Project onboarding is handled by onboarding.js.
