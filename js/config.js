// API Base configuration
const API_BASE = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:' ||
  !window.location.hostname
)
  ? 'http://localhost:8000'
  : 'https://four-corner-mcp.onrender.com';

// Global application data stores
let overviewData = null;
let projectsData = [];
let searchIntelData = null;
let audienceData = null;
let selectedProjectForIntel = null;

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

function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3500);
}

function formatCr(num) {
  if (num === null || num === undefined) return '—';
  return `₹${Number(num).toFixed(2)} Cr`;
}

