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
  const refreshBtn = document.getElementById('activity-refresh-btn');
  const refreshIcon = document.getElementById('activity-refresh-icon');
  const refreshLabel = document.getElementById('activity-refresh-label');

  if (refreshBtn) refreshBtn.disabled = true;
  if (refreshIcon) refreshIcon.classList.add('animate-spin');
  if (refreshLabel) refreshLabel.textContent = 'Refreshing...';

  const startTime = Date.now();

  try {
    // Enforce 1.2s minimum refresh state so the animation runs smoothly
    const [data] = await Promise.all([
      fetchActivityFeed(100),
      new Promise(res => setTimeout(res, 1200))
    ]);

    fullActivityEventsCache = data.events || [];
    renderFullActivityTable();
    if (typeof showToast === 'function') {
      showToast('Activity log refreshed.', true);
    }
  } catch (err) {
    console.error('Error loading full activity log:', err);
    const elapsed = Date.now() - startTime;
    if (elapsed < 1200) {
      await new Promise(res => setTimeout(res, 1200 - elapsed));
    }
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-medium">Failed to load activity logs from server.</td></tr>`;
    }
    if (countBadge) countBadge.textContent = '0 events';
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('animate-spin');
    if (refreshLabel) refreshLabel.textContent = 'Refresh';
    if (refreshBtn) refreshBtn.disabled = false;
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

// ─── Search Activity Trend Chart (Day / Week / Month Aggregation) ────────────

let currentTrendAggregation = 'day';
let cachedTrendRawDays = [];
let trendResizeListenerAttached = false;

function setTrendAggregation(mode) {
  if (!['day', 'week', 'month'].includes(mode)) mode = 'day';
  currentTrendAggregation = mode;

  // Update toggle button styles
  const modes = ['day', 'week', 'month'];
  modes.forEach(m => {
    const btn = document.getElementById(`trend-agg-${m}`);
    if (btn) {
      if (m === mode) {
        btn.className = 'px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer bg-white text-slate-900 shadow-2xs';
      } else {
        btn.className = 'px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-slate-500 hover:text-slate-800';
      }
    }
  });

  renderAggregatedTrendChart();
}

async function loadAndRenderTrendChart() {
  const container = document.getElementById('overview-trend-chart');
  if (!container) return;

  try {
    const data = await fetchTrends(90);
    cachedTrendRawDays = data.days || [];
    renderAggregatedTrendChart();

    if (!trendResizeListenerAttached) {
      trendResizeListenerAttached = true;
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (document.getElementById('overview-trend-chart')) {
            renderAggregatedTrendChart();
          }
        }, 150);
      });
    }
  } catch (err) {
    if (container) {
      container.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-slate-400">Could not load search activity data.</div>`;
    }
  }
}

function processTrendData(days, mode) {
  if (!days || days.length === 0) return { points: [], total: 0 };

  if (mode === 'day') {
    // Take the last 8 days (matches current week with 470 searches)
    const recent = days.slice(-8);
    const total = recent.reduce((sum, d) => sum + (d.searches || 0), 0);
    const points = recent.map(d => {
      const dt = new Date(d.date + 'T00:00:00');
      const shortLabel = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullLabel = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      return {
        key: d.date,
        shortLabel,
        fullLabel,
        searches: d.searches || 0
      };
    });
    return { points, total };
  }

  if (mode === 'week') {
    // Group last 8 weeks (Monday to Sunday)
    const weekMap = {};
    days.forEach(d => {
      const dt = new Date(d.date + 'T00:00:00');
      const dayOfWeek = dt.getDay(); // 0 is Sun
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const mon = new Date(dt);
      mon.setDate(dt.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);

      const monIso = mon.toISOString().slice(0, 10);
      if (!weekMap[monIso]) {
        weekMap[monIso] = {
          start: mon,
          end: sun,
          searches: 0
        };
      }
      weekMap[monIso].searches += (d.searches || 0);
    });

    const sortedWeekKeys = Object.keys(weekMap).sort().slice(-8);
    const points = sortedWeekKeys.map(k => {
      const w = weekMap[k];
      const startStr = w.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = w.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        key: k,
        shortLabel: startStr,
        fullLabel: `${startStr} – ${endStr}`,
        searches: w.searches
      };
    });
    const total = points.reduce((sum, p) => sum + p.searches, 0);
    return { points, total };
  }

  if (mode === 'month') {
    // Group by month
    const monthMap = {};
    days.forEach(d => {
      const key = d.date.slice(0, 7); // YYYY-MM
      const dt = new Date(d.date + 'T00:00:00');
      if (!monthMap[key]) {
        monthMap[key] = {
          shortLabel: dt.toLocaleDateString('en-US', { month: 'short' }),
          fullLabel: dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          searches: 0
        };
      }
      monthMap[key].searches += (d.searches || 0);
    });

    const sortedMonthKeys = Object.keys(monthMap).sort();
    const points = sortedMonthKeys.map(k => ({
      key: k,
      shortLabel: monthMap[k].shortLabel,
      fullLabel: monthMap[k].fullLabel,
      searches: monthMap[k].searches
    }));
    const total = points.reduce((sum, p) => sum + p.searches, 0);
    return { points, total };
  }

  return { points: [], total: 0 };
}

