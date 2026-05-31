// ═══════════════════════════════════════════════════════════════════════
// Google Apps Script — Portal de Vinculación Tecnológica UNRC
// ═══════════════════════════════════════════════════════════════════════
//
// Funciones:
//   doGet  — Proxy seguro de lectura de Google Sheets (sin exponer API Key)
//   doPost — Recibe consultas del formulario, registra en Sheet y envía emails
//
// Deploy: "Web app" → Ejecutar como "Yo (tu cuenta)" → Acceso: "Cualquier usuario"
// Al actualizar, elegir "Nueva versión" y confirmar el deploy.
// ═══════════════════════════════════════════════════════════════════════

const SPREADSHEET_ID = '1NFC7XoveB4X5pmYFMuzwQU0Lmiqd7iy_2Ugf0JSFu44';
const EMAIL_EQUIPO   = 'vintec@ac.unrc.edu.ar';

// Lista blanca de hojas que el proxy puede leer (nunca expone Consultas ni datos internos)
const HOJAS_PERMITIDAS = [
  'Servicios', 'Proyectos', 'Equipamiento', 'Institutos',
  'PropiedadIntelectual', 'Formacion', 'Noticias', 'Desarrollos'
];

// ── Proxy de lectura de datos (GET) ─────────────────────────────────
//
// Parámetros de la URL:
//   ?sheet=Servicios          → devuelve filas A2:Zlast (todas las filas de datos)
//   ?sheet=Servicios&row=3    → devuelve solo la fila N (usado por detalle.html)
//
// Respuesta: { values: [[...], [...]] }  — mismo formato que Google Sheets API v4
// Esto permite usar el proxy sin cambiar el código de parseo del portal.

function doGet(e) {
  var sheetName = (e.parameter.sheet || '').trim();
  var rowParam  = e.parameter.row ? parseInt(e.parameter.row, 10) : null;

  if (!sheetName || HOJAS_PERMITIDAS.indexOf(sheetName) === -1) {
    return jsonResponse({ error: 'Hoja no permitida' });
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName(sheetName);
  if (!ws) {
    return jsonResponse({ error: 'Hoja no encontrada' });
  }

  var lastRow = ws.getLastRow();
  var lastCol = Math.max(ws.getLastColumn(), 1);
  var values  = [];

  if (rowParam && rowParam >= 2) {
    // Fila específica (detalle.html pasa ?row=N)
    if (lastRow >= rowParam) {
      values = ws.getRange(rowParam, 1, 1, lastCol).getValues();
    }
  } else {
    // Todas las filas de datos a partir de la fila 2 (máximo 499 filas)
    if (lastRow >= 2) {
      values = ws.getRange(2, 1, Math.min(lastRow - 1, 499), lastCol).getValues();
    }
  }

  // Convertir a strings — mismo comportamiento que Sheets API v4
  var zone = Session.getScriptTimeZone();
  var stringValues = values.map(function(row) {
    return row.map(function(cell) {
      if (cell instanceof Date) {
        return Utilities.formatDate(cell, zone, 'dd/MM/yyyy');
      }
      return (cell === null || cell === undefined) ? '' : String(cell);
    });
  });

  return jsonResponse({ values: stringValues });
}

// ── Recepción de consultas del formulario (POST) ─────────────────────

function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);

    var ahora  = new Date();
    var zone   = Session.getScriptTimeZone();
    var fecha  = Utilities.formatDate(ahora, zone, 'dd/MM/yyyy');
    var hora   = Utilities.formatDate(ahora, zone, 'HH:mm');
    var ticket = datos.ticket || generarTicket(ahora, zone);

    // Registrar en la hoja Consultas (se crea si no existe)
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var ws = ss.getSheetByName('Consultas');
    if (!ws) { ws = ss.insertSheet('Consultas'); }

    ws.appendRow([
      ticket,
      fecha,
      hora,
      datos.actor        || '',
      datos.nombre       || '',
      datos.email        || '',
      datos.organizacion || '',
      datos.localidad    || '',
      (datos.necesidades || []).join(', '),
      (datos.sectores    || []).join(', '),
      datos.escala       || '',
      datos.mensaje      || '',
      'Pendiente'
    ]);

    // Email de notificación al equipo UVT
    var asuntoEquipo = '[' + ticket + '] Nueva consulta: ' + datos.nombre + ' – ' + datos.actor;
    var cuerpoEquipo = [
      'Nueva consulta recibida en el Portal de Vinculación Tecnológica UNRC.',
      '',
      'Ticket:        ' + ticket,
      'Fecha/Hora:    ' + fecha + ' ' + hora,
      'Actor:         ' + (datos.actor        || '—'),
      'Nombre:        ' + (datos.nombre       || '—'),
      'Email:         ' + (datos.email        || '—'),
      'Organización:  ' + (datos.organizacion || '—'),
      'Localidad:     ' + (datos.localidad    || '—'),
      'Necesidades:   ' + ((datos.necesidades || []).join(', ') || '—'),
      'Sectores:      ' + ((datos.sectores    || []).join(', ') || '—'),
      'Escala:        ' + (datos.escala       || '—'),
      '',
      'Mensaje:',
      datos.mensaje || '—'
    ].join('\n');
    GmailApp.sendEmail(EMAIL_EQUIPO, asuntoEquipo, cuerpoEquipo);

    // Email de confirmación al solicitante
    if (datos.email) {
      var asuntoConf = '[' + ticket + '] Recibimos tu consulta – Vinculación Tecnológica UNRC';
      var cuerpoConf = [
        'Hola ' + datos.nombre + ',',
        '',
        'Recibimos tu consulta. El equipo de Vinculación Tecnológica de la UNRC',
        'se pondrá en contacto con vos a la brevedad.',
        '',
        'Tu número de ticket es: ' + ticket,
        '',
        'Podés comunicarte en cualquier momento escribiendo a: ' + EMAIL_EQUIPO,
        '',
        'Saludos,',
        'Unidad de Vinculación Tecnológica – UNRC',
        'Secretaría de Extensión y Desarrollo'
      ].join('\n');
      GmailApp.sendEmail(datos.email, asuntoConf, cuerpoConf);
    }

    return jsonResponse({ ok: true, ticket: ticket });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

function generarTicket(fecha, zone) {
  var d = Utilities.formatDate(fecha || new Date(), zone || Session.getScriptTimeZone(), 'yyyyMMdd');
  return 'UNRC-' + d + '-' + Math.floor(Math.random() * 9000 + 1000);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
