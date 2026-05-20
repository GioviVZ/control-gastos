/* api.js — Auto-carga desde Google Apps Script */

const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbyUADIY2PODKRIcKulKwdnlrDCwvXAdnd5GGlhUYurdk6A1eIffWnXsxjbgEhB2rhBxiQ/exec';
const stored = localStorage.getItem('cf_url');
// Si lo guardado no es una URL de Apps Script, ignorarlo y usar el default
if (stored && !stored.startsWith('https://script.google.com/macros/')) {
  localStorage.removeItem('cf_url');
}
let SCRIPT_URL = (localStorage.getItem('cf_url')) || DEFAULT_URL;
let refreshTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
});

function conectar() {
  const val = document.getElementById('url-input')?.value.trim();
  if (val && val.startsWith('https://script.google.com')) {
    SCRIPT_URL = val;
    localStorage.setItem('cf_url', val);
  }
  cargarDatos();
}

function recargar() { cargarDatos(); }

function mostrarError(msg) {
  document.getElementById('loading').style.display      = 'none';
  document.getElementById('dash').style.display         = 'none';
  document.getElementById('error-screen').style.display = 'flex';
  const el  = document.getElementById('err-msg');
  const inp = document.getElementById('url-input');
  if (el)  el.textContent = msg;
  if (inp) inp.value = SCRIPT_URL !== DEFAULT_URL ? SCRIPT_URL : '';
}

function scheduleRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(silentRefresh, 5 * 60 * 1000);
}

async function silentRefresh() {
  try {
    const res  = await fetch(SCRIPT_URL + '?t=' + Date.now());
    const json = await res.json();
    if (!json.ok) return;
    renderDashboard(json.data);
  } catch (_) { /* fallo silencioso en auto-refresh */ }
}

async function cargarDatos() {
  document.getElementById('error-screen').style.display = 'none';
  document.getElementById('dash').style.display         = 'none';
  document.getElementById('loading').style.display      = 'flex';

  try {
    const res  = await fetch(SCRIPT_URL + '?t=' + Date.now());
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Error del servidor');

    renderDashboard(json.data);
    document.getElementById('loading').style.display      = 'none';
    document.getElementById('error-screen').style.display = 'none';
    document.getElementById('dash').style.display         = 'block';
    scheduleRefresh();
  } catch (err) {
    console.error('[Control Familiar]', err);
    mostrarError(
      err.message + '\n\n' +
      'Verifica que el script esté publicado como "Cualquier usuario".'
    );
  }
}