function renderAggregatedTrendChart() {
  const container = document.getElementById('overview-trend-chart');
  const badge = document.getElementById('trend-total-badge');
  if (!container) return;

  const { points, total } = processTrendData(cachedTrendRawDays, currentTrendAggregation);

  if (badge) {
    badge.textContent = `${total.toLocaleString('en-IN')} searches`;
  }

  if (!points || points.length === 0) {
    container.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-slate-400">No search activity recorded for this period.</div>`;
    return;
  }

  const containerW = container.clientWidth || 800;
  const width = Math.max(containerW, 500);
  const height = 240;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 40;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const n = points.length;

  const rawMax = Math.max(...points.map(p => p.searches), 1);
  // Round up max for nice gridlines
  let maxVal = Math.ceil(rawMax * 1.15);
  if (maxVal < 5) maxVal = 5;

  // Grid steps (4 horizontal lines)
  const steps = 4;
  let gridLines = '';
  for (let s = 0; s <= steps; s++) {
    const val = Math.round((maxVal / steps) * s);
    const y = padTop + chartH - (s / steps) * chartH;
    gridLines += `
      <line x1="${padLeft}" y1="${y}" x2="${padLeft + chartW}" y2="${y}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${padLeft - 8}" y="${y + 3}" text-anchor="end" font-size="10" font-family="monospace" fill="#94A3B8">${val}</text>
    `;
  }

  const bottomY = padTop + chartH;
  const slotW = chartW / n;
  const barW = Math.min(Math.max(slotW * 0.52, 14), 46);

  const barsSvg = points.map((p, i) => {
    const slotX = padLeft + i * slotW;
    const barX = slotX + (slotW - barW) / 2;
    const centerX = slotX + slotW / 2;
    const isZero = p.searches === 0;
    const barH = isZero ? 3 : Math.max(Math.round((p.searches / maxVal) * chartH), 4);
    const barY = bottomY - barH;

    const barColor = isZero ? '#E2E8F0' : 'url(#barGrad)';

    return `
      <g class="chart-bar-group" data-idx="${i}">
        <!-- Slot background column track on hover -->
        <rect id="slot-track-${i}" x="${slotX + (slotW - barW) / 2 - 6}" y="${padTop}" width="${barW + 12}" height="${chartH}" rx="6" fill="#F8FAFC" opacity="0" class="transition-opacity duration-150 pointer-events-none" />

        <!-- Vertical Bar Column -->
        <rect id="trend-bar-${i}" x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" ry="4"
          fill="${barColor}" class="transition-all duration-150 pointer-events-none shadow-xs" />

        <!-- X-axis Label -->
        <text x="${centerX.toFixed(1)}" y="${bottomY + 22}" text-anchor="middle" font-size="11" font-weight="500" fill="#64748B">${p.shortLabel}</text>

        <!-- Hit target for hover / tap -->
        <rect x="${slotX.toFixed(1)}" y="${padTop}" width="${slotW.toFixed(1)}" height="${chartH + 30}" fill="transparent" class="cursor-pointer"
          onmouseenter="showBarTooltip(${i}, ${centerX}, ${barY})"
          onmouseleave="hideBarTooltip(${i})" />
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Floating Tooltip -->
    <div id="trend-hover-tooltip"
      class="pointer-events-none absolute hidden z-20 px-3 py-2 bg-slate-900/95 backdrop-blur-xs text-white rounded-xl shadow-xl transition-all duration-75 border border-slate-700/60 transform -translate-x-1/2 -translate-y-full mb-3">
    </div>

    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full block overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#800020"/>
          <stop offset="100%" stop-color="#6D001A"/>
        </linearGradient>
      </defs>

      <!-- Background Grid -->
      ${gridLines}

      <!-- Baseline Floor -->
      <line x1="${padLeft}" y1="${bottomY}" x2="${padLeft + chartW}" y2="${bottomY}" stroke="#E2E8F0" stroke-width="1.5"/>

      <!-- Bars -->
      ${barsSvg}
    </svg>
  `;

  container._trendPoints = points;
}

function showBarTooltip(idx, svgX, svgY) {
  const container = document.getElementById('overview-trend-chart');
  const tooltip = document.getElementById('trend-hover-tooltip');
  if (!container || !tooltip || !container._trendPoints) return;

  const item = container._trendPoints[idx];
  if (!item) return;

  // Highlight bar & slot track
  const bar = document.getElementById(`trend-bar-${idx}`);
  const track = document.getElementById(`slot-track-${idx}`);
  if (track) track.setAttribute('opacity', '1');
  if (bar && item.searches > 0) {
    bar.setAttribute('fill', '#520013');
  }

  const svgEl = container.querySelector('svg');
  if (!svgEl) return;
  const viewBoxW = svgEl.viewBox.baseVal.width || 800;
  const viewBoxH = svgEl.viewBox.baseVal.height || 240;

  const leftPercent = (svgX / viewBoxW) * 100;
  const topPercent = Math.max(14, (svgY / viewBoxH) * 100);

  tooltip.innerHTML = `
    <div class="text-[10px] font-medium text-slate-300 whitespace-nowrap">${item.fullLabel}</div>
    <div class="text-xs font-bold text-white mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
      <span class="w-1.5 h-1.5 rounded-full ${item.searches > 0 ? 'bg-red-400' : 'bg-slate-400'}"></span>
      <span>${item.searches.toLocaleString('en-IN')} searches</span>
    </div>
  `;

  tooltip.style.left = `${leftPercent}%`;
  tooltip.style.top = `${topPercent}%`;
  tooltip.classList.remove('hidden');
}

function hideBarTooltip(idx) {
  const tooltip = document.getElementById('trend-hover-tooltip');
  if (tooltip) tooltip.classList.add('hidden');

  const bar = document.getElementById(`trend-bar-${idx}`);
  const track = document.getElementById(`slot-track-${idx}`);
  if (track) track.setAttribute('opacity', '0');
  if (bar) {
    const container = document.getElementById('overview-trend-chart');
    const item = container && container._trendPoints ? container._trendPoints[idx] : null;
    bar.setAttribute('fill', item && item.searches === 0 ? '#E2E8F0' : 'url(#barGrad)');
  }
}

// End of activity module. Project onboarding is handled by onboarding.js.
