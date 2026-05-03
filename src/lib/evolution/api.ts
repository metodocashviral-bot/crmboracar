interface EvolutionConfig {
  url: string
  apiKey: string
  instance: string
}

async function evolutionFetch(
  path: string,
  config: { url: string; apiKey: string },
  options: RequestInit = {}
) {
  const res = await fetch(`${config.url}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: config.apiKey,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution API error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function createInstance(
  instanceName: string,
  config: { url: string; apiKey: string }
) {
  return evolutionFetch('/instance/create', config, {
    method: 'POST',
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    }),
  })
}

export async function getQRCode(cfg: EvolutionConfig) {
  return evolutionFetch(`/instance/connect/${cfg.instance}`, cfg)
}

export async function getConnectionState(cfg: EvolutionConfig) {
  return evolutionFetch(`/instance/connectionState/${cfg.instance}`, cfg)
}

export async function setWebhook(cfg: EvolutionConfig, webhookUrl: string) {
  return evolutionFetch(`/webhook/set/${cfg.instance}`, cfg, {
    method: 'POST',
    body: JSON.stringify({
      url: webhookUrl,
      webhook_by_events: false,
      events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
    }),
  })
}

export async function sendTextMessage(
  phone: string,
  text: string,
  cfg: EvolutionConfig
) {
  return evolutionFetch(`/message/sendText/${cfg.instance}`, cfg, {
    method: 'POST',
    body: JSON.stringify({ number: phone, text }),
  })
}

export async function deleteInstance(cfg: EvolutionConfig) {
  return evolutionFetch(`/instance/delete/${cfg.instance}`, cfg, {
    method: 'DELETE',
  })
}

export async function fetchInstance(cfg: EvolutionConfig) {
  return evolutionFetch(`/instance/fetchInstances?instanceName=${cfg.instance}`, cfg)
}

export async function fetchChats(cfg: EvolutionConfig) {
  return evolutionFetch(`/chat/findChats/${cfg.instance}`, cfg, { method: 'POST', body: JSON.stringify({}) })
}

export async function fetchChatMessages(cfg: EvolutionConfig, remoteJid: string, limit = 30) {
  return evolutionFetch(`/chat/findMessages/${cfg.instance}`, cfg, {
    method: 'POST',
    body: JSON.stringify({ where: { key: { remoteJid } }, limit }),
  })
}
