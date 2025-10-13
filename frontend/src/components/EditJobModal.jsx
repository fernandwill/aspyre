/**
 * Render the modal for editing or deleting an existing job application.
 */
export function EditJobModal({
  job,
  form,
  isDirty,
  onChange,
  onClose,
  onSubmit,
  onDelete,
  isSaving = false,
  isDeleting = false,
}) {
  if (!job) {
    return null
  }

  const isBusy = isSaving || isDeleting

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <h2 id="edit-modal-title">Edit job application</h2>
            <p className="modal__subtitle">Update details to keep your tracker accurate.</p>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
              <path
                d="M6.343 6.343a1 1 0 0 1 1.414 0L12 10.586l4.243-4.243a1 1 0 1 1 1.414 1.414L13.414 12l4.243 4.243a1 1 0 0 1-1.414 1.414L12 13.414l-4.243 4.243a1 1 0 0 1-1.414-1.414L10.586 12 6.343 7.757a1 1 0 0 1 0-1.414Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </header>
        <form className="modal__form" onSubmit={onSubmit} aria-busy={isBusy}>
          <label className="modal__field">
            <span>Job title</span>
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              disabled={isBusy}
            />
          </label>
          <label className="modal__field">
            <span>Company</span>
            <input
              value={form.company}
              onChange={(event) => onChange('company', event.target.value)}
              placeholder="Company name"
              disabled={isBusy}
            />
          </label>
          <label className="modal__field">
            <span>Location</span>
            <input
              value={form.location}
              onChange={(event) => onChange('location', event.target.value)}
              placeholder="City, Country or Remote"
              disabled={isBusy}
            />
          </label>
          <label className="modal__field">
            <span>Job link</span>
            <input
              value={form.link}
              onChange={(event) => onChange('link', event.target.value)}
              placeholder="https://"
              type="url"
              disabled={isBusy}
            />
          </label>
          <label className="modal__field">
            <span>Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => onChange('notes', event.target.value)}
              placeholder="Add reminders or interview prep notes"
              rows="4"
              disabled={isBusy}
            />
          </label>
          <div className="modal__actions">
            <button
              type="button"
              className="pill-button danger-button"
              onClick={onDelete}
              disabled={isBusy}
            >
              {isDeleting ? 'Removing…' : 'Delete job'}
            </button>
            <button
              type="button"
              className="pill-button ghost-button"
              onClick={onClose}
              disabled={isBusy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pill-button primary-button"
              disabled={!isDirty || isSaving || isDeleting}
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
