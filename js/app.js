/* app.js — Lógica principal del dashboard */

const $   = id => document.getElementById(id);
const sol = n  => (n == null || isNaN(n)) ? '—' : 'S/. ' + Math.round(n).toLocaleString('es-PE');
const pct = n  => Math.round((n || 0) * 100) + '%';

const buildRow = (label, value) =>
  `<div class="p-row"><span class="label">${label}</span><span class="val">${value}</span></div>`;

const CHIP  = { Victor: 'cv', Edeliza: 'ce', Giovanni: 'cg' };
const ICONS = {
  'Pago del Carro':       '🚗',
  'Universidad Giovanni': '🎓',
  'Renovación del Baño':  '🚿',
  'Llantas Victor':       '🔧',
  'Deuda Tío Willi':      '👴',
  'Equipo Edeliza':       '📱',
};

let chartsReady = false;

// Calcula la fecha aproximada de fin dado N cuotas restantes desde hoy
function calcEndDate(restantes) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth() + restantes, 1);
  return end.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
}

function buildAlertasSection(deudas) {
  const mesLabel = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });

  const activas = deudas
    .filter(d => d.restantes > 0 && d.nombre)
    .sort((a, b) => a.restantes - b.restantes);

  if (activas.length === 0) return '';

  const cards = activas.map(d => {
    const isLast    = d.restantes === 1;
    const isWarning = d.restantes <= 3;
    const cls       = isLast ? 'al-last' : isWarning ? 'al-warn' : 'al-normal';
    const badge     = isLast
      ? '<span class="al-badge al-badge-last">🎉 ¡Último pago este mes!</span>'
      : isWarning
      ? '<span class="al-badge al-badge-warn">⚡ Termina pronto</span>'
      : '';

    return `
      <div class="al-card ${cls}">
        ${badge}
        <div class="al-header">
          <span class="al-nombre">${ICONS[d.nombre] || '💳'} ${d.nombre}</span>
          <span class="chip ${CHIP[d.resp] || 'ca'}">${d.resp}</span>
        </div>
        <div class="al-cuota">${sol(d.cuota)}<span class="al-freq">/mes</span></div>
        <div class="al-footer">
          <span class="al-end">Termina <strong>${calcEndDate(d.restantes)}</strong></span>
          <span class="al-count">${d.restantes} cuota${d.restantes !== 1 ? 's' : ''}</span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="alertas-wrap fade">
      <div class="alertas-header-row">
        <div>
          <div class="alertas-title-text">📅 Pagos de ${mesLabel}</div>
          <div class="alertas-sub-text">Compromisos activos — ordenados por urgencia</div>
        </div>
      </div>
      <div class="al-grid">${cards}</div>
    </div>`;
}

function renderDashboard(d) {
  const {
    porcentajes: pcts,
    alimentacion: alim,
    subtotales: st,
    totalMensual: gt,
    deudas,
    telefonia: tel,
    ahorroVictor,
    generadoEl,
  } = d;

  $('header-date').textContent = 'Actualizado: ' + generadoEl;

  // Alertas de pagos
  $('alertas-section').innerHTML = buildAlertasSection(deudas);

  // Porcentajes
  $('vic-pct').textContent = pct(pcts.Victor);
  $('ede-pct').textContent = pct(pcts.Edeliza);
  $('gio-pct').textContent = pct(pcts.Giovanni);

  // Totales
  const vicT = gt.Victor + ahorroVictor;
  $('vic-total').textContent = sol(vicT);
  $('ede-total').textContent = sol(gt.Edeliza);
  $('gio-total').textContent = sol(gt.Giovanni);

  animarBarrasPersonas(vicT, gt.Edeliza, gt.Giovanni);

  // Desglose por persona
  $('vic-rows').innerHTML = [
    buildRow('Servicios hogar',  sol(st.servicios.Victor)),
    buildRow('Carro (deuda)',    sol(st.carro.Victor)),
    buildRow('Deudas',           sol(st.deudas.Victor)),
    buildRow('Telefonía',        sol(tel.Victor)),
    buildRow('Suscripciones',    sol(st.suscripc.Victor)),
    buildRow('Alim + salud',     sol(st.alimentac.Victor)),
    buildRow('Fondo mant. carro', sol(ahorroVictor)),
  ].join('');

  $('ede-rows').innerHTML = [
    buildRow('Deudas',        sol(st.deudas.Edeliza)),
    buildRow('Telefonía',     sol(tel.Edeliza)),
    buildRow('Suscripciones', sol(st.suscripc.Edeliza)),
    buildRow('Alim + salud',  sol(st.alimentac.Edeliza)),
  ].join('');

  $('gio-rows').innerHTML = [
    buildRow('Servicios hogar', sol(st.servicios.Giovanni)),
    buildRow('Deudas',          sol(st.deudas.Giovanni)),
    buildRow('Telefonía',       sol(tel.Giovanni)),
    buildRow('Suscripciones',   sol(st.suscripc.Giovanni)),
    buildRow('Alim + salud',    sol(st.alimentac.Giovanni)),
  ].join('');

  // Pozo
  const pozoGrand = gt.total + ahorroVictor;
  $('pozo-total').textContent  = sol(pozoGrand);
  $('pozo-sem').textContent    = sol(pozoGrand / 4);
  $('alim-sem').textContent    = sol(alim.totalSem);
  $('donut-total').textContent = sol(pozoGrand);

  // Tabla desglose
  const filas = [
    ['Servicios (luz, agua, gas, internet)', st.servicios.total],
    ['Carro — cuota mensual (Victor)',       st.carro.total],
    ['Deudas individuales',                  st.deudas.total],
    ['Telefonía',                            st.telefonia.total],
    ['Suscripciones digitales',              st.suscripc.total],
    ['Alimentación y salud',                 st.alimentac.total],
  ];
  const totalHogar = filas.reduce((s, [, v]) => s + v, 0);

  $('desglose-tabla').innerHTML =
    filas.map(([l, v]) => `<tr><td>${l}</td><td>${sol(v)}</td></tr>`).join('') +
    `<tr class="tot"><td>Total mensual</td><td style="color:var(--gold);font-family:var(--serif)">${sol(totalHogar)}</td></tr>`;

  // Deudas
  $('deudas-lista').innerHTML = deudas
    .filter(d => d.restantes > 0 && d.nombre)
    .sort((a, b) => a.restantes - b.restantes)
    .map(d => `
      <div class="di">
        <div class="di-left">
          <span class="di-icon">${ICONS[d.nombre] || '💳'}</span>
          <div>
            <div class="di-name">${d.nombre}</div>
            <div class="di-meta">
              <span class="chip ${CHIP[d.resp] || 'ca'}">${d.resp}</span>
              · ${d.restantes} cuota${d.restantes !== 1 ? 's' : ''} × ${sol(d.cuota)}
            </div>
          </div>
        </div>
        <div class="di-right">
          <div class="di-term">Termina ${calcEndDate(d.restantes)}</div>
          <div class="di-amt">Libera ${sol(d.cuota)}/mes</div>
        </div>
      </div>`).join('');

  // Victor — panel mejorado
  $('victor-ahorro').innerHTML = `
    <div class="vc-block vc-hogar">
      <div class="vc-block-title">🏠 Aporte al hogar</div>
      <div class="vc-block-amount">${sol(gt.Victor)}</div>
      <div class="vc-block-sub">Servicios, carro, deudas y alimentación</div>
    </div>
    <div class="vc-block vc-maint">
      <div class="vc-block-title">🔧 Fondo mantenimiento del carro</div>
      <div class="vc-block-amount">${sol(ahorroVictor)}</div>
      <div class="vc-block-sub">Para reparaciones — no es una deuda, es ahorro</div>
    </div>
    <div class="vc-total">
      <span class="vc-total-label">Total que deposita Victor</span>
      <span class="vc-total-amt">${sol(vicT)}</span>
    </div>`;

  $('vic-progreso').innerHTML = buildBarrasVictor(deudas);

  // Semanal
  $('vic-sem').textContent    = sol(alim.repartoSem.Victor);
  $('ede-sem').textContent    = sol(alim.repartoSem.Edeliza);
  $('gio-sem').textContent    = sol(alim.repartoSem.Giovanni);
  $('sem-total').textContent  = sol(alim.totalSem);
  $('alim-detalle').innerHTML = buildAlimDetalle(alim);

  // Charts
  if (!chartsReady) {
    initCharts();
    chartsReady = true;
  }
  updateCharts(d, vicT);
  animarBarras(400);
}
