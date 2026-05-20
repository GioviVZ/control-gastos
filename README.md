# Control Familiar — Dashboard

Dashboard web conectado a Google Drive para ver gastos y aportes en tiempo real.

## Estructura

```
control-familiar/
├── index.html              ← abrir en el navegador
├── css/
│   ├── style.css           ← variables, layout, animaciones
│   └── components.css      ← tarjetas, chips, tablas, barras
├── js/
│   ├── api.js              ← conexión con Google Drive
│   ├── charts.js           ← barras de progreso y helpers
│   └── app.js              ← lógica principal del dashboard
├── assets/
│   └── (favicon, logo, etc.)
└── README.md
```

## Configuración (una sola vez)

### 1. Subir el Excel a Google Sheets
1. Sube `Control_Gastos_v7b.xlsx` a Google Drive
2. Click derecho → *Abrir con → Google Sheets*
3. Copia el ID de la URL:
   `docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`

### 2. Crear el Apps Script
1. Ve a [script.google.com](https://script.google.com) → Nuevo proyecto
2. Borra el código por defecto
3. Pega el contenido de `apps_script_control_familiar.js`
4. Reemplaza `FILE_ID` con el ID del paso anterior
5. Guarda (Ctrl+S)

### 3. Publicar como API
1. *Implementar* → *Nueva implementación*
2. Tipo: **Aplicación web**
3. Ejecutar como: **Yo**
4. Quién tiene acceso: **Cualquier usuario**
5. Click *Implementar* → Autorizar → **Copiar la URL**

### 4. Conectar el dashboard
1. Abre `index.html` en el navegador
2. Pega la URL del paso anterior
3. Click *Conectar con Drive*

La URL se guarda en el navegador. La próxima vez que abras el dashboard, los datos cargan solos.

## Actualizar datos

Cada vez que edites el Excel en Google Drive, los datos se actualizan la próxima vez que abras o refresque el dashboard (botón *↻ Actualizar datos*).

## Nota sobre el Apps Script

El archivo `apps_script_control_familiar.js` **no va en esta carpeta** — vive en [script.google.com](https://script.google.com). Guárdalo como respaldo en Drive.
