/* charts.js — Chart.js + animaciones */

let donutChart = null;
let barChart   = null;

function initCharts() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color       = '#9090b8';
  Chart.defaults.borderColor = 'rgba(100,100,180,0.12)';
  Chart.defaults.font.family = "'DM Mono', monospace";
  Chart.defaults.font.size   = 11;

  // ── Donut — distribución por persona ──────────────
  const dCtx = document.getElementById('chart-donut').getContext('2d');
  donutChart = new Chart(dCtx, {
    type: 'doughnut',
    data: {
      labels: ['Victor', 'Edeliza', 'Giovanni'],
      datasets: [{
        data: [1, 1, 1],
        backgroundColor: [
          'rgba(96,165,250,0.82)',
          'rgba(251,191,36,0.82)',
          'rgba(52,211,153,0.82)',
        ],
        borderColor: [
          'rgba(96,165,250,0.4)',
          'rgba(251,191,36,0.4)',
          'rgba(52,211,153,0.4)',
        ],
        borderWidth: 1.5,
        hoverBackgroundColor: ['rgba(96,165,250,1)', 'rgba(251,191,36,1)', 'rgba(52,211,153,1)'],
        hoverBorderWidth: 0,
        hoverOffset: 10,
      }],
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f0f1d',
          borderColor: 'rgba(100,100,180,0.3)',
          borderWidth: 1,
          titleColor: '#e2e2f0',
          bodyColor: '#9090b8',
          callbacks: {
            label: ctx => ` S/. ${Math.round(ctx.raw).toLocaleString('es-PE')}`,
          },
        },
      },
      animation: { duration: 1000, easing: 'easeInOutQuart' },
    },
  });

  // ── Barras horizontales — categorías ──────────────
  const bCtx = document.getElementById('chart-bar').getContext('2d');
  barChart = new Chart(bCtx, {
    type: 'bar',
    data: {
      labels: ['Servicios', 'Carro', 'Deudas', 'Telefonía', 'Suscripc.', 'Alim+Salud'],
      datasets: [{
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(96,165,250,0.75)',
          'rgba(167,139,250,0.75)',
          'rgba(251,191,36,0.75)',
          'rgba(251,146,60,0.75)',
          'rgba(52,211,153,0.75)',
          'rgba(251,113,133,0.75)',
        ],
        borderColor: [
          'rgba(96,165,250,1)',
          'rgba(167,139,250,1)',
          'rgba(251,191,36,1)',
          'rgba(251,146,60,1)',
          'rgba(52,211,153,1)',
          'rgba(251,113,133,1)',
        ],
        borderWidth: 1.5,
        borderRadius: 5,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f0f1d',
          borderColor: 'rgba(100,100,180,0.3)',
          borderWidth: 1,
          titleColor: '#e2e2f0',
          bodyColor: '#9090b8',
          callbacks: {
            label: ctx => ` S/. ${Math.round(ctx.raw).toLocaleString('es-PE')}`,
          },
        },
      },
      scales: {
        x: {
          grid:   { color: 'rgba(100,100,180,0.1)' },
          border: { display: false },
          ticks:  {
            color: '#55557a',
            callback: v => v >= 1000 ? 'S/.' + (v / 1000).toFixed(1) + 'k' : 'S/.' + v,
          },
        },
        y: {
          grid:   { display: false },
          border: { display: false },
          ticks:  { color: '#9090b8' },
        },
      },
      animation: { duration: 900, easing: 'easeInOutQuart' },
    },
  });
}

function updateCharts(d, vicT) {
  if (!donutChart || !barChart) return;
  const { subtotales: st, totalMensual: gt } = d;

  donutChart.data.datasets[0].data = [vicT, gt.Edeliza, gt.Giovanni];
  donutChart.update();

  barChart.data.datasets[0].data = [
    st.servicios.total,
    st.carro.total,
    st.deudas.total,
    st.telefonia.total,
    st.suscripc.total,
    st.alimentac.total,
  ];
  barChart.update();
}

/* ── Helpers de animación ─────────────────────────── */
function animarBarras(delay = 400) {
  setTimeout(() => {
    document.querySelectorAll('.prog-fill[data-w]').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, delay);
}

function animarBarrasPersonas(vicT, edeT, gioT, delay = 300) {
  const maxP = Math.max(vicT, edeT, gioT);
  if (maxP === 0) return;
  setTimeout(() => {
    document.getElementById('vic-bar').style.width = (vicT / maxP * 100) + '%';
    document.getElementById('ede-bar').style.width = (edeT / maxP * 100) + '%';
    document.getElementById('gio-bar').style.width = (gioT / maxP * 100) + '%';
  }, delay);
}

function buildBarrasVictor(deudas) {
  const carro     = deudas.find(d => d.nombre === 'Pago del Carro');
  const pagadas   = carro?.pagadas   || 0;
  const total     = carro?.total     || 60;
  const restantes = carro?.restantes || 0;
  const cuota     = carro?.cuota     || 1500;
  const carroPct  = Math.round(pagadas / total * 100);
  const saldo     = restantes * cuota;

  return `
    <div class="prog">
      <div class="prog-row">
        <span class="prog-name">Carro pagado</span>
        <span class="prog-val">${carroPct}% · ${pagadas}/${total} cuotas</span>
      </div>
      <div class="prog-bar">
        <div class="prog-fill" style="width:0%;background:linear-gradient(90deg,var(--vic),#7c3aed)" data-w="${carroPct}"></div>
      </div>
    </div>
    <div class="prog">
      <div class="prog-row">
        <span class="prog-name">Saldo pendiente</span>
        <span class="prog-val">${sol(saldo)}</span>
      </div>
      <div class="prog-bar">
        <div class="prog-fill" style="width:0%;background:linear-gradient(90deg,var(--red),#f97316);opacity:.7" data-w="${100 - carroPct}"></div>
      </div>
    </div>`;
}

function buildAlimDetalle(alim) {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:10px">
      ${[['Mercado', alim.mercadoSem], ['Salud', alim.saludSem], ['Higiene', alim.higieneSem]]
        .map(([label, monto]) => `
          <div style="background:var(--bg3);padding:12px;border-radius:8px;text-align:center;border:1px solid var(--border)">
            <div style="color:var(--ink3);margin-bottom:5px">${label}</div>
            <div style="font-weight:600;color:var(--ink)">${sol(monto)}<span style="color:var(--ink3);font-weight:400">/sem</span></div>
          </div>`).join('')}
    </div>`;
}
