// ─────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────
let _tt;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) { console.warn('Toast element not found:', msg); return; }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => t.classList.remove('show'), 2500);
}


// ─── NUMBER FORMAT (see below) ───────────────────────
function fmtN(n, decimals) {
  return parseFloat(n||0).toLocaleString('tr-TR', {minimumFractionDigits:decimals||2, maximumFractionDigits:decimals||2});
}

// ─────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────

// ══ NUMBER FORMAT ═══════════════════════════════════════
function fmtUSD(n){return'$'+parseFloat(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtTL(n){return'\u20ba'+parseFloat(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});}

// ══ PAGE NAV ════════════════════════════════════════════
const VALID_PAGES = new Set(['dashboard', 'sales', 'service']);
function switchPage(page, btn) {
  if (!VALID_PAGES.has(page)) { console.warn('switchPage: unknown page', page); return; }
  document.querySelectorAll('.page-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-pill').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('page-' + page);
  if (panel) panel.classList.add('active');
  else { console.warn('switchPage: panel not found for', page); return; }
  if (btn) {
    btn.classList.add('active');
  } else {
    const dpill = document.querySelector('[data-page="' + page + '"]');
    if (dpill) dpill.classList.add('active');
  }
  AppState.currentPage = page;
  if (page === 'service') {
    refreshSvcData(function() {
      renderSvcDashboard();
      renderSvcCustomerList();
    });
  }
  if (page === 'dashboard') { renderDashboard(); }
}

