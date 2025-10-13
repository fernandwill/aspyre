export function ManualJobForm({ manualJob, onFieldChange, onSubmit, onClear }) {
  return (
    <section className="manual-panel">
      <form className="manual-form" onSubmit={onSubmit}>
        <div className="manual-form__header">
          <h2>Add a job application</h2>
        </div>
        <div className="manual-form__grid">
          <div className="field">
            <label htmlFor="manual-title">
              Job title
              <span className="required-indicator" aria-hidden="true">*</span>
              <span className="sr-only"> required</span>
            </label>
            <input
              id="manual-title"
              value={manualJob.title}
              onChange={(event) => onFieldChange('title', event.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="manual-company">
              Company
              <span className="required-indicator" aria-hidden="true">*</span>
              <span className="sr-only"> required</span>
            </label>
            <input
              id="manual-company"
              value={manualJob.company}
              onChange={(event) => onFieldChange('company', event.target.value)}
              placeholder="Company name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="manual-location">
              Location
              <span className="required-indicator" aria-hidden="true">*</span>
              <span className="sr-only"> required</span>
            </label>
            <input
              id="manual-location"
              value={manualJob.location}
              onChange={(event) => onFieldChange('location', event.target.value)}
              placeholder="City, Country or Remote"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="manual-link">Job link</label>
            <input
              id="manual-link"
              value={manualJob.link}
              onChange={(event) => onFieldChange('link', event.target.value)}
              placeholder="https://"
              type="url"
            />
          </div>
          <div className="field field--full">
            <label htmlFor="manual-notes">Notes</label>
            <textarea
              id="manual-notes"
              value={manualJob.notes ?? ''}
              onChange={(event) => onFieldChange('notes', event.target.value)}
              placeholder="Add reminders or interview prep notes"
              rows="2"
            />
          </div>
        </div>
        <div className="manual-form__actions">
          <button className="ghost-button" type="reset" onClick={onClear}>
            Clear
          </button>
          <button className="primary-button" type="submit">
            Add to tracker
          </button>
        </div>
      </form>
    </section>
  )
}
