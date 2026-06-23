#!/usr/bin/env bash
set -euo pipefail

URL_EWS="https://mail.centroatencionmoron.com/EWS/Exchange.asmx"
TZ_BSAS="America/Argentina/Buenos_Aires"
PAYLOAD_PREFIX="MORON_PAYLOAD_V1:"

load_payload() {
  local encoded_payload decoded_payload

  if [ -n "${GITHUB_EVENT_PATH:-}" ] && [ -f "$GITHUB_EVENT_PATH" ]; then
    PAYLOAD_JSON="$(jq -c '.client_payload // {}' "$GITHUB_EVENT_PATH")"
  elif [ -z "${PAYLOAD_JSON:-}" ]; then
    PAYLOAD_JSON='{}'
  fi

  if ! jq -e 'type == "object"' >/dev/null 2>&1 <<< "$PAYLOAD_JSON"; then
    echo "El payload recibido no es un objeto JSON valido."
    exit 1
  fi

  encoded_payload="$(jq -r '.fechaNacimiento // empty' <<< "$PAYLOAD_JSON")"
  if [[ "$encoded_payload" == "$PAYLOAD_PREFIX"* ]]; then
    encoded_payload="${encoded_payload#"$PAYLOAD_PREFIX"}"
    if ! decoded_payload="$(printf '%s' "$encoded_payload" | base64 --decode 2>/dev/null)"; then
      echo "No se pudo decodificar el payload extendido del formulario."
      exit 1
    fi

    if ! jq -e 'type == "object"' >/dev/null 2>&1 <<< "$decoded_payload"; then
      echo "El payload extendido no contiene un objeto JSON valido."
      exit 1
    fi

    PAYLOAD_JSON="$(jq -c '.' <<< "$decoded_payload")"
  fi

  export PAYLOAD_JSON
}

json_get() {
  local payload
  payload="${PAYLOAD_JSON:-}"
  if [ -z "$payload" ]; then
    payload='{}'
  fi
  jq -r "$1 // empty" <<< "$payload" | tr -d '\r'
}

value_or_no_info() {
  local value
  value="$(printf '%s' "${1:-}" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  if [ -n "$value" ]; then
    printf '%s' "$value"
  else
    printf 'No informado'
  fi
}

html_escape() {
  local text
  text="${1:-}"
  text="${text//&/&amp;}"
  text="${text//</&lt;}"
  text="${text//>/&gt;}"
  printf '%s' "$text"
}

escaped_or_no_info() {
  html_escape "$(value_or_no_info "${1:-}")"
}

contact_label() {
  case "${1:-}" in
    whatsapp) printf '%s' 'WhatsApp' ;;
    call) printf '%s' 'Llamada telefonica' ;;
    *) value_or_no_info "${1:-}" ;;
  esac
}

digits_only() {
  printf '%s' "${1:-}" | tr -cd '0-9'
}

sanitize_interface_value() {
  local value max_length
  value="${1:-}"
  max_length="${2:-0}"
  value="$(printf '%s' "$value" | tr '\r\n;' '   ' | sed 's/[[:space:]]\+/ /g;s/^[[:space:]]*//;s/[[:space:]]*$//')"

  if [ "$max_length" -gt 0 ]; then
    value="${value:0:$max_length}"
  fi

  printf '%s' "$value"
}

date_to_yyyymmdd() {
  local value
  value="$(sanitize_interface_value "${1:-}")"

  if [[ "$value" =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2})$ ]]; then
    printf '%s%s%s' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}" "${BASH_REMATCH[3]}"
    return
  fi

  value="$(digits_only "$value")"
  if [ "${#value}" -eq 8 ]; then
    printf '%s' "$value"
  fi
}

split_full_name() {
  local full_name first_names last_name
  full_name="$(sanitize_interface_value "${1:-}" 80)"

  if [[ "$full_name" == *" "* ]]; then
    first_names="${full_name% *}"
    last_name="${full_name##* }"
  else
    first_names="$full_name"
    last_name="$full_name"
  fi

  printf '%s\t%s' "$(sanitize_interface_value "$last_name" 40)" "$(sanitize_interface_value "$first_names" 40)"
}

join_semicolon_row() {
  local IFS=';'
  printf '%s' "$*"
}

