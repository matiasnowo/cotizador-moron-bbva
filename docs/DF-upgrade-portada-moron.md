# Definicion funcional - Upgrade portada y flujos Moron

## 1. Objetivo

Transformar el sitio actual, que hoy funciona como un formulario unico, en una portada de acceso a productos con una estetica similar a la referencia enviada el 22 de junio de 2026, eliminando por completo la opcion `Motos`.

La nueva experiencia debe quedar centrada en dos caminos principales:

- `Bici`
- `Bolso + AP + Celular`

Ademas, debe incorporar un acceso visible pero secundario para `Solicitar baja`, mantener el bloque institucional de SSN en el pie y preparar flujos de solicitud diferenciados para `Bici` y `Bolso + AP + Celular`.

El producto `Bici` deja de ser solamente informativo: debe conservar la descarga del PDF de condiciones e incorporar un cotizador visual con seleccion de plan, carga completa de datos personales y de la bicicleta, y envio de una solicitud de cobertura por correo.

## 2. Estado actual relevado

Repositorio relevado: `C:\Users\matia\OneDrive\Escritorio\cotizador-moron-bbva-work`

Estado actual:

- Hay una sola landing con formulario en [index.html](C:/Users/matia/OneDrive/Escritorio/cotizador-moron-bbva-work/index.html).
- El frontend hoy envia un `POST` al Worker en [script.js](C:/Users/matia/OneDrive/Escritorio/cotizador-moron-bbva-work/script.js).
- El flujo actual solo contempla 5 campos: nombre, dni, fecha de nacimiento, email y telefono.
- Existe el PDF de bolso en la raiz.
- No existe aun un PDF fuente de Bici dentro del arbol del repo; solo hay renders temporales de referencia en `tmp/pdfs/`.
- Ya existe un workflow de GitHub Actions en [`.github/workflows/enviar-mail.yml`](C:/Users/matia/OneDrive/Escritorio/cotizador-moron-bbva-work/.github/workflows/enviar-mail.yml) que hoy resuelve el envio por shell/curl NTLM hacia Exchange, por lo que forma parte del punto de partida tecnico y no de una capa nueva.
- No existe aun una portada de productos ni flujo de baja.

Referencia visual confirmada:

- La imagen de mejor calidad recibida confirma la misma maqueta base ya definida para la portada.
- Se mantiene el sello superior `SEGUROS - CONVENIO`, la disposicion de dos cards y el bloque inferior de baja con pie SSN.
- La diferencia de esa referencia es principalmente de nitidez y legibilidad, no de estructura.

## 3. Alcance confirmado

### 3.1 Portada

La home deja de ser un formulario y pasa a ser una portada de seleccion, con composicion visual similar a la maqueta:

- Titulo o sello superior: `SEGUROS - CONVENIO`
- Mensaje principal: `Selecciona el tipo de emision que deseas realizar`
- Dos cards principales alineadas:
  - `Seguro de Bici`
  - `Venta de bolso repartidaro celular y ap` o su version corregida de redaccion
- Cada card debe incluir:
  - Ilustracion o icono principal
  - Titulo
  - Texto corto
  - Acceso a PDF de condiciones
  - CTA primario

### 3.2 Bici

La opcion `Motos` se elimina por completo del sitio, del contenido y de cualquier navegacion o referencia residual.

El modulo `Bici` debe permanecer en la portada y ofrecer dos acciones complementarias:

- descargar o abrir el PDF con las condiciones del producto
- ingresar al nuevo flujo de solicitud de cobertura

El nuevo flujo debe tomar como referencia visual la maqueta compartida y presentar, en una misma experiencia:

- selector visual de planes
- detalle de suma asegurada, precio, periodicidad y coberturas de cada plan
- identificacion destacada del plan recomendado o mas elegido, si el cliente lo confirma
- aviso visible sobre franquicia y condiciones relevantes
- resumen de beneficios y asistencias
- formulario de datos del asegurado
- formulario de datos de la bicicleta
- seleccion de forma de contacto preferida
- CTA principal `Solicitar cobertura`

