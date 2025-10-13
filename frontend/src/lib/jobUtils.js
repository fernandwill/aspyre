/**
 * Ensure a job link has a protocol and return an empty string when missing.
 */
export function normalizeLink(link) {
  const cleanedLink = link?.trim()
  if (!cleanedLink) {
    return ''
  }

  return cleanedLink.match(/^https?:\/\//i) ? cleanedLink : `https://${cleanedLink}`
}

/**
 * Trim job field values and normalize the link for consistent storage.
 */
export function sanitizeJobFields(job = {}) {
  return {
    title: (job.title ?? '').trim(),
    company: (job.company ?? '').trim(),
    location: (job.location ?? '').trim(),
    notes: (job.notes ?? '').trim(),
    link: normalizeLink(job.link ?? ''),
  }
}
