# Portal de Vinculación Tecnológica – UNRC
## Contexto del proyecto para Claude Code

---

## Qué es este proyecto

Portal web público de la **Unidad de Vinculación Tecnológica (UVT)** de la Universidad Nacional de Río Cuarto (UNRC), dependiente de la Secretaría de Extensión y Desarrollo.

**Objetivo:** mostrar la oferta tecnológica y científica de la UNRC al sector productivo (empresas, cooperativas, municipios, startups, ONGs) y facilitar el contacto y la vinculación.

**URL de producción:** GitHub Pages (rama `main`)  
**Email de contacto:** vintec@ac.unrc.edu.ar

---

## Arquitectura actual

### Archivos principales
```
index.html                # Portal principal (single-file HTML/CSS/JS)
portal-vintec-unrc.html   # Copia legacy — el archivo activo es index.html
detalle.html              # Página genérica de ficha completa
formulario-apps-script.js # Código del backend en Google Apps Script
```

### Stack
- **Frontend:** HTML + CSS + JS vanilla, todo en un solo archivo
- **Datos:** Google Sheets API v4 (lectura pública con API key)
- **Backend de formulario:** Google Apps Script (genera ticket, escribe en Sheets, envía emails)
- **Deploy:** GitHub Pages (rama main)
- **Sin framework, sin build step, sin dependencias npm**

### Fuente de datos (Google Sheets)
- **Spreadsheet ID:** `1NFC7XoveB4X5pmYFMuzwQU0Lmiqd7iy_2Ugf0JSFu44`
- **API Key:** NO está en el repo (fue expuesta y revocada). Ver sección "Pendientes".
- **Pestañas del Sheet y sus columnas:**

| Pestaña | Columnas |
|---|---|
| `Servicios` | titulo, descripcion, icono, categoria, color_hex, fondo_hex, link_texto, link_url, activo |
| `Proyectos` | titulo, empresa, tipo_empresa, descripcion, resultado, resultado_icono, sector, facultad, año, localidad, lat, lng, activo |
| `Equipamiento` | nombre, descripcion, facultad, sectores, foto_url, especificaciones, disponibilidad, activo |
| `Institutos` | nombre, area, responsable, lineas, servicios, proyectos, foto_url, sectores, activo |
| `PropiedadIntelectual` | titulo, tipo, descripcion, estado, año, numero, area, facultad, activo |
| `Formacion` | titulo, tipo, descripcion, fecha, duracion, dirigido, sector, modalidad, link, activo |
| `Consultas` | (se crea automáticamente por el Apps Script) Ticket, Fecha, Hora, Actor, Nombre, Email, Organización, Necesidades, Sectores, Escala, Mensaje, Estado |

- La columna `activo`: `SI` para mostrar, `NO` para ocultar sin borrar la fila
- La columna `sectores` acepta múltiples valores separados por coma: `agro, biotech, ambiente`
- Fotos: URLs de Google Drive se convierten automáticamente con `driveUrl()` — acepta tanto la URL completa de Drive como la URL directa
- `color_hex` y `fondo_hex` aceptan con o sin `#` (el código normaliza)

### Backend formulario
- **Apps Script URL:** `https://script.google.com/macros/s/AKfycbxqX332LOnaIortRheD5AqSNz8sdvJtlYc4gXMsw8itAwqwW0iE-SazXQb6e0Qrb4jRhg/exec`
- Genera tickets tipo `UNRC-YYYYMMDD-XXXX`
- Registra en pestaña `Consultas` del mismo Sheet
- Envía email al equipo + email de confirmación al solicitante
- Usa `mode: 'no-cors'` (requerido para Apps Script cross-origin), el ticket se genera localmente antes del fetch

---

## Identidad visual

### Paleta oficial UNRC (Manual de Identidad)
```css
--unrc-celeste:  #83d0f5   /* celeste escudo */
--unrc-celeste2: #0bbbef   /* celeste marca secundaria */
--unrc-rojo:     #e30613   /* rojo escudo */
--unrc-navy:     #00264d   /* fondos hero/footer */
--unrc-blue:     #004080   /* azul oscuro principal */
--unrc-sky:      #0077cc   /* azul medio, links/botones */
--unrc-accent:   #e30613   /* rojo de acento/CTA */
--unrc-light:    #EBF3FA   /* fondo azul muy claro */
```

### Tipografía
- `'Myriad Pro'` como primera opción (tipografía oficial UNRC)
- `'Source Sans 3'` como fallback web (Google Fonts, cargada en el `<head>`)
- `Arial, sans-serif` como fallback final

### Logo
- Navbar: SVG inline de la **Marca Primaria UNRC versión vertical RGB texto blanco** (escudo a color + texto blanco), height 56px
- Footer: SVG inline de la **Marca Primaria UNRC versión vertical BLANCO** (todo en blanco), height 72px
- Los SVGs están embebidos directamente en el HTML para no depender de archivos externos