La accion del CTA representa una solicitud y no una emision inmediata. Luego del envio, el equipo se comunicara con la persona para solicitar fotos, completar controles y emitir la poliza.

### 3.3 Bolso + AP + Celular

La card de `Bolso + AP + Celular` reemplaza el uso actual de formulario directo en home.

Debe incluir:

- acceso a PDF de condiciones
- CTA principal para iniciar el formulario de emision
- continuidad con el flujo actual de envio de datos

### 3.4 Baja

Debe existir una seccion secundaria, visible y accesible, con tono menos protagonista que las cards principales:

- encabezado similar a `Queres darte de baja?`
- texto de apoyo explicando que se puede solicitar la anulacion
- boton `Solicitar baja`

Ese boton debe llevar a un formulario especifico de baja, no mezclarlo con la emision.

### 3.5 Pie institucional

Debe incorporarse un pie institucional inspirado en la referencia enviada:

- Matricula SSN: `93279`
- Leyenda de orientacion y asistencia al asegurado
- Telefono `0800-666-8400`
- URL `www.argentina.gob.ar/ssn`
- Marca SSN

Idealmente debe resolverse con buena semantica y legibilidad mobile, no solo como una imagen plana.

## 4. Flujos funcionales

### 4.1 Flujo de portada

1. La persona aterriza en la portada.
2. Ve dos opciones principales: `Bici` y `Bolso + AP + Celular`.
3. Puede:
   - abrir condiciones PDF
   - entrar al flujo del producto
   - pedir una baja desde el acceso secundario

### 4.2 Flujo de emision de bolso

1. La persona entra desde la card de bolso.
2. Completa el formulario.
3. El frontend valida los datos.
4. El payload se envia al backend actual via Worker/dispatch.
5. El backend construye:
   - cuerpo del mail en formato esperado
   - adjunto `.txt`
   - adjunto `.csv`
6. Se despacha el correo al destino corporativo.
7. La UI informa recepcion correcta o error.

### 4.3 Flujo de bici

1. La persona ingresa desde la card `Seguro de Bici` de la portada.
2. Puede descargar o abrir el PDF de condiciones sin completar el formulario.
3. Visualiza los planes disponibles y sus diferencias de cobertura, precio y periodicidad.
4. Selecciona un unico plan. Ningun envio puede realizarse sin un plan seleccionado.
5. Completa sus datos personales y de contacto.
6. Completa los datos de la bicicleta.
7. Elige el medio de contacto preferido.
8. El frontend valida todos los datos y muestra errores junto a cada campo.
9. Al pulsar `Solicitar cobertura`, se envia un payload especifico de Bici al backend.
10. El backend dispara un correo diferenciado para la solicitud de bicicleta.
11. La interfaz confirma que la solicitud fue recibida y aclara que el equipo se comunicara para pedir fotos y continuar la emision.

La solicitud no debe prometer que la bicicleta ya esta asegurada ni que la poliza fue emitida.

### 4.4 Flujo de baja

1. La persona entra desde `Solicitar baja`.
2. Ve un formulario inspirado en la referencia visual enviada, con una disposicion simple y limpia de dos columnas en desktop.
3. Completa un formulario especifico de baja.
4. Los campos requeridos no deben pedir ni `patente` ni `vehiculo` ni `tipo de vehiculo`.
5. Puede completar `observaciones` o `motivo` de manera opcional.
6. El frontend valida.
7. El backend envia la solicitud por correo o por el canal definido.
8. La UI confirma recepcion de la solicitud.

## 5. Requerimientos de formularios

### 5.1 Formulario de bolso

Base actual confirmada:

- nombre y apellido
- dni
- fecha de nacimiento
- email
- telefono

Validaciones minimas explicitadas:

