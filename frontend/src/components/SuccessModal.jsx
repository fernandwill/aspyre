import { useEffect, useState } from 'react'

const AUTO_CLOSE_SECONDS = 5
const AUTO_CLOSE_MS = AUTO_CLOSE_SECONDS * 1000
const COUNTDOWN_TICK_MS = 100
const COUNTDOWN_RADIUS = 12
const COUNTDOWN_CIRCUMFERENCE = 2 * Math.PI * COUNTDOWN_RADIUS

/**
 * Present a success dialog confirming an operation completed as expected.
 */
export function SuccessModal({ message, onClose }) {
  const [remainingMs, setRemainingMs] = useState(AUTO_CLOSE_MS)

  useEffect(() => {
    if (!message) {
      return
    }

    const endTime = Date.now() + AUTO_CLOSE_MS
    setRemainingMs(AUTO_CLOSE_MS)

    const intervalId = setInterval(() => {
      const nextRemaining = Math.max(0, endTime - Date.now())
      setRemainingMs(nextRemaining)

      if (nextRemaining === 0) {
        clearInterval(intervalId)
        onClose?.()
      }
    }, COUNTDOWN_TICK_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [message, onClose])

  if (!message) {
    return null
  }

  const secondsRemaining = Math.ceil(remainingMs / 1000)
  const strokeDashoffset =
    COUNTDOWN_CIRCUMFERENCE - (remainingMs / AUTO_CLOSE_MS) * COUNTDOWN_CIRCUMFERENCE

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal modal--success"
        style={{ position: 'relative' }}
        role="alertdialog"
        aria-live="assertive"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: '#4f4f4f',
          }}
        >
          Auto closing...
          <svg
            width={COUNTDOWN_RADIUS * 2 + 6}
            height={COUNTDOWN_RADIUS * 2 + 6}
            viewBox={`0 0 ${COUNTDOWN_RADIUS * 2 + 6} ${COUNTDOWN_RADIUS * 2 + 6}`}
            role="presentation"
            aria-hidden="true"
          >
            <circle
              cx={(COUNTDOWN_RADIUS * 2 + 6) / 2}
              cy={(COUNTDOWN_RADIUS * 2 + 6) / 2}
              r={COUNTDOWN_RADIUS}
              fill="none"
              stroke="#dcdcdc"
              strokeWidth="3"
            />
            <circle
              cx={(COUNTDOWN_RADIUS * 2 + 6) / 2}
              cy={(COUNTDOWN_RADIUS * 2 + 6) / 2}
              r={COUNTDOWN_RADIUS}
              fill="none"
              stroke="#44aa6a"
              strokeWidth="3"
              strokeDasharray={COUNTDOWN_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              transform={`rotate(-90 ${(COUNTDOWN_RADIUS * 2 + 6) / 2} ${
                (COUNTDOWN_RADIUS * 2 + 6) / 2
              })`}
            />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="0.7rem"
              fill="#222"
              fontWeight="600"
            >
              {secondsRemaining}
            </text>
          </svg>
        </div>
        <div className="modal__success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <circle cx="12" cy="12" r="11" />
            <path d="M9.5 12.5l1.8 1.8 3.7-3.8" />
          </svg>
        </div>
        <h2 id="success-modal-title">{message}</h2>
        <div className="modal__actions modal__actions--center">
          <button type="button" className="pill-button primary-button" onClick={onClose}>
            Back to board
          </button>
        </div>
      </div>
    </div>
  )
}
