// API Services for Four Corner MCP Backend

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

async function fetchUnitPricing(unitId) {
  const res = await fetch(`${API_BASE}/api/v1/properties/pricing/${unitId}`);
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
