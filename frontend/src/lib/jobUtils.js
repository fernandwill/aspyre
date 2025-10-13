export function normalizeLink(link) {
  const cleanedLink = link?.trim()
  if (!cleanedLink) {
    return ''
  }

  return cleanedLink.match(/^https?:\/\//i) ? cleanedLink : `https://${cleanedLink}`
}

export function sanitizeJobFields(job = {}) {
  return {
    title: (job.title ?? '').trim(),
    company: (job.company ?? '').trim(),
    location: (job.location ?? '').trim(),
    notes: (job.notes ?? '').trim(),
    link: normalizeLink(job.link ?? ''),
  }
}
