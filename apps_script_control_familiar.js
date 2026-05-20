const FILE_ID = "17g-07BBNVb5kC0M6BHgf-BVlVjBDjHD58o_fHATrPUQ"; // ← SOLO CAMBIA ESTO

function doGet() {
  try {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, data: extraerDatos() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: e.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function extraerDatos() {
  const wb = SpreadsheetApp.openById(FILE_ID);

  // Leer hojas necesarias
  const cfg = wb.getSheetByName("⚙️ Configuración").getDataRange().getValues();
  const men = wb.getSheetByName("📊 Presupuesto Mensual").getDataRange().getValues();
  const sem = wb.getSheetByName("📆 Presupuesto Semanal").getDataRange().getValues();
  const deu = wb.getSheetByName("💰 Deudas y Compromisos").getDataRange().getValues();
  const res = wb.getSheetByName("Resumen").getDataRange().getValues();

  // Helper: leer celda (1-indexed)
  const v = (sheet, row, col) => {
    const val = sheet[row - 1] && sheet[row - 1][col - 1];
    return (val !== undefined && val !== null) ? val : null;
  };
  const n   = x => typeof x === "number" ? x : (parseFloat(x) || 0);
  const str = x => x != null ? String(x) : "";
  const fmtFecha = x => x instanceof Date
    ? x.toLocaleDateString("es-PE", { month: "2-digit", year: "numeric" })
    : str(x).substring(0, 7); // "YYYY-MM"

  // ── PORCENTAJES (Config R5,R6,R7 col B) ──
  const porcentajes = {
    Victor:   n(v(cfg, 5, 2)),
    Edeliza:  n(v(cfg, 6, 2)),
    Giovanni: n(v(cfg, 7, 2)),
  };

  // ── ALIMENTACIÓN SEMANAL (Config R12-R15) ──
  const alimentacion = {
    mercadoSem:  n(v(cfg, 12, 2)),
    mercadoMen:  n(v(cfg, 12, 3)),
    saludSem:    n(v(cfg, 13, 2)),
    saludMen:    n(v(cfg, 13, 3)),
    higieneSem:  n(v(cfg, 14, 2)),
    higieneMen:  n(v(cfg, 14, 3)),
    totalSem:    n(v(cfg, 15, 2)),
    totalMen:    n(v(cfg, 15, 3)),
    repartoSem: {
      Victor:   n(v(cfg, 19, 3)),
      Edeliza:  n(v(cfg, 20, 3)),
      Giovanni: n(v(cfg, 21, 3)),
    },
    repartoMen: {
      Victor:   n(v(cfg, 19, 4)),
      Edeliza:  n(v(cfg, 20, 4)),
      Giovanni: n(v(cfg, 21, 4)),
    },
  };

  // ── SERVICIOS FIJOS (Config R25-R28) ──
  const servicios = {
    luz:      { monto: n(v(cfg, 25, 2)), resp: str(v(cfg, 25, 3)) },
    agua:     { monto: n(v(cfg, 26, 2)), resp: str(v(cfg, 26, 3)) },
    gas:      { monto: n(v(cfg, 27, 2)), resp: str(v(cfg, 27, 3)) },
    internet: { monto: n(v(cfg, 28, 2)), resp: str(v(cfg, 28, 3)) },
  };

  // ── DEUDAS (Config R32-R37) ──
  const deudas = [32, 33, 34, 35, 36, 37].map(r => ({
    nombre:      str(v(cfg, r, 1)),
    cuota:       n(v(cfg, r, 2)),
    resp:        str(v(cfg, r, 3)),
    total:       n(v(cfg, r, 4)),
    pagadas:     n(v(cfg, r, 5)),
    restantes:   n(v(cfg, r, 6)),
    fechaInicio: fmtFecha(v(cfg, r, 7)),
  }));

  // ── TELEFONÍA (Config R41,R42,R43) ──
  const telefonia = {
    Victor:   n(v(cfg, 41, 2)),
    Giovanni: n(v(cfg, 42, 2)),
    Edeliza:  n(v(cfg, 43, 2)),
  };

  // ── SUSCRIPCIONES (Config R47,R48,R49) ──
  const suscripciones = {
    netflix: n(v(cfg, 47, 2)),
    claude:  n(v(cfg, 48, 2)),
    chatgpt: n(v(cfg, 49, 2)),
  };

  // ── AHORRO VICTOR (Config R52) ──
  const ahorroVictor = n(v(cfg, 52, 2));

  // ── SUBTOTALES PRESUPUESTO MENSUAL ──
  // R9=Servicios, R13=Carro, R20=Deudas, R26=Telefonía, R32=Suscripciones, R39=Alim, R42=TOTAL
  const subtotales = {
    servicios: { total: n(v(men, 9,2)),  Victor: n(v(men, 9,3)),  Edeliza: n(v(men, 9,4)),  Giovanni: n(v(men, 9,5))  },
    carro:     { total: n(v(men,13,2)),  Victor: n(v(men,13,3)),  Edeliza: n(v(men,13,4)),  Giovanni: n(v(men,13,5))  },
    deudas:    { total: n(v(men,20,2)),  Victor: n(v(men,20,3)),  Edeliza: n(v(men,20,4)),  Giovanni: n(v(men,20,5))  },
    telefonia: { total: n(v(men,26,2)),  Victor: n(v(men,26,3)),  Edeliza: n(v(men,26,4)),  Giovanni: n(v(men,26,5))  },
    suscripc:  { total: n(v(men,32,2)),  Victor: n(v(men,32,3)),  Edeliza: n(v(men,32,4)),  Giovanni: n(v(men,32,5))  },
    alimentac: { total: n(v(men,39,2)),  Victor: n(v(men,39,3)),  Edeliza: n(v(men,39,4)),  Giovanni: n(v(men,39,5))  },
  };

  // ── TOTAL MENSUAL (Presupuesto Mensual R42) ──
  const totalMensual = {
    total:    n(v(men, 42, 2)),
    Victor:   n(v(men, 42, 3)),
    Edeliza:  n(v(men, 42, 4)),
    Giovanni: n(v(men, 42, 5)),
  };

  // ── RESUMEN (hoja Resumen R10,R11,R12) ──
  const resumen = {
    Victor:   { mensual: n(v(res,10,3)), semanal: n(v(res,10,4)), soloComidasSem: n(v(res,10,5)) },
    Edeliza:  { mensual: n(v(res,11,3)), semanal: n(v(res,11,4)), soloComidasSem: n(v(res,11,5)) },
    Giovanni: { mensual: n(v(res,12,3)), semanal: n(v(res,12,4)), soloComidasSem: n(v(res,12,5)) },
  };

  // ── PROYECCIÓN DEUDAS (hoja Deudas R5-R12, cols K-V = meses) ──
  // Extraer los 12 meses de proyección de cada deuda
  const proyeccion = [];
  const deudaRows = [5, 6, 7, 9, 10, 12]; // filas con datos reales (sin separadores)
  deudaRows.forEach(r => {
    const nombre = str(v(deu, r, 1));
    if (!nombre || nombre.startsWith("─")) return;
    const meses = [];
    for (let c = 11; c <= 22; c++) {
      const val = v(deu, r, c);
      meses.push(typeof val === "number" ? val : 0);
    }
    proyeccion.push({ nombre, meses });
  });

  return {
    generadoEl: new Date().toLocaleDateString("es-PE", {
      day: "2-digit", month: "long", year: "numeric"
    }),
    porcentajes,
    alimentacion,
    servicios,
    deudas,
    telefonia,
    suscripciones,
    ahorroVictor,
    subtotales,
    totalMensual,
    resumen,
    proyeccion,
  };
}