- `dni`:
  - obligatorio
  - solo numeros
  - sin letras ni simbolos
  - con longitud razonable de DNI argentino para evitar valores absurdos
- `email`:
  - obligatorio
  - debe contener al menos formato basico valido con `@`
- `telefono`:
  - obligatorio
  - no debe permitir letras
  - puede admitir prefijo `+`, codigo de area y separadores si luego se normalizan
- `fecha de nacimiento`:
  - obligatoria
  - no futura
- `nombre y apellido`:
  - obligatorio
  - no debe aceptar solo espacios

Nota funcional:

- estas validaciones son piso minimo de frontend para mejorar calidad de carga
- no reemplazan la validacion final del backend

Necesidad de negocio ya detectada para produccion:

- el formato final de envio parece requerir muchos mas campos que los 5 actuales
- hay evidencia de layout de integracion con TXT/CSV de estructura extensa
- antes de cerrar desarrollo productivo hay que decidir si:
  - se mantiene un MVP con 5 campos
  - o se expande el formulario a la estructura real exigida por emision

### 5.2 Formulario de baja

Base funcional actualizada segun referencia y decision tomada:

- nombre
- apellido
- dni
- email
- area
- telefono
- numero de poliza o referencia, si luego se confirma como necesario
- observaciones o motivo opcional

Campos explicitamente excluidos:

- patente
- vehiculo
- tipo de vehiculo

Validaciones minimas sugeridas:

- `nombre` y `apellido` obligatorios
- `dni` obligatorio, solo numerico y con longitud razonable
- `email` obligatorio, con validacion basica de formato
- `area` y `telefono` obligatorios si se mantienen separados
- `telefono` sin letras
- `observaciones/motivo` opcional

Nota de UX:

- conviene mantener el look and feel de la maqueta de baja, pero simplificando el formulario a este dominio de seguros de convenio y eliminando cualquier rastro automotor

### 5.3 Formulario de bicicleta

El formulario de `Bici` sera mas completo y visual que el formulario actual de bolso. Debe dividirse en bloques claros y conservar en pantalla el contexto del plan elegido.

#### Seleccion de plan

Cada plan debe informar, como minimo:

- nombre o codigo del plan
- suma asegurada o limite de robo
- precio
- periodicidad de pago
- coberturas incluidas
- indicador visual de seleccion

Solo se puede seleccionar un plan a la vez. El plan seleccionado debe viajar en el payload con un identificador estable, no solamente con el texto visible o el precio.

Los planes, montos y precios observados en la imagen son de referencia visual y no se consideran aprobados hasta que el cliente entregue o confirme la tabla comercial definitiva.

#### Datos del asegurado

- nombre y apellido
- DNI o CUIL
- email
- telefono
- domicilio
- codigo postal
- localidad
- provincia

#### Datos de la bicicleta

- marca
- modelo
- rodado
- anio
- numero de cuadro
- valor estimado de la bicicleta
- color

#### Contacto preferido

- WhatsApp
- llamada telefonica

Debe elegirse una unica opcion. Si el cliente luego incorpora otros medios, se agregaran como valores controlados.

#### Validaciones minimas

- plan obligatorio y perteneciente al catalogo vigente
- nombre y apellido obligatorios, sin aceptar solo espacios
- DNI/CUIL obligatorio, solo numerico y con longitud coherente segun el tipo aceptado
- email obligatorio y con formato basico valido
- telefono obligatorio, sin letras y normalizado antes del envio
- domicilio, codigo postal, localidad y provincia obligatorios
- marca, modelo, rodado, anio, numero de cuadro, valor y color obligatorios, salvo decision comercial posterior
- anio numerico, no futuro y dentro de un rango razonable
- valor de bicicleta numerico y mayor que cero
- numero de cuadro tratado como texto alfanumerico para no perder ceros iniciales
- forma de contacto obligatoria
- consentimiento o aceptacion de condiciones, si Legal confirma que corresponde

