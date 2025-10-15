import { useMemo } from 'react'
import { STATUSES } from '../lib/jobBoard'

const STATUS_COLORS = {
  Applied: '#f97316',
  'Online Assessment': '#fb923c',
  Interview: '#facc15',
  Accepted: '#22c55e',
  Rejected: '#ef4444',
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  }
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, startAngle)
  const end = polarToCartesian(cx, cy, radius, endAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return [
    'M',
    cx,
    cy,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    1,
    end.x,
    end.y,
    'Z',
  ].join(' ')
}

export function StatusPieChart({ jobsByStatus }) {
  const statusCounts = useMemo(
    () =>
      STATUSES.map((status) => {
        const jobs = jobsByStatus?.[status]
        const count = Array.isArray(jobs) ? jobs.length : 0
        return { status, count }
      }),
    [jobsByStatus]
  )

  const total = statusCounts.reduce((sum, { count }) => sum + count, 0)

  const chartSegments = (() => {
    if (total === 0) {
      return []
    }

    const segments = []
    let currentAngle = 0

    statusCounts.forEach(({ status, count }) => {
      if (count === 0) {
        return
      }

      const sliceAngle = (count / total) * 360
      const pathData = describeArc(110, 110, 95, currentAngle, currentAngle + sliceAngle)
      segments.push({ status, pathData })
      currentAngle += sliceAngle
    })

    return segments
  })()

  return (
    <section className="status-chart-panel" aria-label="Job applications by status">
      <header className="status-chart-panel__header">
        <h2>Application status overview</h2>
        <p>{total === 1 ? 'Tracking 1 job' : `Tracking ${total} jobs`}</p>
      </header>

      {total === 0 ? (
        <div className="status-chart-panel__empty" role="presentation">
          <p>Add a job to see your progress visualised.</p>
        </div>
      ) : (
        <div className="status-chart">
          <svg viewBox="0 0 220 220" role="img" aria-hidden="true">
            <circle cx="110" cy="110" r="95" fill="#fee2e2" />
            {chartSegments.map(({ status, pathData }) => (
              <path key={status} d={pathData} fill={STATUS_COLORS[status]} />
            ))}
            <circle cx="110" cy="110" r="60" fill="#fff7ed" />
          </svg>
          <div className="status-chart__total" aria-hidden="true">
            <span className="status-chart__total-number">{total}</span>
            <span className="status-chart__total-label">Total</span>
          </div>
        </div>
      )}

      <ul className="status-chart-legend">
        {statusCounts.map(({ status, count }) => (
          <li key={status} className="status-chart-legend__item">
            <span
              className="status-chart-legend__swatch"
              style={{ backgroundColor: STATUS_COLORS[status], opacity: total === 0 ? 0.35 : 1 }}
            />
            <span className="status-chart-legend__label">{status}</span>
            <span className="status-chart-legend__count">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
