// API Base configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://four-corner-mcp.onrender.com';

// Global application data stores
let allBuyers = [];
let allProperties = [];
let allInquiries = [];
let allSavedUnits = [];

// Utility: HTML escape helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function handleGlobalSearch(query) {
  const buyerInp = document.getElementById('buyer-search-input');
  if (buyerInp) {
    buyerInp.value = query;
    filterBuyersTable();
  }
  const propInp = document.getElementById('prop-search-query');
  if (propInp) {
    propInp.value = query;
    filterPropertiesCatalog();
  }
}