send_bici() {
  local request_id requested_at plan_id plan_name plan_limit plan_price plan_franchise plan_period
  local full_name dni_cuil email_addr phone address postal_code locality province
  local brand model wheel_size year frame_number value color contact_preference
  local text_body body_html soap_create res_create item_id change_key soap_send res_send

  request_id="$(json_get '.requestId')"
  if [ -z "$request_id" ]; then
    request_id="BICI-$(date +%Y%m%d%H%M%S)-$RANDOM"
  fi

  requested_at="$(json_get '.requestedAt')"
  if [ -z "$requested_at" ]; then
    requested_at="$(TZ="$TZ_BSAS" date '+%d/%m/%Y %H:%M:%S')"
  fi

  plan_id="$(escaped_or_no_info "$(json_get '.planId // .plan.id')")"
  plan_name="$(escaped_or_no_info "$(json_get '.planName // .plan.name')")"
  plan_limit="$(escaped_or_no_info "$(json_get '.planLimit // .plan.limit')")"
  plan_price="$(escaped_or_no_info "$(json_get '.planPrice // .plan.price')")"
  plan_franchise="$(escaped_or_no_info "$(json_get '.planFranchise // .plan.franchise')")"
  plan_period="$(escaped_or_no_info "$(json_get '.planPeriod // .plan.period')")"

  full_name="$(escaped_or_no_info "$(json_get '.fullName // .insured.fullName // .nombre')")"
  dni_cuil="$(escaped_or_no_info "$(json_get '.dniCuil // .insured.dniCuil // .dni // .cuil')")"
  email_addr="$(escaped_or_no_info "$(json_get '.email // .insured.email')")"
  phone="$(escaped_or_no_info "$(json_get '.phone // .insured.phone // .telefono')")"
  address="$(escaped_or_no_info "$(json_get '.address // .insured.address')")"
  postal_code="$(escaped_or_no_info "$(json_get '.postalCode // .insured.postalCode')")"
  locality="$(escaped_or_no_info "$(json_get '.locality // .insured.locality')")"
  province="$(escaped_or_no_info "$(json_get '.province // .insured.province')")"
  brand="$(escaped_or_no_info "$(json_get '.brand // .bicycle.brand')")"
  model="$(escaped_or_no_info "$(json_get '.model // .bicycle.model')")"
  wheel_size="$(escaped_or_no_info "$(json_get '.wheelSize // .bicycle.wheelSize')")"
  year="$(escaped_or_no_info "$(json_get '.year // .bicycle.year')")"
  frame_number="$(escaped_or_no_info "$(json_get '.frameNumber // .bicycle.frameNumber')")"
  value="$(escaped_or_no_info "$(json_get '.value // .bicycle.value')")"
  color="$(escaped_or_no_info "$(json_get '.color // .bicycle.color')")"
  contact_preference="$(escaped_or_no_info "$(contact_label "$(json_get '.contactPreference')")")"

  text_body="$(cat <<EOF
Solicitud de cobertura Bici
Identificador interno: ${request_id}
Fecha de recepcion: ${requested_at}

Plan seleccionado
- Plan ID: ${plan_id}
- Plan: ${plan_name}
- Suma asegurada: ${plan_limit}
- Precio: ${plan_price}
- Franquicia: ${plan_franchise}
- Periodicidad: ${plan_period}

Datos del asegurado
- Nombre y apellido: ${full_name}
- DNI / CUIL: ${dni_cuil}
- Email: ${email_addr}
- Telefono: ${phone}
- Domicilio: ${address}
- Codigo postal: ${postal_code}
- Localidad: ${locality}
- Provincia: ${province}

Datos de la bicicleta
- Marca: ${brand}
- Modelo: ${model}
- Rodado: ${wheel_size}
- Año: ${year}
- Numero de cuadro: ${frame_number}
- Valor de la bicicleta: ${value}
- Color: ${color}

Contacto preferido: ${contact_preference}
EOF
)"

  body_html="$(cat <<EOF
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
  <h2 style="margin: 0 0 16px; color: #7a123c;">Solicitud de cobertura Bici</h2>
  <p style="margin: 0 0 12px;"><strong>Identificador interno:</strong> ${request_id}</p>
  <p style="margin: 0 0 18px;"><strong>Fecha de recepcion:</strong> ${requested_at}</p>

  <h3 style="margin: 0 0 8px; color: #7a123c;">Version texto plano</h3>
  <pre style="margin: 0 0 20px; padding: 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; white-space: pre-wrap; font-family: Consolas, Monaco, monospace;">${text_body}</pre>

  <h3 style="margin: 0 0 10px; color: #7a123c;">Datos comerciales</h3>
  <ul style="margin: 0 0 18px 20px; padding: 0;">
    <li><strong>Plan ID:</strong> ${plan_id}</li>
    <li><strong>Plan:</strong> ${plan_name}</li>
    <li><strong>Suma asegurada:</strong> ${plan_limit}</li>
    <li><strong>Precio:</strong> ${plan_price}</li>
    <li><strong>Franquicia:</strong> ${plan_franchise}</li>
    <li><strong>Periodicidad:</strong> ${plan_period}</li>
  </ul>

  <h3 style="margin: 0 0 10px; color: #7a123c;">Datos del asegurado</h3>
  <ul style="margin: 0 0 18px 20px; padding: 0;">
    <li><strong>Nombre y apellido:</strong> ${full_name}</li>
    <li><strong>DNI / CUIL:</strong> ${dni_cuil}</li>
    <li><strong>Email:</strong> ${email_addr}</li>
    <li><strong>Telefono:</strong> ${phone}</li>
    <li><strong>Domicilio:</strong> ${address}</li>
    <li><strong>Codigo postal:</strong> ${postal_code}</li>
    <li><strong>Localidad:</strong> ${locality}</li>
    <li><strong>Provincia:</strong> ${province}</li>
  </ul>

  <h3 style="margin: 0 0 10px; color: #7a123c;">Datos de la bicicleta</h3>
  <ul style="margin: 0 0 18px 20px; padding: 0;">
    <li><strong>Marca:</strong> ${brand}</li>
    <li><strong>Modelo:</strong> ${model}</li>
    <li><strong>Rodado:</strong> ${wheel_size}</li>
    <li><strong>Año:</strong> ${year}</li>
    <li><strong>Numero de cuadro:</strong> ${frame_number}</li>
    <li><strong>Valor de la bicicleta:</strong> ${value}</li>
    <li><strong>Color:</strong> ${color}</li>
  </ul>

  <p style="margin: 0;"><strong>Forma de contacto preferida:</strong> ${contact_preference}</p>