### Contraste (WCAG AA)
- Sobre fondos oscuros (navy, blue): texto mínimo `rgba(255,255,255,0.72)`. Nunca usar opacidades menores a 0.70 para texto.
- Rojo `#e30613` NO usar como texto sobre azul oscuro — usar celeste `#83d0f5` en su lugar
- `DM Serif Display` fue eliminada — no es tipografía UNRC

---

## Estructura del portal (secciones en orden)

1. **Navbar** fijo — logo UNRC + dropdowns "Oferta tecnológica" e "Investigación" + hamburguesa mobile
2. **Hero** — headline + buscador tecnológico + stats dinámicas
3. **Sectores** — 7 cards (Agro, Energía, Salud, TIC, Ambiente, Industria, Biotech) con contadores dinámicos
4. **Servicios** — grilla dinámica desde Sheets, colores desde `color_hex`/`fondo_hex`
5. **Equipamiento** — cards con foto, disponibilidad, specs
6. **Institutos y grupos I+D** — cards oscuras sobre navy, badge "Interfacultad"
7. **Estadísticas** — banda azul con contadores dinámicos (cuentan filas activas)
8. **Casos de éxito** — cards con filtros por sector
9. **Propiedad Intelectual** — cards + panel estático de servicios PI
10. **Formación** — cards con filtros por tipo
11. **Mapa de vinculaciones** — Leaflet.js + OpenStreetMap, datos de pestaña Proyectos (marcadores con popup: título, empresa, sector, link a detalle)
12. **Formulario wizard** — 4 pasos: actor → necesidad → sector/escala → contacto → confirmación con ticket
13. **Footer** — logo blanco + links de secciones + contacto

### Secciones eliminadas (no recrear)
- ~~Cómo me vinculo~~ (eliminada, su info está en el formulario)
- ~~Oferta y Demanda~~ (eliminada, redundante)
- ~~Feed de Instagram~~ (reemplazado por Noticias desde Sheets)
- ~~Mapa SVG territorial~~ (reimplementado con Leaflet.js real — ver sección 11)
- ~~Noticias~~ (movida a página web separada, eliminada del portal principal)

---

## Sistema de sectores (filtrado cruzado)

Los sectores son el eje central de navegación. Al seleccionar un sector se filtran **simultáneamente** servicios, equipamiento, institutos y casos de éxito.

### Sectores disponibles
```
agro       → Agropecuario / AgTech    🌾  color: #3A7A1E  bg: #EAF5E6
energia    → Energía                  ⚡  color: #BA7517  bg: #FAEEDA
salud      → Salud                    🏥  color: #c00010  bg: #FEE8E9
tic        → TIC / Software           💻  color: #004080  bg: #EBF3FA
ambiente   → Ambiente                 🌿  color: #0F6E56  bg: #E1F5EE
industria  → Industria / Manufactura  ⚙️  color: #534AB7  bg: #EEEDFE
biotech    → Biotecnología            🧬  color: #185FA5  bg: #E6F1FB
```

### Funciones JS clave
```javascript
normalizarSector(raw)      // "Agropecuario" → "agro"
normalizarSectores(raw)    // "Agro, Biotech" → "agro,biotech"
cardTieneSector(card, s)   // lee data-sectors, soporta múltiples
filtrarSector(cardEl, s)   // activa filtro, actualiza banners
limpiarFiltro()            // resetea todo
actualizarContadores()     // cuenta cards visibles por sector
```

### Atributo en las cards
Todas las cards filtrables deben tener `data-sectors="agro,biotech"` (plural, normalizado).

---

## Buscador tecnológico

Busca en tiempo real en título, descripción y sectores de todas las cards. Funciones:
```javascript
buscarTecnologia(query)   // filtra con debounce 250ms
buscarPill(termino)       // click en pill → busca y hace scroll
scrollToBusqueda()        // scroll a primera card visible
```
CSS: `.busqueda-oculto { display: none !important; }`

---

## Página de detalle (detalle.html)

Página genérica para fichas individuales. Lee parámetros de la URL:
```
detalle.html?tipo=servicio&sheet=SPREADSHEET_ID&row=3
```
Tipos soportados: `servicio`, `caso`, `noticia`, `formacion`

Renderiza: hero con badge de tipo, contenido principal, sidebar con metadata y CTA al formulario.

---

## Formulario de contacto

### Pre-completado desde cards
```javascript
consultarItem(tipo, nombre, sector)
```
Al llamar esta función, el wizard salta al paso 4 y pre-rellena el campo mensaje con el contexto del ítem consultado.

### Validación mínima
Requiere nombre y email. Si falta alguno, vuelve al paso 4.