Las validaciones deben repetirse en backend. El frontend solo mejora la experiencia y no es una frontera de seguridad.

## 6. Requerimientos de integracion y salida

### 6.1 Mail de emision de Bolso

El mail de emision de `Bolso + AP + Celular` debe conservar el formato operativo ya definido y aprobado, sin cambios en el cuerpo ni en sus archivos adjuntos.

Asunto requerido:

```text
Pas: Dileo Antonela Venta: bolso
```

Debe contemplar:

- cuerpo actual sin modificaciones
- adjunto `.txt` actual
- adjunto `.csv` actual

La implementacion debe conservar exactamente la construccion vigente de ambos adjuntos. Este cambio solo incorpora o confirma el asunto por producto.

### 6.2 CSV

El `.csv` no debe agregarse como accesorio decorativo: debe construirse desde una estructura de datos canonica para evitar inconsistencias entre:

- formulario
- cuerpo de mail
- txt
- csv

### 6.3 Backend actual

Hoy el frontend apunta a un Worker de Cloudflare que oficia de proxy hacia GitHub Actions.

Eso implica que la UX de exito debe interpretarse como:

- `solicitud aceptada para procesamiento`

y no necesariamente como:

- `emision confirmada y finalizada`

### 6.4 Mail de solicitud de Bici

El envio de `Bici` debe distinguirse del flujo de bolso mediante un tipo de solicitud explicito en el payload y una plantilla propia.

Asunto requerido:

```text
Pas: Dileo Antonela Venta: bici
```

El asunto debe respetarse literalmente, incluyendo espacios, mayusculas y el nombre del producto en minuscula.

El correo se enviara al mismo destinatario configurado para el flujo de Bolso. Como se trata de comunicacion operativa interna o entre empresas, se construira con:

- cuerpo HTML sobrio, ordenado para lectura y derivacion rapida
- version equivalente en texto plano como respaldo de compatibilidad
- ningun archivo adjunto

El objetivo principal del mensaje es permitir que la persona encargada de Ventas identifique y redireccione correctamente la solicitud.

El cuerpo del mail debe incluir, como minimo:

- producto `Bici`
- identificador y nombre del plan elegido
- suma asegurada o limite contratado
- precio informado
- periodicidad de pago
- franquicia, cuando corresponda
- todos los datos del asegurado ingresados en el formulario
- todos los datos de domicilio ingresados en el formulario
- todos los datos de la bicicleta ingresados en el formulario
- forma de contacto preferida
- fecha y hora de recepcion
- identificador unico de la solicitud

El detalle completo de coberturas no se incluira inicialmente en el correo, dado que no es necesario para su objetivo de clasificacion y derivacion. Podra agregarse mas adelante si Ventas lo solicita.

Todo campo opcional no completado debe mostrarse como `No informado`, manteniendo una estructura estable entre mensajes.

Los datos del plan incluidos en el correo deben corresponder al mismo registro comercial validado por el backend al recibir la solicitud. No deben reconstruirse confiando solamente en textos, precios o coberturas enviados por el navegador.

La implementacion debe mantener este flujo desacoplado para no mezclarlo con la plantilla ni los adjuntos de Bolso.

## 7. Requerimientos visuales y de UX

- La portada debe parecer una pantalla de producto/convenio, no una landing generica.
- El foco visual debe estar en las dos cards.
- El flujo de Bici debe priorizar la comparacion de planes y hacer evidente cual esta seleccionado.
- En desktop puede resolverse con planes y beneficios a la izquierda y formulario a la derecha, siguiendo la referencia.
- En mobile debe apilar primero la seleccion de plan y luego el formulario, conservando un resumen visible del plan elegido.
- El PDF de condiciones debe seguir siendo accesible sin obligar a iniciar ni completar la solicitud.
- `Baja` debe ser visible pero con menor jerarquia.
- Debe funcionar bien en mobile y desktop.
- El diseño debe respetar la referencia enviada, pero conviene limpiarlo visualmente para que no parezca una captura incrustada.
- Hay que corregir redacciones visibles, por ejemplo `repartidaro`.

