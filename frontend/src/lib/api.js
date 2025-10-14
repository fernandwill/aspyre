const defaultApiUrl = (() => {
  if (typeof window === 'undefined') {
    return ''
  }

  const {protocol, hostname} = window.location

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:8000/api`
  }

  return ''
})()

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || defaultApiUrl).replace(/\/$/, '')

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  }

  let response

  try {
    response = await fetch(url, fetchOptions)
  } catch (error) {
    const networkError = new Error('Unable to reach the server')
    networkError.cause = error
    networkError.status = 0
    networkError.body = null
    throw networkError
  }

  let payload = null
  const contentType = response.headers.get('content-type') || ''
  if (response.status !== 204 && contentType.includes('application/json')) {
    payload = await response.json()
  }

  if (!response.ok) {
    const error = new Error(payload?.message || 'Request failed')
    error.status = response.status
    error.body = payload
    throw error
  }

  return payload
}

export function listJobApplications() {
  return request('/job-applications')
}

export function createJobApplication(job) {
  return request('/job-applications', {
    method: 'POST',
    body: job,
  })
}

export function updateJobApplication(jobId, updates) {
  return request(`/job-applications/${jobId}`, {
    method: 'PUT',
    body: updates,
  })
}

export function updateJobStatus(jobId, status) {
  return request(`/job-applications/${jobId}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export function deleteJobApplication(jobId) {
  return request(`/job-applications/${jobId}`, {
    method: 'DELETE',
  })
}
