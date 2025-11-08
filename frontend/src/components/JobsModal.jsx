import { useEffect, useState } from 'react'
import { STATUSES } from '../lib/jobBoard'

const TARGET_STATUSES = ['Interview', 'Online Assessment', 'Rejected', 'Accepted'].filter((status) =>
  STATUSES.includes(status)
)

/**
 * Display a modal listing all jobs in a specific status with pagination.
 */
export function JobsModal({
  status,
  jobs,
  paginatedJobs,
  page,
  totalPages,
  onClose,
  onNextPage,
  onPreviousPage,
  onChangeStatus,
}) {
  const [expandedJobId, setExpandedJobId] = useState(null)

  useEffect(() => {
    setExpandedJobId(null)
  }, [status, page])

  const handleCardClick = (jobId) => {
    setExpandedJobId((current) => (current === jobId ? null : jobId))
  }

  const handleStatusSelect = (jobId, nextStatus) => {
    if (typeof onChangeStatus === 'function') {
      onChangeStatus(jobId, nextStatus)
    }
    setExpandedJobId(null)
  }

  if (!status) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal modal--jobs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jobs-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <h2 id="jobs-modal-title">All {status} jobs</h2>
            <p className="modal__subtitle">{jobs.length} total applications</p>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
              <path
                d="M6.343 6.343a1 1 0 0 1 1.414 0L12 10.586l4.243-4.243a1 1 0 1 1 1.414 1.414L13.414 12l4.243 4.243a1 1 0 0 1-1.414 1.414L12 13.414l-4.243 4.243a1 1 0 0 1-1.414-1.414L10.586 12 6.343 7.757a1 1 0 0 1 0-1.414Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="modal__body modal__body--jobs">
          <div className="modal__job-grid">
            {paginatedJobs.map((job) => (
              <article
                className="job-card job-card--modal"
                key={job.id}
                onClick={() => handleCardClick(job.id)}
              >
                <header className="job-card__header">
                  <div className="job-card__heading">
                    {job.link ? (
                      <a
                        className="job-card__title"
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
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
                {expandedJobId === job.id && (
                  <div className="job-card__menu" onClick={(event) => event.stopPropagation()}>
                    <p className="job-card__menu-label">Move to…</p>
                    <div className="job-card__menu-options">
                      {TARGET_STATUSES.map((targetStatus) => (
                        <button
                          key={targetStatus}
                          type="button"
                          className="job-card__menu-option"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleStatusSelect(job.id, targetStatus)
                          }}
                        >
                          {targetStatus}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="modal__pagination">
              <button
                type="button"
                className="modal__pagination-button"
                onClick={onPreviousPage}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="modal__page-indicator">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="modal__pagination-button"
                onClick={onNextPage}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