## 8. Riesgos y zonas a cerrar antes de implementar

### 8.1 Datos comerciales de Bici pendientes

El flujo funcional ya esta definido, pero no deben fijarse a partir de la imagen los nombres de planes, sumas aseguradas, precios, periodicidad, franquicia ni coberturas. Esos valores deben ser confirmados por el cliente y conviene administrarlos desde una unica estructura de configuracion.

Tambien falta definir si el catalogo sera fijo dentro del frontend o provendra de una fuente administrable.

### 8.2 Alcance real del formulario de bolso

La integracion de salida sugiere una estructura mas rica que la del formulario actual. Si el cliente espera emision real, probablemente 5 campos no alcancen.

### 8.3 Flujo de baja

Queda bastante mas definido, pero resta cerrar:

- si baja va por el mismo backend
- si usa otro destinatario
- si requiere adjuntos
- si necesita numero de poliza obligatorio

## 9. Pseudocodigo conciso

```text
renderHome():
  mostrar header "SEGUROS - CONVENIO"
  mostrar subtitulo de emision
  mostrar card bici
  mostrar card bolso
  mostrar bloque de baja
  mostrar footer SSN

onClickPdfBici():
  abrir o descargar PDF de bici

onClickCtaBici():
  navegar al cotizador de bici

selectPlan(planId):
  validar que el plan exista y este vigente
  marcar un unico plan como seleccionado
  actualizar resumen de la solicitud

submitBiciForm():
  exigir plan seleccionado
  validar asegurado, domicilio, bicicleta y contacto
  normalizar datos
  construir payload con tipo "bici" y planId
  enviar al backend
  mostrar "solicitud recibida" o error

backendBici(payload):
  volver a validar campos y plan
  construir mail especifico de bici
  despachar solicitud
  registrar o devolver identificador de trazabilidad

onClickCtaBolso():
  navegar a formulario de bolso

submitBolsoForm():
  validar campos
  construir payload
  enviar al Worker
  mostrar estado de envio

backendBolso(payload):
  normalizar datos
  construir cuerpo mail
  generar txt
  generar csv
  despachar workflow / envio exchange
  devolver resultado

onClickSolicitarBaja():
  navegar a formulario de baja

submitBajaForm():
  validar campos
  enviar payload
  mostrar confirmacion o error
```

## 10. Implementacion sugerida por etapas

### Etapa 1 - Cierre funcional y base tecnica

Objetivo: eliminar decisiones bloqueantes y preparar una base estable antes de modificar la experiencia publica.

- relevar la estructura real del frontend, Worker, GitHub Actions y envio EWS
- confirmar en repo los assets ya disponibles, el PDF de Bolso y el material visual de referencia
- inventariar PDFs, imagenes y archivos operativos disponibles
- confirmar la tabla comercial definitiva de planes de Bici
- cerrar campos obligatorios, textos legales y reglas comerciales de Bici
- cerrar campos, destinatario y salida operativa de Baja
- definir las rutas o vistas para `home`, `bici`, `bolso` y `baja`
- definir payloads separados y versionables por tipo de solicitud
- documentar el contrato de mail de Bolso sin alterar su cuerpo ni adjuntos
- documentar el contrato de mail de Bici conforme a la seccion 6.4

Criterio de cierre: contratos de datos, tabla de planes, navegacion, activos y criterios de aceptacion aprobados; no quedan supuestos que modifiquen la arquitectura.

### Etapa 2 - Portada, navegacion y sistema visual

Objetivo: transformar la home actual en la nueva portada sin romper los flujos existentes.

- construir la portada responsive con las cards de Bici y Bolso
- eliminar toda referencia a Motos
- integrar accesos independientes a PDFs y formularios
- incorporar el bloque secundario de Baja
- integrar footer institucional SSN
- definir componentes, estilos, mensajes y estados visuales reutilizables

