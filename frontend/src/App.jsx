import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import aspyreLogo from './assets/aspyre-icon.svg'

const STATUSES = [
  'Applied',
  'Online Assessment',
  'Interview',
  'Accepted',
  'Rejected',
]

const MAIN_STATUSES = STATUSES.slice(0, 3)
const OUTCOME_STATUSES = STATUSES.slice(3)

const INITIAL_JOBS = [
  {
    id: '1',
    title: 'Frontend Engineer',
    company: 'Aspyre',
    location: 'Remote · North America',
    link: 'https://jobs.lever.co/example/frontend-engineer',
    status: 'Applied',
    notes: 'Reached out to recruiter on LinkedIn. Waiting for response.',
    lastUpdate: '2 days ago',
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Bright Labs',
    location: 'Amsterdam, NL',
    link: 'https://boards.greenhouse.io/example/product-designer',
    status: 'Interview',
    notes: 'Second round scheduled next Tuesday.',
    lastUpdate: '5 hours ago',
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'Vector Analytics',
    location: 'Berlin, DE',
    link: 'https://jobs.example.com/vector-analytics/data-scientist',
    status: 'Online Assessment',
    notes: 'Assessment submitted, awaiting feedback.',
    lastUpdate: '1 day ago',
  },
]

function generateId() {
  const cryptoApi = globalThis.crypto
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function titleCase(value) {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function inferJobFromUrl(url) {
  try {
    const parsedUrl = new URL(url)
    const host = parsedUrl.hostname.replace(/^www\./, '')
    const companySegment = host.split('.')[0]
    const company = titleCase(companySegment)

    const pathSegments = parsedUrl.pathname
      .split('/')
      .filter(Boolean)
      .slice(-1)

    const slug = pathSegments[0] || 'New Opportunity'
    const title = titleCase(slug)

    return {
      title: title || 'New Opportunity',
      company: company || 'Unknown Company',
      location: 'Location TBD',
    }
  } catch (error) {
    return {
      title: 'New Opportunity',
      company: 'Unknown Company',
      location: 'Location TBD',
    }
  }
}

function App() {
  const [jobs, setJobs] = useState(INITIAL_JOBS)
  const [linkInput, setLinkInput] = useState('')
  const [manualJob, setManualJob] = useState({
    title: '',
    company: '',
    location: '',
    link: '',
    notes: '',
  })

  const [draggedJobId, setDraggedJobId] = useState(null)
  const [activeDropStatus, setActiveDropStatus] = useState(null)

  useEffect(() => {
    function handleMessage(event) {
      if (!event?.data || event.data.type !== 'update-job') {
        return
      }

      if (event.origin && event.origin !== 'null' && event.origin !== window.location.origin) {
        return
      }

      const updatedJob = event.data.payload ?? {}
      if (!updatedJob.id) {
        return
      }

      setJobs((previous) =>
        previous.map((job) => {
          if (job.id !== updatedJob.id) {
            return job
          }

          const normalizedLink = normalizeLink(updatedJob.link ?? '')
          const sanitizedStatus = STATUSES.includes(updatedJob.status) ? updatedJob.status : job.status

          return {
            ...job,
            title: updatedJob.title?.trim() || job.title,
            company: updatedJob.company?.trim() || job.company,
            location: updatedJob.location?.trim() || job.location,
            link: normalizedLink,
            notes: updatedJob.notes?.trim() ?? '',
            status: sanitizedStatus,
            lastUpdate: 'Just now',
          }
        })
      )
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const jobsByStatus = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = jobs.filter((job) => job.status === status)
      return acc
    }, {})
  }, [jobs])

  const renderColumn = (status) => {
    return (
      <div
        className={`board-column ${activeDropStatus === status ? 'board-column--active' : ''}`}
        key={status}
        onDragOver={handleDragOver}
        onDrop={(event) => handleDrop(event, status)}
        onDragEnter={() => handleDragEnter(status)}
        onDragLeave={(event) => handleDragLeave(event, status)}
      >
        <header className="column-header">
          <div>
            <h3>{status}</h3>
            <span className="column-count">{jobsByStatus[status]?.length ?? 0} jobs</span>
          </div>
        </header>
        <div className="column-content">
          {(jobsByStatus[status] ?? []).map((job) => (
            <article
              className={`job-card ${draggedJobId === job.id ? 'job-card--dragging' : ''}`}
              draggable
              key={job.id}
              onDragStart={(event) => handleDragStart(event, job.id)}
              onDragEnd={handleDragEnd}
            >
              <button
                type="button"
                className="job-card__edit-icon"
                aria-label={`Edit ${job.title}`}
                onClick={() => handleEditJob(job)}
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path
                    d="M16.862 3.487a1.75 1.75 0 0 1 2.476 2.476l-9.62 9.62a3 3 0 0 1-1.36.773l-3.17.793a.75.75 0 0 1-.908-.908l.793-3.17a3 3 0 0 1 .773-1.36l9.62-9.62Z"
                    fill="currentColor"
                  />
                  <path
                    d="M5.25 19.5h13.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <header className="job-card__header">
                <div className="job-card__heading">
                  {job.link ? (
                    <a className="job-card__title" href={job.link} target="_blank" rel="noreferrer">
                      {job.title}
                    </a>
                  ) : (
                    <span className="job-card__title job-card__title--static">{job.title}</span>
                  )}
                  {job.company && <span className="job-card__company">{job.company}</span>}
                  {job.location && <span className="job-card__location">{job.location}</span>}
                </div>
              </header>
              {job.notes && <p className="job-card__notes">{job.notes}</p>}
              <footer className="job-card__footer">
                <span className="updated">Updated {job.lastUpdate}</span>
              </footer>
            </article>
          ))}
          {(jobsByStatus[status] ?? []).length === 0 && (
            <div className="empty-state">
              <p>No jobs here yet.</p>
              <span>Move a card or add a new opportunity.</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  function normalizeLink(link) {
    const cleanedLink = link?.trim()
    if (!cleanedLink) {
      return ''
    }

    return cleanedLink.match(/^https?:\/\//i) ? cleanedLink : `https://${cleanedLink}`
  }

  function handleEditJob(job) {
    const editWindow = window.open('', '', 'width=480,height=640')
    if (!editWindow) {
      return
    }

    const jobData = {
      id: job.id,
      title: job.title ?? '',
      company: job.company ?? '',
      location: job.location ?? '',
      status: job.status ?? STATUSES[0],
      link: job.link ?? '',
      notes: job.notes ?? '',
    }

    const serializedJobData = JSON.stringify(jobData).replace(/</g, '\\u003c')

    const statusOptions = STATUSES.map(
      (status) => `<option value="${status}">${status}</option>`
    ).join('')

    const formHtml = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Edit Job</title>
          <style>
            body {
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #f7f7fb;
              color: #111827;
            }
            .wrapper {
              max-width: 560px;
              margin: 0 auto;
              padding: 24px 20px 32px;
            }
            h1 {
              margin: 0 0 20px;
              font-size: 24px;
            }
            form {
              display: grid;
              gap: 16px;
            }
            label {
              display: flex;
              flex-direction: column;
              font-size: 14px;
              gap: 6px;
              color: #374151;
            }
            input,
            select,
            textarea {
              font: inherit;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 10px 12px;
              background-color: #fff;
              transition: border 0.2s ease, box-shadow 0.2s ease;
            }
            input:focus,
            select:focus,
            textarea:focus {
              outline: none;
              border-color: #6366f1;
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
            }
            textarea {
              min-height: 120px;
              resize: vertical;
            }
            .actions {
              display: flex;
              gap: 12px;
              justify-content: flex-end;
              margin-top: 8px;
            }
            button {
              font: inherit;
              padding: 10px 18px;
              border-radius: 999px;
              border: none;
              cursor: pointer;
              transition: transform 0.1s ease, box-shadow 0.1s ease;
            }
            button:focus-visible {
              outline: 2px solid #6366f1;
              outline-offset: 2px;
            }
            .button-primary {
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              color: #fff;
              box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
            }
            .button-primary:hover {
              transform: translateY(-1px);
            }
            .button-secondary {
              background: #e5e7eb;
              color: #374151;
            }
            .button-secondary:hover {
              transform: translateY(-1px);
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <h1>Edit job posting</h1>
            <form id="edit-job-form">
              <label for="edit-title">Job title
                <input id="edit-title" name="title" type="text" required />
              </label>
              <label for="edit-company">Company
                <input id="edit-company" name="company" type="text" required />
              </label>
              <label for="edit-location">Location
                <input id="edit-location" name="location" type="text" />
              </label>
              <label for="edit-status">Status
                <select id="edit-status" name="status" required>
                  ${statusOptions}
                </select>
              </label>
              <label for="edit-link">Job link
                <input id="edit-link" name="link" type="url" placeholder="https://" />
              </label>
              <label for="edit-notes">Notes
                <textarea id="edit-notes" name="notes" placeholder="Interview prep, reminders..."></textarea>
              </label>
              <div class="actions">
                <button type="button" class="button-secondary" id="cancel-edit">Cancel</button>
                <button type="submit" class="button-primary">Save changes</button>
              </div>
            </form>
          </div>
          <script>
            const jobData = ${serializedJobData}

            const form = document.getElementById('edit-job-form')
            const titleInput = document.getElementById('edit-title')
            const companyInput = document.getElementById('edit-company')
            const locationInput = document.getElementById('edit-location')
            const statusSelect = document.getElementById('edit-status')
            const linkInput = document.getElementById('edit-link')
            const notesInput = document.getElementById('edit-notes')

            titleInput.value = jobData.title || ''
            companyInput.value = jobData.company || ''
            locationInput.value = jobData.location || ''
            statusSelect.value = jobData.status || '${STATUSES[0]}'
            linkInput.value = jobData.link || ''
            notesInput.value = jobData.notes || ''

            document.getElementById('cancel-edit').addEventListener('click', () => {
              window.close()
            })

            form.addEventListener('submit', (event) => {
              event.preventDefault()

              const formData = new FormData(form)
              const payload = {
                id: jobData.id,
                title: formData.get('title') || '',
                company: formData.get('company') || '',
                location: formData.get('location') || '',
                status: formData.get('status') || '${STATUSES[0]}',
                link: formData.get('link') || '',
                notes: formData.get('notes') || '',
              }

              if (window.opener) {
                window.opener.postMessage({ type: 'update-job', payload }, '*')
              }

              window.close()
            })
          </script>
        </body>
      </html>`

    editWindow.document.write(formHtml)
    editWindow.document.close()
    editWindow.focus()
  }

  function handleTrackJob(event) {
    event.preventDefault()
    if (!linkInput.trim()) return

    const normalizedLink = normalizeLink(linkInput)

    const inferred = inferJobFromUrl(normalizedLink)
    const newJob = {
      id: generateId(),
      status: 'Applied',
      notes: 'Added from URL input.',
      lastUpdate: 'Just now',
      link: normalizedLink,
      ...inferred,
    }

    setJobs((previous) => [newJob, ...previous])
    setLinkInput('')
  }

  function handleManualSubmit(event) {
    event.preventDefault()
    if (!manualJob.title.trim() || !manualJob.company.trim()) {
      return
    }

    const normalizedLink = normalizeLink(manualJob.link)

    const newJob = {
      id: generateId(),
      status: 'Applied',
      notes: manualJob.notes?.trim() || 'Added manually.',
      lastUpdate: 'Just now',
      title: manualJob.title.trim(),
      company: manualJob.company.trim(),
      location: manualJob.location.trim(),
      link: normalizedLink,
    }

    setJobs((previous) => [newJob, ...previous])
    setManualJob({ title: '', company: '', location: '', link: '', notes: '' })
  }

  function updateJobStatus(id, status) {
    setJobs((previous) =>
      previous.map((job) => (job.id === id ? { ...job, status, lastUpdate: 'Just now' } : job))
    )
  }

  function handleDragStart(event, jobId) {
    setDraggedJobId(jobId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', jobId)
  }

  function handleDragEnd() {
    setDraggedJobId(null)
    setActiveDropStatus(null)
  }

  function handleDragEnter(status) {
    setActiveDropStatus(status)
  }

  function handleDragLeave(event, status) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return
    }

    if (activeDropStatus === status) {
      setActiveDropStatus(null)
    }
  }

  function handleDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(event, status) {
    event.preventDefault()
    const jobId = draggedJobId ?? event.dataTransfer.getData('text/plain')
    setActiveDropStatus(null)

    if (!jobId) {
      return
    }

    setDraggedJobId(null)

    const job = jobs.find((item) => item.id === jobId)
    if (!job || job.status === status) {
      return
    }

    updateJobStatus(jobId, status)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <img src={aspyreLogo} alt="Aspyre logo" />
          </div>
        </div>
        <div className="header-actions">
          <Button type="button" variant="ghost" size="sm" className="header-link">
            Analytics
          </Button>
          <Button type="button" variant="ghost" size="sm" className="header-link">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="app-main">
        <section className="ingest-panel">
          <div className="ingest-header">
            <h1>Track and manage job applications automatically</h1>
            <p>
              Paste any job link and we will create a card with the essentials. Update the status as you
              progress through your interview process.
            </p>
          </div>
          <form className="link-form" onSubmit={handleTrackJob}>
            <label className="sr-only" htmlFor="job-link">
              Job URL
            </label>
            <input
              id="job-link"
              className="link-input"
              placeholder="Paste any job link here..."
              value={linkInput}
              onChange={(event) => setLinkInput(event.target.value)}
            />
            <button className="primary-button" type="submit">
              Track Job
            </button>
          </form>
          <div className="ingest-hint">
            <span className="hint-pill">URL Parser</span>
            <span>
              Works with popular boards like LinkedIn, Greenhouse, Lever, and more. We auto-fill the title and
              company details.
            </span>
          </div>
        </section>

        <section className="manual-panel">
          <form className="manual-form" onSubmit={handleManualSubmit}>
            <div className="manual-form__header">
              <h2>Add a job manually</h2>
              <p>Prefer to type the details yourself? Capture the essentials and track from the board.</p>
            </div>
            <div className="manual-form__grid">
              <div className="field">
                <label htmlFor="manual-title">Job title</label>
                <input
                  id="manual-title"
                  value={manualJob.title}
                  onChange={(event) => setManualJob((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="e.g. Senior Backend Engineer"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="manual-company">Company</label>
                <input
                  id="manual-company"
                  value={manualJob.company}
                  onChange={(event) => setManualJob((prev) => ({ ...prev, company: event.target.value }))}
                  placeholder="Company name"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="manual-location">Location</label>
                <input
                  id="manual-location"
                  value={manualJob.location}
                  onChange={(event) => setManualJob((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="City, Country or Remote"
                />
              </div>
              <div className="field">
                <label htmlFor="manual-link">Job link</label>
                <input
                  id="manual-link"
                  value={manualJob.link}
                  onChange={(event) => setManualJob((prev) => ({ ...prev, link: event.target.value }))}
                  placeholder="https://"
                  type="url"
                />
              </div>
              <div className="field field--full">
                <label htmlFor="manual-notes">Notes</label>
                <textarea
                  id="manual-notes"
                  value={manualJob.notes ?? ''}
                  onChange={(event) => setManualJob((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Add reminders or interview prep notes"
                  rows="2"
                />
              </div>
            </div>
            <div className="manual-form__actions">
              <button
                className="ghost-button"
                type="reset"
                onClick={() => setManualJob({ title: '', company: '', location: '', link: '', notes: '' })}
              >
                Clear
              </button>
              <button className="primary-button" type="submit">
                Add to tracker
              </button>
            </div>
          </form>
        </section>

        <section className="board-section">
          <div className="board-toolbar">
            <div className="toolbar-group">
              <label htmlFor="sort-select">Sort</label>
              <select id="sort-select" disabled>
                <option>Last updated (Newest)</option>
              </select>
            </div>
            <div className="toolbar-group">
              <label htmlFor="filter-select">Filter</label>
              <select id="filter-select" disabled>
                <option>All sources</option>
              </select>
            </div>
          </div>
          <div className="board-grid board-grid--main">
            {MAIN_STATUSES.map((status) => renderColumn(status))}
          </div>
          <div className="board-grid board-grid--outcome">
            {OUTCOME_STATUSES.map((status) => renderColumn(status))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
