export function generateId() {
  const cryptoApi = globalThis.crypto
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function normalizeLink(link) {
  const cleanedLink = link?.trim()
  if (!cleanedLink) {
    return ''
  }

  return cleanedLink.match(/^https?:\/\//i) ? cleanedLink : `https://${cleanedLink}`
}