</div>
EOF
)"

  soap_create="<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:m=\"http://schemas.microsoft.com/exchange/services/2006/messages\" xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
  <soap:Header><t:RequestServerVersion Version=\"Exchange2013\" /></soap:Header>
  <soap:Body>
    <m:CreateItem MessageDisposition=\"SaveOnly\">
      <m:SavedItemFolderId><t:DistinguishedFolderId Id=\"drafts\" /></m:SavedItemFolderId>
      <m:Items>
        <t:Message>
          <t:Subject>Pas: Dileo Antonela Venta: bici</t:Subject>
          <t:Body BodyType=\"HTML\"><![CDATA[${body_html}]]></t:Body>
          <t:ToRecipients><t:Mailbox><t:EmailAddress>${DESTINATARIO_MAIL}</t:EmailAddress></t:Mailbox></t:ToRecipients>
        </t:Message>
      </m:Items>
    </m:CreateItem>
  </soap:Body>
</soap:Envelope>"

  res_create=$(curl -k --ntlm -u "$EXCHANGE_USER:$EXCHANGE_PASS" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://schemas.microsoft.com/exchange/services/2006/messages/CreateItem\"" -d "$soap_create" "$URL_EWS")

  item_id=$(echo "$res_create" | grep -oP 'Id="[^"]+"' | head -n 1 | sed 's/Id="//;s/"//')
  change_key=$(echo "$res_create" | grep -oP 'ChangeKey="[^"]+"' | head -n 1 | sed 's/ChangeKey="//;s/"//')

  if [ -z "$item_id" ]; then
    echo "Error critico: No se pudo obtener el ItemId de Exchange corporativo."
    echo "Respuesta del servidor:"
    echo "$res_create"
    exit 1
  fi

  soap_send="<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:m=\"http://schemas.microsoft.com/exchange/services/2006/messages\" xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
  <soap:Header><t:RequestServerVersion Version=\"Exchange2013\" /></soap:Header>
  <soap:Body>
    <m:SendItem SaveItemToFolder=\"true\">
      <m:ItemIds>
        <t:ItemId Id=\"$item_id\" ChangeKey=\"$change_key\" />
      </m:ItemIds>
    </m:SendItem>
  </soap:Body>
</soap:Envelope>"

  res_send=$(curl -k --ntlm -u "$EXCHANGE_USER:$EXCHANGE_PASS" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://schemas.microsoft.com/exchange/services/2006/messages/SendItem\"" -d "$soap_send" "$URL_EWS")

  if echo "$res_send" | grep -q "NoError"; then
    echo "EXITO TOTAL: la solicitud de Bici fue enviada a traves de Exchange NTLM."
  else
    echo "Error en el envio final de Bici:"
    echo "$res_send"
    exit 1
  fi
}

send_bolso() {
  local nombre dni fecha_nacimiento email_addr telefono
  local raw_nombre apellido nombres dni_digits id_venta fecha_alta fecha_nacimiento_yyyymmdd
  local phone_interface email_interface txt_row csv_row txt_content csv_content txt_base64 csv_base64
  local soap_create res_create item_id change_key soap_attach res_attach new_change_key soap_send res_send
  local -a txt_fields csv_fields csv_headers

  raw_nombre="$(json_get '.nombre // .fullName')"
  IFS=$'\t' read -r apellido nombres <<< "$(split_full_name "$raw_nombre")"

  dni_digits="$(digits_only "$(json_get '.dni')")"
  fecha_alta="$(TZ="$TZ_BSAS" date '+%Y%m%d')"
  fecha_nacimiento_yyyymmdd="$(date_to_yyyymmdd "$(json_get '.fechaNacimiento')")"
  id_venta="$(TZ="$TZ_BSAS" date '+%y%m%d%H%M%S')${dni_digits: -4}"
  id_venta="$(sanitize_interface_value "$id_venta" 16)"
  phone_interface="$(sanitize_interface_value "$(json_get '.telefono // .phone')" 20)"
  email_interface="$(sanitize_interface_value "$(json_get '.email')" 40)"

  for ((i = 0; i < 72; i++)); do
    txt_fields[$i]=""
    csv_fields[$i]=""
  done

  txt_fields[0]="000004"
  txt_fields[1]="0005"
  txt_fields[2]="0013"
  txt_fields[3]="$id_venta"
  txt_fields[4]="$fecha_alta"
  txt_fields[5]="CUIL"
  txt_fields[6]="$(sanitize_interface_value "$dni_digits" 11)"
  txt_fields[7]="$apellido"
  txt_fields[8]="$nombres"
  txt_fields[9]="1"
  txt_fields[10]="$(sanitize_interface_value "$dni_digits" 8)"
  txt_fields[11]=""
  txt_fields[12]="$fecha_nacimiento_yyyymmdd"
  txt_fields[13]="1"
  txt_fields[14]="ARGENTINA"
  txt_fields[16]="0001"
  txt_fields[28]="$phone_interface"
  txt_fields[30]="$email_interface"
  txt_fields[31]="S"
  txt_fields[32]="000090"
  txt_fields[33]="154"
  txt_fields[35]="50000000"
  txt_fields[36]="01"
  txt_fields[37]="01"
  txt_fields[38]="0003"
  txt_fields[65]="N"

  csv_fields=("${txt_fields[@]}")
  csv_fields[0]="4"
  csv_fields[1]="5"
  csv_fields[2]="13"
  csv_fields[16]="1"
  csv_fields[32]="90"
  csv_fields[36]="1"
  csv_fields[37]="1"
  csv_fields[38]="3"

  csv_headers=(
    "Canal" "S.Canal" "Linea" "ID Venta" "Fec Alta" "Cod.Id" "Nro.Id"
    "Apellido" "Nombre" "T.Doc." "N.Doc." "Sexo" "F.Nac." "E.C."
    "Lugar Nac." "C.Nac." "C.Pais" "Calle" "N.Calle" "Piso" "Dpto."
    "C.Prov." "Partido" "Localidad" "Barrio" "C.Postal" "C.CPA"
    "Domicilio Ext." "Tel. Fax 1" "Tel. Fax 2" "Email" "P.Mail"
    "C.Ocup." "P.Cob." "CMonto" "CAseg." "Mpag." "C.Cuo." "C.Tarj."
    "N.Tarj." "Bco.TC" "Bco.Deb." "Suc.Bco." "Nro.Cta." "CBU"
    "Calle Inf." "N.Calle Inf." "Piso Inf." "Dpto.Inf." "Dom.Ext.Inf."
    "C.Prov.Inf." "Partido Inf." "Loc. Inf." "Barrio Inf." "C.Postal Inf."
    "C.CPA Inf." "Tel.Fax 1" "Tel.Fax 2" "Bco.TC.Aseg." "C.TC.Aseg."
    "TipoTC.Aseg." "N.TC.Aseg." "Datos Bien 1" "Datos 2" "Datos 3"
    "Marca UIF" "Premio" "Fec.Proc." "Nro.Poliza" "Nro.Cert."
    "Observaciones" ""
  )

  txt_row="$(join_semicolon_row "${txt_fields[@]}");"
  csv_row="$(join_semicolon_row "${csv_fields[@]}")"
  txt_content="${txt_row}"$'\n'
  csv_content="$(join_semicolon_row "${csv_headers[@]}")"$'\n'"${csv_row}"$'\n'
  txt_base64=$(printf '%s' "$txt_content" | base64 | tr -d '\n')
  csv_base64=$(printf '%s' "$csv_content" | base64 | tr -d '\n')

  nombre="$(escaped_or_no_info "$raw_nombre")"
  dni="$(escaped_or_no_info "$(json_get '.dni')")"
  fecha_nacimiento="$(escaped_or_no_info "$(json_get '.fechaNacimiento')")"
  email_addr="$(escaped_or_no_info "$(json_get '.email')")"
  telefono="$(escaped_or_no_info "$(json_get '.telefono // .phone')")"

  echo "Generando adjuntos de produccion para bolso..."

  echo "========================================="
  echo "PASO A: Creando borrador (CreateItem)..."
  echo "========================================="

  soap_create="<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:m=\"http://schemas.microsoft.com/exchange/services/2006/messages\" xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
  <soap:Header><t:RequestServerVersion Version=\"Exchange2013\" /></soap:Header>
  <soap:Body>
    <m:CreateItem MessageDisposition=\"SaveOnly\">
      <m:SavedItemFolderId><t:DistinguishedFolderId Id=\"drafts\" /></m:SavedItemFolderId>
      <m:Items>
        <t:Message>
          <t:Subject>Pas: Dileo Antonela Venta: bolso</t:Subject>
          <t:Body BodyType=\"HTML\"><![CDATA[
            <div style=\"font-family: Arial, sans-serif;\">
              <h2>Nueva Emision de Cobertura</h2>
              <ul>
                <li><strong>Nombre:</strong> ${nombre}</li>
                <li><strong>DNI:</strong> ${dni}</li>
                <li><strong>Fecha de nacimiento:</strong> ${fecha_nacimiento}</li>
                <li><strong>Email:</strong> ${email_addr}</li>
                <li><strong>Telefono:</strong> ${telefono}</li>
              </ul>
            </div>
          ]]></t:Body>
          <t:ToRecipients><t:Mailbox><t:EmailAddress>${DESTINATARIO_MAIL}</t:EmailAddress></t:Mailbox></t:ToRecipients>
        </t:Message>
      </m:Items>
    </m:CreateItem>
  </soap:Body>
