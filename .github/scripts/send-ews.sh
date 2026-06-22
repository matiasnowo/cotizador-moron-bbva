#!/usr/bin/env bash
set -euo pipefail

URL_EWS="https://mail.centroatencionmoron.com/EWS/Exchange.asmx"
TZ_BSAS="America/Argentina/Buenos_Aires"

json_get() {
  jq -r "$1 // empty" <<< "${PAYLOAD_JSON:-{}}" | tr -d '\r'
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
- Anio: ${year}
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
    <li><strong>Anio:</strong> ${year}</li>
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
  local txt_content txt_base64 soap_create res_create item_id change_key soap_attach res_attach new_change_key soap_send res_send

  echo "Generando contenido del adjunto..."
  txt_content="Hola Mundo de prueba desde GitHub Actions para el Municipio de Moron."
  txt_base64=$(echo -n "$txt_content" | base64 | tr -d '\n')

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
                <li><strong>Nombre:</strong> ${NOM}</li>
                <li><strong>DNI:</strong> ${DNI}</li>
                <li><strong>Fecha de nacimiento:</strong> ${FNAC}</li>
                <li><strong>Email:</strong> ${EMAIL}</li>
                <li><strong>Telefono:</strong> ${TEL}</li>
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
          <t:Name>solicitud-moron.txt</t:Name>
          <t:Content>$txt_base64</t:Content>
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

producto="$(json_get '.producto // .product // .tipo')"
producto="${producto:-bolso}"

if [ "$producto" = "bici" ]; then
  send_bici
elif [ "$producto" = "baja" ]; then
  send_baja
else
  send_bolso
fi