Criterio de cierre: navegacion completa y responsive entre las vistas, aun con envios desacoplados o simulados.

### Etapa 3 - Consolidacion del flujo de Bolso

Objetivo: trasladar el formulario existente a la nueva estructura y reforzar su calidad sin cambiar su operacion aprobada.

- separar el formulario de Bolso de la portada
- implementar las validaciones definidas
- conservar el payload operativo vigente
- actualizar solamente el asunto a `Pas: Dileo Antonela Venta: bolso`
- preservar el cuerpo actual y los adjuntos `.txt` y `.csv`
- verificar envio y compatibilidad con el backend actual

Criterio de cierre: Bolso funciona de punta a punta con el nuevo asunto y sin regresiones en cuerpo ni adjuntos.

### Etapa 4 - Cotizador y formulario de Bici

Objetivo: implementar la experiencia visual completa de seleccion y solicitud de cobertura.

- crear selector de planes responsive desde una configuracion canonica
- mostrar datos comerciales, franquicia y beneficios necesarios
- crear bloques de asegurado, domicilio, bicicleta y contacto preferido
- implementar validaciones y estados de error
- mantener acceso independiente al PDF
- incorporar resumen del plan y confirmacion de solicitud recibida

Criterio de cierre: formulario navegable, validado y fiel a la referencia, con payload de Bici verificable antes de conectarlo al envio real.

### Etapa 5 - Integracion y mail de Bici

Objetivo: conectar el nuevo formulario con el procesamiento asincrono y el correo operativo.

- implementar tipo de evento o contrato especifico para Bici en Worker y GitHub Actions
- validar nuevamente payload y plan en backend
- generar identificador unico y fecha/hora de recepcion
- construir cuerpo HTML y texto plano con `No informado` para valores opcionales vacios
- usar el asunto literal `Pas: Dileo Antonela Venta: bici`
- enviar al mismo destinatario que Bolso, sin adjuntos
- probar errores de red, procesamiento y EWS

Criterio de cierre: una solicitud valida llega completa al destinatario, puede trazarse y no afecta el flujo de Bolso.

### Etapa 6 - Formulario e integracion de Baja

Objetivo: incorporar la solicitud de anulacion como flujo secundario e independiente.

- construir el formulario responsive sin campos automotores
- implementar validaciones y motivo u observaciones opcionales
- conectar el canal de envio definido en Etapa 1
- incorporar confirmacion y tratamiento de errores

Criterio de cierre: Baja funciona de punta a punta con datos y destinatario aprobados.

### Etapa 7 - QA integral y publicacion

Objetivo: verificar la experiencia completa y desplegar de forma controlada.

- probar desktop, tablet y mobile
- probar navegacion, PDFs y accesibilidad basica
- probar validaciones y manipulacion de payloads
- probar seleccion exclusiva y reglas de planes
- probar envios exitosos, duplicados y errores
- verificar TXT y CSV de Bolso
- verificar formato y trazabilidad del mail de Bici
- realizar prueba final con destinatario real y publicar

Criterio de cierre: todos los flujos aprobados, evidencia de correos recibidos y ausencia de regresiones conocidas.

## 11. Decisiones cerradas sobre los mails

- Los asuntos son literales:
  - `Pas: Dileo Antonela Venta: bolso`
  - `Pas: Dileo Antonela Venta: bici`
- El mail de `Baja` usa el asunto interno:
  - `Pas: Dileo Antonela Baja: seguro`