</soap:Envelope>"

  res_create=$(curl -k --ntlm -u "$EXCHANGE_USER:$EXCHANGE_PASS" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://schemas.microsoft.com/exchange/services/2006/messages/CreateItem\"" -d "$soap_create" "$URL_EWS")

  item_id=$(echo "$res_create" | grep -oP 'Id="[^"]+"' | head -n 1 | sed 's/Id="//;s/"//')
  change_key=$(echo "$res_create" | grep -oP 'ChangeKey="[^"]+"' | head -n 1 | sed 's/ChangeKey="//;s/"//')

  if [ -z "$item_id" ]; then
    echo "Error critico: No se pudo obtener el ItemId de Exchange corporativo."
    echo "Respuesta del servidor:"
    echo "$res_create"
    exit 1
  fi
  echo "Borrador creado con exito."

  echo "========================================="
  echo "PASO B: Subiendo archivo adjunto (CreateAttachment)..."
  echo "========================================="

  soap_attach="<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:m=\"http://schemas.microsoft.com/exchange/services/2006/messages\" xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
  <soap:Header><t:RequestServerVersion Version=\"Exchange2013\" /></soap:Header>
  <soap:Body>
    <m:CreateAttachment>
      <m:ParentItemId Id=\"$item_id\" ChangeKey=\"$change_key\" />
      <m:Attachments>
        <t:FileAttachment>
          <t:Name>ARCHIVO DE ENVIO.txt</t:Name>
          <t:Content>$txt_base64</t:Content>
        </t:FileAttachment>
        <t:FileAttachment>
          <t:Name>ARCHIVO DE SALIDA.csv</t:Name>
          <t:Content>$csv_base64</t:Content>
        </t:FileAttachment>
      </m:Attachments>
    </m:CreateAttachment>
  </soap:Body>
</soap:Envelope>"

  res_attach=$(curl -k --ntlm -u "$EXCHANGE_USER:$EXCHANGE_PASS" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://schemas.microsoft.com/exchange/services/2006/messages/CreateAttachment\"" -d "$soap_attach" "$URL_EWS")

  new_change_key=$(echo "$res_attach" | grep -oP 'RootItemChangeKey="[^"]+"' | head -n 1 | sed 's/RootItemChangeKey="//;s/"//')

  if [ -z "$new_change_key" ]; then
    new_change_key="$change_key"
  fi
  echo "Archivo adjunto inyectado correctamente."

  echo "========================================="
  echo "PASO C: Despachando mail final (SendItem)..."
  echo "========================================="

  soap_send="<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:m=\"http://schemas.microsoft.com/exchange/services/2006/messages\" xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
  <soap:Header><t:RequestServerVersion Version=\"Exchange2013\" /></soap:Header>
  <soap:Body>
    <m:SendItem SaveItemToFolder=\"true\">
      <m:ItemIds>
        <t:ItemId Id=\"$item_id\" ChangeKey=\"$new_change_key\" />
      </m:ItemIds>
    </m:SendItem>
  </soap:Body>
</soap:Envelope>"

  res_send=$(curl -k --ntlm -u "$EXCHANGE_USER:$EXCHANGE_PASS" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://schemas.microsoft.com/exchange/services/2006/messages/SendItem\"" -d "$soap_send" "$URL_EWS")

  if echo "$res_send" | grep -q "NoError"; then
    echo "EXITO TOTAL: el mail con el archivo adjunto se envio a traves de Exchange NTLM."
  else
    echo "Error en el Paso C final:"
    echo "$res_send"
    exit 1
  fi
}

send_baja() {
  local request_id requested_at first_name_raw last_name_raw full_name_raw first_name last_name full_name dni email_addr area phone reason
  local text_body body_html soap_create res_create item_id change_key soap_send res_send

  request_id="$(json_get '.requestId')"
  if [ -z "$request_id" ]; then
    request_id="BAJA-$(date +%Y%m%d%H%M%S)-$RANDOM"
  fi

  requested_at="$(json_get '.requestedAt')"
  if [ -z "$requested_at" ]; then
    requested_at="$(TZ="$TZ_BSAS" date '+%d/%m/%Y %H:%M:%S')"
  fi

  first_name_raw="$(json_get '.firstName // .nombre')"
  last_name_raw="$(json_get '.lastName // .apellido')"
  full_name_raw="$(json_get '.fullName')"
  if [ -z "$full_name_raw" ]; then
    full_name_raw="${first_name_raw} ${last_name_raw}"
  fi
  first_name="$(escaped_or_no_info "$first_name_raw")"
  last_name="$(escaped_or_no_info "$last_name_raw")"
  full_name="$(escaped_or_no_info "$full_name_raw")"
  dni="$(escaped_or_no_info "$(json_get '.dni')")"
  email_addr="$(escaped_or_no_info "$(json_get '.email')")"
  area="$(escaped_or_no_info "$(json_get '.area')")"
  phone="$(escaped_or_no_info "$(json_get '.phone // .telefono')")"
  reason="$(escaped_or_no_info "$(json_get '.reason // .observations // .motivo')")"

  text_body="$(cat <<EOF
Solicitud de baja
Identificador interno: ${request_id}
Fecha de recepcion: ${requested_at}

Datos del solicitante
- Nombre: ${first_name}
- Apellido: ${last_name}
- Nombre completo: ${full_name}
- DNI: ${dni}
- Email: ${email_addr}
- Area: ${area}
- Telefono: ${phone}

Motivo / observaciones: ${reason}
EOF
)"

  body_html="$(cat <<EOF
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
  <h2 style="margin: 0 0 16px; color: #7a123c;">Solicitud de baja</h2>
  <p style="margin: 0 0 12px;"><strong>Identificador interno:</strong> ${request_id}</p>
  <p style="margin: 0 0 18px;"><strong>Fecha de recepcion:</strong> ${requested_at}</p>

  <h3 style="margin: 0 0 10px; color: #7a123c;">Datos del solicitante</h3>
  <ul style="margin: 0 0 18px 20px; padding: 0;">
    <li><strong>Nombre:</strong> ${first_name}</li>
    <li><strong>Apellido:</strong> ${last_name}</li>
    <li><strong>Nombre completo:</strong> ${full_name}</li>
    <li><strong>DNI:</strong> ${dni}</li>
    <li><strong>Email:</strong> ${email_addr}</li>
    <li><strong>Area:</strong> ${area}</li>
    <li><strong>Telefono:</strong> ${phone}</li>
  </ul>

  <p style="margin: 0;"><strong>Motivo / observaciones:</strong> ${reason}</p>
</div>
EOF
)"

  soap_create="<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:m=\"http://schemas.microsoft.com/exchange/services/2006/messages\" xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
  <soap:Header><t:RequestServerVersion Version=\"Exchange2013\" /></soap:Header>
  <soap:Body>
    <m:CreateItem MessageDisposition=\"SaveOnly\">
      <m:SavedItemFolderId><t:DistinguishedFolderId Id=\"drafts\" /></m:SavedItemFolderId>
      <m:Items>
        <t:Message>
          <t:Subject>Pas: Dileo Antonela Baja: seguro</t:Subject>
          <t:Body BodyType=\"HTML\"><![CDATA[${body_html}]]></t:Body>
          <t:ToRecipients><t:Mailbox><t:EmailAddress>${DESTINATARIO_MAIL}</t:EmailAddress></t:Mailbox></t:ToRecipients>
        </t:Message>
      </m:Items>
    </m:CreateItem>
  </soap:Body>
</soap:Envelope>"

  res_create=$(curl -k --ntlm -u "$EXCHANGE_USER:$EXCHANGE_PASS" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://schemas.microsoft.com/exchange/services/2006/messages/CreateItem\"" -d "$soap_create" "$URL_EWS")

  item_id=$(echo "$res_create" | grep -oP 'Id="[^"]+"' | head -n 1 | sed 's/Id="//;s/"//')
  change_key=$(echo "$res_create" | grep -oP 'ChangeKey="[^"]+"' | head -n 1 | sed 's/ChangeKey="//;s/"//')

  if [ -z "$item_id" ]; then
    echo "Error critico: No se pudo obtener el ItemId de Exchange corporativo."
    echo "Respuesta del servidor:"
    echo "$res_create"
    exit 1
  fi

  soap_send="<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:m=\"http://schemas.microsoft.com/exchange/services/2006/messages\" xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
  <soap:Header><t:RequestServerVersion Version=\"Exchange2013\" /></soap:Header>
  <soap:Body>
    <m:SendItem SaveItemToFolder=\"true\">
      <m:ItemIds>
        <t:ItemId Id=\"$item_id\" ChangeKey=\"$change_key\" />
      </m:ItemIds>
    </m:SendItem>
  </soap:Body>
</soap:Envelope>"

  res_send=$(curl -k --ntlm -u "$EXCHANGE_USER:$EXCHANGE_PASS" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://schemas.microsoft.com/exchange/services/2006/messages/SendItem\"" -d "$soap_send" "$URL_EWS")

  if echo "$res_send" | grep -q "NoError"; then
    echo "EXITO TOTAL: la solicitud de baja fue enviada a traves de Exchange NTLM."
  else
    echo "Error en el envio final de baja:"
    echo "$res_send"
    exit 1
  fi
}

if [ -z "${EXCHANGE_USER:-}" ] || [ -z "${EXCHANGE_PASS:-}" ] || [ -z "${DESTINATARIO_MAIL:-}" ]; then
  echo "Faltan variables de entorno obligatorias."
  exit 1
fi

load_payload

producto="$(json_get '.producto // .product // .tipo')"
producto="${producto:-bolso}"

if [ "$producto" = "bici" ]; then
  send_bici
elif [ "$producto" = "baja" ]; then
  send_baja
else
  send_bolso
fi
