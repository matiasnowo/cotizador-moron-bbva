# QA etapa 7

Fecha: 2026-06-22

## Alcance verificado

- Portada principal con cards de `Bici` y `Bolso + AP + Celular`.
- Acceso secundario a `Solicitar baja`.
- Vista `Bici` con planes, resumen, formulario y payload de referencia.
- Vista `Bolso` conservada.
- Vista `Baja` con formulario real.
- Footer institucional SSN.

## Verificaciones ejecutadas

- `node --check script.js`
- `bash -n .github/scripts/send-ews.sh`
- Validacion YAML del workflow de GitHub Actions
- Capturas locales desktop:
  - `tmp/qa-home.png`
  - `tmp/qa-bici.png`
  - `tmp/qa-baja.png`
- Capturas locales mobile:
  - `tmp/qa-home-mobile.png`
  - `tmp/qa-baja-mobile.png`

## Resultado

- Sin errores de sintaxis en el frontend.
- Workflow de envio valido.
- Layout visual consistente en desktop y mobile para las vistas revisadas.
- No se detectaron regresiones bloqueantes en la navegacion principal.