- Ambos correos se envian al mismo destinatario.
- Bolso conserva sin cambios su cuerpo y sus dos adjuntos `.txt` y `.csv`.
- Bici usa HTML operativo con version de texto plano.
- Bici no lleva adjuntos.
- Baja usa HTML operativo con version de texto plano.
- Baja no lleva adjuntos.
- Bici incluye los datos principales del plan, pero no el detalle completo de coberturas en esta primera version.
- Bici incluye todos los datos cargados en el formulario.
- Baja incluye nombre, apellido, DNI, email, area, telefono y motivo u observaciones opcional.
- Los valores opcionales vacios se muestran como `No informado`.
- Bici incluye fecha, hora e identificador unico de solicitud.
- Baja incluye fecha, hora e identificador unico de solicitud.
- La fecha y hora de Bici se expresan siempre en horario de Buenos Aires.
- La fecha y hora de Baja se expresan siempre en horario de Buenos Aires.
- El identificador unico de solicitud queda solo para correo interno y trazabilidad; no se mostrara al usuario final.

## 12. Preguntas para cerrar con vos

1. El cotizador de Bici debe vivir en una pagina propia o en una seccion expandida dentro de la portada?
2. Los planes se administraran como configuracion fija del sitio o necesitaremos que puedan modificarse sin desplegar codigo?
3. El CTA de bolso debe decir `Emitir`, `Solicitar emision` o una variante menos definitiva?
4. Queres mantener una sola pagina con secciones o preferis separar en:
   - `home`
   - `solicitud bici`
   - `emision bolso`
   - `solicitar baja`
5. El formulario de baja necesita pedir numero de poliza/certificado como obligatorio?
6. La baja debe salir al mismo destinatario de mail o a otro?
7. El mail de baja debe llevar adjuntos tambien o solo cuerpo simple?
8. El formulario de bolso sigue con 5 campos por ahora o avanzamos ya al set completo real de emision?
9. El PDF de bici debe abrirse en otra pestaña o descargarse directo?
10. Queres que el footer SSN sea:
    - imagen literal
    - version maquetada en HTML/CSS
    - version mixta

## 13. Preguntas recomendadas para tu cliente

1. Cuales son los planes definitivos de Bici, sus codigos, sumas aseguradas, precios, periodicidad y coberturas?
2. Que plan debe aparecer como recomendado o `Mas elegido`, y esa etiqueta es fija o puede cambiar?
3. El formulario de `Bolso + AP + Celular` ya esta completo con 5 datos o faltan campos obligatorios para emision real?
4. Cual es el texto exacto que debe verse en cada card y en cada boton?
5. El flujo de `Solicitar baja` a quien debe notificar y que datos minimos debe pedir?
6. La baja debe generar solo un mail o tambien archivos adjuntos normalizados?
7. El exito en pantalla debe decir `solicitud recibida` o `emision realizada`?
8. Hay identidad visual oficial para logos, iconografia y footer SSN, o podemos recrearlo fielmente con HTML/CSS?
9. El PDF de `Bici` es definitivo y versionable dentro del repo?
10. Existe algun SLA, consentimiento o mensaje legal obligatorio para la baja y para la solicitud de cobertura?
11. DNI y CUIL se aceptan indistintamente? Que longitud y reglas deben aplicarse a cada uno?
12. Todos los datos de la bicicleta son obligatorios? Que debe ocurrir si la unidad no tiene numero de cuadro visible?
13. El valor declarado de la bicicleta debe limitarse segun el plan seleccionado?
14. Que provincias y rodados deben estar disponibles en los selectores?
15. El cliente debe adjuntar fotos durante la solicitud o se pediran siempre en un contacto posterior?

## 14. Propuesta de siguiente paso

Antes de implementar, conviene cerrar estas decisiones:

- tabla comercial y reglas de los planes de `Bici`
- obligatoriedad y restricciones de los datos de la bicicleta
- contrato de payload y catalogo comercial de `Bici`
- nivel real de campos de `Bolso`
- definicion operativa del flujo `Baja`

Cuando se reciba el OK para avanzar, el trabajo comenzara por la `Etapa 1 - Cierre funcional y base tecnica`, sin modificar aun la experiencia publica hasta completar su criterio de cierre.