### Flujo de envío
1. Generar ticket local `UNRC-YYYYMMDD-XXXX`
2. Fetch `no-cors` al Apps Script
3. Mostrar confirmación con ticket (independientemente de la respuesta del servidor)

---

## Imágenes y fotos

- Formato recomendado: WebP, <200KB por imagen
- Lazy loading: `loading="lazy"` en todos los `<img>`
- Fallback: `onerror` que muestra un emoji placeholder si la URL falla
- Google Drive: usar `https://drive.google.com/uc?export=view&id=FILE_ID`
  La función `driveUrl(raw)` convierte automáticamente cualquier URL de Drive

---

## Problemas conocidos y pendientes

### Arquitectura de datos: proxy via Apps Script (implementado)
La API Key de Google fue eliminada del cliente. El portal ahora usa `formulario-apps-script.js` como proxy:
- El portal llama a `SHEETS_CONFIG.PROXY_URL?sheet=NombreHoja` (doGet)
- El Apps Script lee el Sheet con credenciales de servidor y devuelve JSON
- La API Key nunca queda expuesta en el cliente
- **Para activar:** copiar `formulario-apps-script.js` al Apps Script editor, re-deployar como nueva versión

### Pendiente: separar JS del HTML
El archivo `index.html` tiene ~3000 líneas con CSS y JS inline. Separar en:
- `index.html` — estructura
- `assets/portal.css` — estilos
- `assets/portal.js` — lógica

### Mapa territorial (implementado)
Sección `#presencia-territorial` en `index.html`, entre `#casos-exito` y `#propiedad-intelectual`.
- Leaflet 1.9.4 + OpenStreetMap cargados desde CDN en `<head>`
- Datos de la pestaña `Proyectos` (sin fetch adicional — reutiliza `casosRows` ya cargado)
- Columnas usadas: `localidad`, `lat`, `lng`; si `lat`/`lng` están vacíos, geocodifica con Nominatim (1 req/s, con caché)
- Marcador: círculo azul UNRC; popup con título, empresa, sector y link a `detalle.html`
- Sección oculta por defecto (`display:none`); se muestra solo cuando hay al menos un marcador con coordenadas

### Pendiente: palabras clave en Sheets
Agregar columna `keywords` en Servicios, Equipamiento e Institutos para mejorar la búsqueda (actualmente solo busca en título, descripción y sector).

### Pendiente: ficha detalle para Equipamiento e Institutos
`detalle.html` soporta `servicio`, `caso`, `noticia`, `formacion`. Falta agregar `equipo` e `instituto`.

### Conocido: Cloudflare email-decode
Cuando el portal se sirve desde un dominio con Cloudflare, el CDN inyecta un script `email-decode.min.js` como tag `</script><script>` que rompe el JS. Si reaparece, eliminar la línea:
```html
<script data-cfasync="false" src="/cdn-cgi/scripts/..."></script>
```
Y desactivar la ofuscación de emails en el dashboard de Cloudflare: **Scrape Shield → Email Address Obfuscation → Off**.

---

## Workflow recomendado con Claude Code

```bash
# Para cada sesión de trabajo
git checkout -b fix/nombre-del-fix   # rama por feature/fix
# ... hacer cambios ...
git diff                              # revisar antes de commitear
node --check assets/portal.js        # verificar sintaxis JS
git commit -m "fix: descripción"
git push origin fix/nombre-del-fix
# PR → merge a main → GitHub Pages auto-deploy
```

### Verificaciones antes de cada commit
```bash
# Detectar script de Cloudflare inyectado
grep -n "cfasync\|cdn-cgi\|cloudflare" index.html

# Verificar que el JS cierra correctamente
grep -c "<script" index.html
grep -c "</script>" index.html
# Deben ser iguales

# Verificar que no hay API key expuesta (debe retornar solo la línea de CLAUDE.md)
grep -rn "AIzaSy" .
# Verificar que el proxy está configurado
grep -n "PROXY_URL" index.html
```

### Estructura de commits sugerida
```
feat: agregar sección de equipamiento
fix: corregir contadores de sectores
style: ajustar contraste en cards de institutos
data: actualizar estructura de columnas del Sheet
docs: actualizar CLAUDE.md con nuevas pestañas
```

---

## Contacto y referencias

- **Email UVT:** vintec@ac.unrc.edu.ar
- **Web UNRC:** https://www.unrc.edu.ar
- **Google Sheet:** https://docs.google.com/spreadsheets/d/1NFC7XoveB4X5pmYFMuzwQU0Lmiqd7iy_2Ugf0JSFu44
- **Apps Script:** https://script.google.com/macros/s/AKfycbxqX332LOnaIortRheD5AqSNz8sdvJtlYc4gXMsw8itAwqwW0iE-SazXQb6e0Qrb4jRhg/exec
- **GitHub Pages:** rama `main` del repo `vintec-maker/portal-vintec`
