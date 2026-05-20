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
    buildRow('Carro',            sol(st.carro.Victor)),
    buildRow('Deudas',           sol(st.deudas.Victor)),
    buildRow('Telefonía',        sol(tel.Victor)),
    buildRow('Suscripciones',    sol(st.suscripc.Victor)),
    buildRow('Alim + salud',     sol(st.alimentac.Victor)),
    buildRow('Ahorro carro',     sol(ahorroVictor)),
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
  $('pozo-total').textContent = sol(pozoGrand);
  $('pozo-sem').textContent   = sol(pozoGrand / 4);
  $('alim-sem').textContent   = sol(alim.totalSem);
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
              · ${d.restantes} restantes × ${sol(d.cuota)}
            </div>
          </div>
        </div>
        <div class="di-right">
          <div class="di-term">${d.fechaInicio || d.restantes + ' cuotas'}</div>
          <div class="di-amt">Libera ${sol(d.cuota)}/mes</div>
        </div>
      </div>`).join('');

  // Victor ahorro
  $('victor-ahorro').innerHTML = `
    <div class="ah-row"><span class="label">Pagos del hogar</span><span class="val">${sol(gt.Victor)}</span></div>
    <div class="ah-row"><span class="label">Ahorro reserva carro</span><span class="val">${sol(ahorroVictor)}</span></div>
    <div class="ah-total"><span class="label">Total que deposita</span><span class="val">${sol(vicT)}</span></div>`;

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
