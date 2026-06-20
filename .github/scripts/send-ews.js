const axios = require('axios');
const https = require('https');

const EWS_URL = 'https://mail.centroatencionmoron.com/EWS/Exchange.asmx';
const EXCHANGE_VERSION = 'Exchange2013';
const ATTACHMENT_NAME = 'solicitud-moron.txt';
const ATTACHMENT_CONTENT =
  'Hola Mundo de prueba desde GitHub Actions para el Municipio de Moron.';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }

  return value;
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseClientPayload() {
  const rawPayload = process.env.CLIENT_PAYLOAD;

  if (!rawPayload) {
    throw new Error('No se recibio CLIENT_PAYLOAD desde repository_dispatch.');
  }

  const payload = JSON.parse(rawPayload);

  return {
    nombre: payload.nombre || '',
    dni: payload.dni || '',
    fechaNacimiento: payload.fechaNacimiento || '',
    email: payload.email || '',
    telefono: payload.telefono || '',
  };
}

function buildAuthHeader(user, pass) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

async function callEws(action, xml, authHeader) {
  const response = await axios.post(EWS_URL, xml, {
    httpsAgent,
    timeout: 30000,
    validateStatus: () => true,
    headers: {
      Authorization: authHeader,
      Accept: 'text/xml',
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `http://schemas.microsoft.com/exchange/services/2006/messages/${action}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(
      `${action} respondio HTTP ${response.status}: ${String(response.data).slice(0, 1000)}`,
    );
  }

  const body = String(response.data);

  if (!body.includes('<m:ResponseCode>NoError</m:ResponseCode>')) {
    const responseCodeMatch = body.match(/<m:ResponseCode>([^<]+)<\/m:ResponseCode>/);
    const messageTextMatch = body.match(/<m:MessageText>([\s\S]*?)<\/m:MessageText>/);
    const responseCode = responseCodeMatch ? responseCodeMatch[1] : 'UnknownError';
    const messageText = messageTextMatch ? messageTextMatch[1].trim() : body.slice(0, 1000);

    throw new Error(`${action} fallo con ${responseCode}: ${messageText}`);
  }

  return body;
}

function extractDraftIdentifiers(xml) {
  const itemIdMatch = xml.match(/<t:ItemId Id="([^"]+)" ChangeKey="([^"]+)"/);

  if (!itemIdMatch) {
    throw new Error('No se pudo extraer ItemId y ChangeKey del CreateItem.');
  }

  return {
    itemId: itemIdMatch[1],
    changeKey: itemIdMatch[2],
  };
}

function extractAttachmentIdentifiers(xml, fallbackItemId) {
  const rootMatch = xml.match(/<m:RootItemId[^>]*RootItemId="([^"]+)"[^>]*RootItemChangeKey="([^"]+)"/);

  if (!rootMatch) {
    throw new Error('No se pudo extraer RootItemId y RootItemChangeKey del CreateAttachment.');
  }

  return {
    itemId: rootMatch[1] || fallbackItemId,
    changeKey: rootMatch[2],
  };
}

function buildCreateItemXml(destinatario, datos) {
  const subject = `Nueva Emision de Cobertura - Solicitante: ${datos.nombre || 'Sin nombre'}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
      <h2>Nueva Emision de Cobertura</h2>
      <p>Se recibio una nueva solicitud desde el formulario web del Municipio de Moron.</p>
      <ul>
        <li><strong>Nombre:</strong> ${escapeXml(datos.nombre)}</li>
        <li><strong>DNI:</strong> ${escapeXml(datos.dni)}</li>
        <li><strong>Fecha de nacimiento:</strong> ${escapeXml(datos.fechaNacimiento)}</li>
        <li><strong>Email:</strong> ${escapeXml(datos.email)}</li>
        <li><strong>Telefono:</strong> ${escapeXml(datos.telefono)}</li>
      </ul>
    </div>
  `.trim();

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages"
  xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <t:RequestServerVersion Version="${EXCHANGE_VERSION}" />
  </soap:Header>
  <soap:Body>
    <m:CreateItem MessageDisposition="SaveOnly">
      <m:SavedItemFolderId>
        <t:DistinguishedFolderId Id="drafts" />
      </m:SavedItemFolderId>
      <m:Items>
        <t:Message>
          <t:Subject>${escapeXml(subject)}</t:Subject>
          <t:Body BodyType="HTML">${escapeXml(htmlBody)}</t:Body>
          <t:ToRecipients>
            <t:Mailbox>
              <t:EmailAddress>${escapeXml(destinatario)}</t:EmailAddress>
            </t:Mailbox>
          </t:ToRecipients>
        </t:Message>
      </m:Items>
    </m:CreateItem>
  </soap:Body>
</soap:Envelope>`;
}

function buildCreateAttachmentXml(itemId, changeKey, contentBase64) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages"
  xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <t:RequestServerVersion Version="${EXCHANGE_VERSION}" />
  </soap:Header>
  <soap:Body>
    <m:CreateAttachment>
      <m:ParentItemId Id="${escapeXml(itemId)}" ChangeKey="${escapeXml(changeKey)}" />
      <m:Attachments>
        <t:FileAttachment>
          <t:Name>${ATTACHMENT_NAME}</t:Name>
          <t:IsInline>false</t:IsInline>
          <t:IsContactPhoto>false</t:IsContactPhoto>
          <t:Content>${contentBase64}</t:Content>
        </t:FileAttachment>
      </m:Attachments>
    </m:CreateAttachment>
  </soap:Body>
</soap:Envelope>`;
}

function buildSendItemXml(itemId, changeKey) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages"
  xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <t:RequestServerVersion Version="${EXCHANGE_VERSION}" />
  </soap:Header>
  <soap:Body>
    <m:SendItem SaveItemToFolder="true">
      <m:ItemIds>
        <t:ItemId Id="${escapeXml(itemId)}" ChangeKey="${escapeXml(changeKey)}" />
      </m:ItemIds>
    </m:SendItem>
  </soap:Body>
</soap:Envelope>`;
}

async function main() {
  const exchangeUser = getRequiredEnv('EXCHANGE_USER');
  const exchangePass = getRequiredEnv('EXCHANGE_PASS');
  const destinatarioMail = getRequiredEnv('DESTINATARIO_MAIL');
  const payload = parseClientPayload();
  const authHeader = buildAuthHeader(exchangeUser, exchangePass);

  console.log('Paso A: creando borrador en Exchange...');
  const createItemXml = buildCreateItemXml(destinatarioMail, payload);
  const createItemResponse = await callEws('CreateItem', createItemXml, authHeader);
  const draft = extractDraftIdentifiers(createItemResponse);

  console.log('Paso B: adjuntando archivo TXT...');
  const attachmentBase64 = Buffer.from(ATTACHMENT_CONTENT, 'utf8').toString('base64');
  const createAttachmentXml = buildCreateAttachmentXml(
    draft.itemId,
    draft.changeKey,
    attachmentBase64,
  );
  const createAttachmentResponse = await callEws(
    'CreateAttachment',
    createAttachmentXml,
    authHeader,
  );
  const updatedDraft = extractAttachmentIdentifiers(createAttachmentResponse, draft.itemId);

  console.log('Paso C: enviando mail final...');
  const sendItemXml = buildSendItemXml(updatedDraft.itemId, updatedDraft.changeKey);
  await callEws('SendItem', sendItemXml, authHeader);

  console.log('Correo enviado correctamente a traves de EWS.');
}

main().catch((error) => {
  console.error('Fallo el envio EWS:', error.message);
  process.exit(1);
});
