// Awareness Metrics and Market Distribution

function renderAnalyticsTiers() {
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

  const thEl = document.getElementById('tier-count-high');
  const tsEl = document.getElementById('tier-count-serious');
  const twEl = document.getElementById('tier-count-warm');
  const tcEl = document.getElementById('tier-count-casual');

  if (thEl) thEl.textContent = `${high} buyers`;
  if (tsEl) tsEl.textContent = `${serious} buyers`;
  if (twEl) twEl.textContent = `${warm} buyers`;
  if (tcEl) tcEl.textContent = `${casual} buyers`;
}
