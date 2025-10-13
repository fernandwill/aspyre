import { useMemo, useState } from 'react'
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
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Bright Labs',
    location: 'Amsterdam, NL',
    link: 'https://boards.greenhouse.io/example/product-designer',
    status: 'Interview',
    notes: 'Second round scheduled next Tuesday.',
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'Vector Analytics',
    location: 'Berlin, DE',
    link: 'https://jobs.example.com/vector-analytics/data-scientist',
    status: 'Online Assessment',
    notes: 'Assessment submitted, awaiting feedback.',
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
  } catch {
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
  const [editingJob, setEditingJob] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    company: '',
    location: '',
    link: '',
    notes: '',
  })
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false)

  const isEditFormDirty = useMemo(() => {
    if (!editingJob) {
      return false
    }

    const sanitizedTitle = editForm.title.trim()
    const sanitizedCompany = editForm.company.trim()
    const sanitizedLocation = editForm.location.trim()
    const sanitizedNotes = editForm.notes.trim()
    const normalizedLink = normalizeLink(editForm.link)

    const originalTitle = (editingJob.title ?? '').trim()
    const originalCompany = (editingJob.company ?? '').trim()
    const originalLocation = (editingJob.location ?? '').trim()
    const originalNotes = (editingJob.notes ?? '').trim()
    const originalLink = normalizeLink(editingJob.link ?? '')

    const titleChanged = sanitizedTitle ? sanitizedTitle !== originalTitle : false
    const companyChanged = sanitizedCompany ? sanitizedCompany !== originalCompany : false
    const locationChanged = sanitizedLocation ? sanitizedLocation !== originalLocation : false
    const notesChanged = sanitizedNotes !== originalNotes
    const linkChanged = normalizedLink !== originalLink

    return titleChanged || companyChanged || locationChanged || notesChanged || linkChanged
  }, [editForm, editingJob])

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
    setEditingJob(job)
    setEditForm({
      title: job.title ?? '',
      company: job.company ?? '',
      location: job.location ?? '',
      link: job.link ?? '',
      notes: job.notes ?? '',
    })
  }

  function handleEditFormChange(field, value) {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function closeEditModal() {
    setEditingJob(null)
    setEditForm({
      title: '',
      company: '',
      location: '',
      link: '',
      notes: '',
    })
  }

  function handleEditSubmit(event) {
    event.preventDefault()
    if (!editingJob) {
      return
    }

    const normalizedLink = normalizeLink(editForm.link)

    setJobs((previous) =>
      previous.map((job) => {
        if (job.id !== editingJob.id) {
          return job
        }

        return {
          ...job,
          title: editForm.title.trim() || job.title,
          company: editForm.company.trim() || job.company,
          location: editForm.location.trim() || job.location,
          link: normalizedLink,
          notes: editForm.notes.trim(),
        }
      })
    )

    closeEditModal()
    setShowUpdateSuccess(true)
  }

  function closeSuccessModal() {
    setShowUpdateSuccess(false)
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
      title: manualJob.title.trim(),
      company: manualJob.company.trim(),
      location: manualJob.location.trim(),
      link: normalizedLink,
    }

    setJobs((previous) => [newJob, ...previous])
    setManualJob({ title: '', company: '', location: '', link: '', notes: '' })
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

        <div className="board-divider" role="separator" aria-label="My application board">
          <span className="board-divider__label">My Application</span>
        </div>

        <section className="board-section">
          <div className="board-grid board-grid--main">
            {MAIN_STATUSES.map((status) => renderColumn(status))}
          </div>
          <div className="board-grid board-grid--outcome">
            {OUTCOME_STATUSES.map((status) => renderColumn(status))}
          </div>
        </section>
      </main>
      {editingJob && (
        <div className="modal-backdrop" role="presentation" onClick={closeEditModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-job-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal__header">
              <h2 id="edit-job-title">Edit job details</h2>
              <button type="button" className="modal__close" onClick={closeEditModal} aria-label="Close">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path d="M6.343 6.343a1 1 0 0 1 1.414 0L12 10.586l4.243-4.243a1 1 0 1 1 1.414 1.414L13.414 12l4.243 4.243a1 1 0 0 1-1.414 1.414L12 13.414l-4.243 4.243a1 1 0 0 1-1.414-1.414L10.586 12 6.343 7.757a1 1 0 0 1 0-1.414Z" fill="currentColor" />
                </svg>
              </button>
            </div>
            <form className="modal__form" onSubmit={handleEditSubmit}>
              <label className="modal__field">
                <span>Job title</span>
                <input
                  value={editForm.title}
                  onChange={(event) => handleEditFormChange('title', event.target.value)}
                  type="text"
                  required
                />
              </label>
              <label className="modal__field">
                <span>Company</span>
                <input
                  value={editForm.company}
                  onChange={(event) => handleEditFormChange('company', event.target.value)}
                  type="text"
                  required
                />
              </label>
              <label className="modal__field">
                <span>Location</span>
                <input
                  value={editForm.location}
                  onChange={(event) => handleEditFormChange('location', event.target.value)}
                  type="text"
                />
              </label>
              <label className="modal__field">
                <span>Job link</span>
                <input
                  value={editForm.link}
                  onChange={(event) => handleEditFormChange('link', event.target.value)}
                  type="url"
                  placeholder="https://"
                />
              </label>
              <label className="modal__field">
                <span>Notes</span>
                <textarea
                  value={editForm.notes}
                  onChange={(event) => handleEditFormChange('notes', event.target.value)}
                  placeholder="Add reminders or interview prep notes"
                  rows="4"
                />
              </label>
              <div className="modal__actions">
                <button type="button" className="ghost-button" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={!isEditFormDirty}>
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showUpdateSuccess && (
        <div className="modal-backdrop" role="presentation" onClick={closeSuccessModal}>
          <div
            className="modal modal--success"
            role="alertdialog"
            aria-live="assertive"
            aria-modal="true"
            aria-labelledby="update-success-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal__success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="12" r="11" />
                <path d="M9.5 12.5l1.8 1.8 3.7-3.8" />
              </svg>
            </div>
            <h2 id="update-success-title">Job application updated</h2>
            <div className="modal__actions modal__actions--center">
              <button type="button" className="primary-button" onClick={closeSuccessModal}>
                Back to board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
