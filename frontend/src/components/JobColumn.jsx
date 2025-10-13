import { cn } from '../lib/utils'

export function JobColumn({
  status,
  jobs,
  draggedJobId,
  activeDropStatus,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onViewMore,
  onEdit,
}) {
  const visibleJobs = jobs.slice(0, 3)
  const remainingJobs = jobs.length - visibleJobs.length

  return (
    <div
      className={cn('board-column', activeDropStatus === status && 'board-column--active')}
      onDragOver={onDragOver}
      onDrop={(event) => onDrop(event, status)}
      onDragEnter={() => onDragEnter(status)}
      onDragLeave={(event) => onDragLeave(event, status)}
    >
      <header className="column-header">
        <div className="column-header__info">
          <h3>{status}</h3>
          <span className="column-count">{jobs.length} jobs</span>
        </div>
        {remainingJobs > 0 && (
          <button
            type="button"
            className="column-more-button"
            onClick={() => onViewMore(status)}
            aria-label={`View ${remainingJobs} more job applications in ${status}`}
          >
            +{remainingJobs}
          </button>
        )}
      </header>
      <div className="column-content">
        {visibleJobs.map((job) => (
          <article
            className={cn('job-card', draggedJobId === job.id && 'job-card--dragging')}
            draggable
            key={job.id}
            onDragStart={(event) => onDragStart(event, job.id)}
            onDragEnd={onDragEnd}
          >
            <button
              type="button"
              className="job-card__edit-icon"
              aria-label={`Edit ${job.title}`}
              onClick={() => onEdit(job)}
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <path
                  d="M16.862 3.487a1.75 1.75 0 0 1 2.476 2.476l-9.62 9.62a3 3 0 0 1-1.36.773l-3.17.793a.75.75 0 0 1-.908-.908l.793-3.17a3 3 0 0 1 .773-1.36l9.62-9.62Z"
                  fill="currentColor"
                />
                <path d="M5.25 19.5h13.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
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
        {jobs.length === 0 && (
          <div className="empty-state">
            <p>No jobs here yet.</p>
            <span>Move a card or add a new opportunity.</span>
          </div>
        )}
      </div>
    </div>
  )
}
