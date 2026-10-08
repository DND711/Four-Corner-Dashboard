// API Services for Four Corner Real Estate Intelligence Console

async function fetchOverviewAnalytics() {
  const res = await fetch(`${API_BASE}/api/v1/analytics/overview`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchProjectsAnalytics() {
  const res = await fetch(`${API_BASE}/api/v1/analytics/projects`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchSearchIntelligence() {
  const res = await fetch(`${API_BASE}/api/v1/analytics/search-intelligence`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchAudienceAnalytics() {
  const res = await fetch(`${API_BASE}/api/v1/analytics/audience`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function updateProjectVerificationStatus(projectId, status) {
  const res = await fetch(`${API_BASE}/api/v1/projects/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId, status })
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function postNewProperty(payload) {
  const res = await fetch(`${API_BASE}/api/v1/properties/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchAdminBuyersData() {
  const res = await fetch(`${API_BASE}/api/v1/admin/buyers`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchPropertiesCatalog() {
  const res = await fetch(`${API_BASE}/api/v1/properties/search`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchProjectDetail(projectId) {
  const res = await fetch(`${API_BASE}/api/v1/projects/${encodeURIComponent(projectId)}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function updateProject(projectId, payload) {
  const res = await fetch(`${API_BASE}/api/v1/projects/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function deleteProject(projectId) {
  const res = await fetch(`${API_BASE}/api/v1/projects/${encodeURIComponent(projectId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchProjectLeads(projectName) {
  const res = await fetch(`${API_BASE}/api/v1/analytics/projects/${encodeURIComponent(projectName)}/leads`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchTrends(days = 90) {
  const res = await fetch(`${API_BASE}/api/v1/analytics/trends?days=${days}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function fetchActivityFeed(limit = 20) {
  const res = await fetch(`${API_BASE}/api/v1/analytics/activity?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function postRegisterProject(payload) {
  const res = await fetch(`${API_BASE}/api/v1/projects/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    let msg = `Server error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.message) msg = errData.message;
    } catch (_) {}
    throw new Error(msg);
  }
  return await res.json();
}

