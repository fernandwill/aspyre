export function SuccessModal({ message, onClose }) {
  if (!message) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal modal--success"
        role="alertdialog"
        aria-live="assertive"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <circle cx="12" cy="12" r="11" />
            <path d="M9.5 12.5l1.8 1.8 3.7-3.8" />
          </svg>
        </div>
        <h2 id="success-modal-title">{message}</h2>
        <div className="modal__actions modal__actions--center">
          <button type="button" className="primary-button" onClick={onClose}>
            Back to board
          </button>
        </div>
      </div>
    </div>
  )
}
