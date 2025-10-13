import { useMemo, useState } from 'react'
import './App.css'

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
    tags: ['React', 'Full-time'],
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
    tags: ['Design System', 'Hybrid'],
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
    tags: ['Python', 'Machine Learning'],
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
    tags: '',
  })

  const [draggedJobId, setDraggedJobId] = useState(null)
  const [activeDropStatus, setActiveDropStatus] = useState(null)

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
                <button className="ghost-button" type="button">
                  Add note
                </button>
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

  function handleTrackJob(event) {
    event.preventDefault()
    if (!linkInput.trim()) return

    const cleanedLink = linkInput.trim()
    const normalizedLink = cleanedLink.match(/^https?:\/\//i)
      ? cleanedLink
      : `https://${cleanedLink}`

    const inferred = inferJobFromUrl(normalizedLink)
    const newJob = {
      id: generateId(),
      status: 'Applied',
      tags: ['New'],
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

    const cleanedLink = manualJob.link?.trim()
    const normalizedLink = cleanedLink
      ? cleanedLink.match(/^https?:\/\//i)
        ? cleanedLink
        : `https://${cleanedLink}`
      : ''
    const tags = manualJob.tags
      ? manualJob.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []

    const newJob = {
      id: generateId(),
      status: 'Applied',
      tags,
      notes: manualJob.notes?.trim() || 'Added manually.',
      lastUpdate: 'Just now',
      title: manualJob.title.trim(),
      company: manualJob.company.trim(),
      location: manualJob.location.trim(),
      link: normalizedLink,
    }

    setJobs((previous) => [newJob, ...previous])
    setManualJob({ title: '', company: '', location: '', link: '', notes: '', tags: '' })
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
          <div className="brand-icon">P</div>
          <div className="brand-meta">
            <span className="brand-name">The Rove</span>
            <span className="brand-tag">Job Applications Dashboard</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button">
            Analytics
          </button>
          <button className="primary-button" type="button">
            Add Job Manually
          </button>
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
              <div className="field">
                <label htmlFor="manual-tags">Tags</label>
                <input
                  id="manual-tags"
                  value={manualJob.tags ?? ''}
                  onChange={(event) => setManualJob((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="Comma separated e.g. Remote, Contract"
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
              <button className="ghost-button" type="reset" onClick={() => setManualJob({ title: '', company: '', location: '', link: '', notes: '', tags: '' })}>
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
