import { useCallback, useEffect, useMemo, useState } from 'react'
import { JOBS_PER_MODAL_PAGE } from '../lib/jobBoard'

/**
 * Manage pagination state for the modal that lists jobs by status.
 */
export function useModalPagination(jobsByStatus) {
  const [status, setStatus] = useState(null)
  const [page, setPage] = useState(1)

  const jobs = useMemo(() => (status ? jobsByStatus[status] ?? [] : []), [jobsByStatus, status])
  const totalPages = status ? Math.ceil(jobs.length / JOBS_PER_MODAL_PAGE) : 0

  useEffect(() => {
    // Keep the current page in range whenever the selected status changes.
    if (!status) {
      setPage(1)
      return
    }

    if (totalPages === 0) {
      setPage(1)
      return
    }

    setPage((current) => Math.min(Math.max(1, current), totalPages))
  }, [status, totalPages])

  const paginatedJobs = useMemo(() => {
    // Slice the jobs for the active page when a status is expanded.
    if (!status) {
      return []
    }

    const start = (page - 1) * JOBS_PER_MODAL_PAGE
    return jobs.slice(start, start + JOBS_PER_MODAL_PAGE)
  }, [jobs, page, status])

  const open = useCallback((nextStatus) => {
    // Open the modal for the chosen status and reset pagination.
    setStatus(nextStatus)
    setPage(1)
  }, [])

  const close = useCallback(() => {
    // Close the modal and clear pagination state.
    setStatus(null)
    setPage(1)
  }, [])

  const goToPreviousPage = useCallback(() => {
    // Navigate backward one page without underflowing below 1.
    setPage((current) => Math.max(1, current - 1))
  }, [])

  const goToNextPage = useCallback(() => {
    // Advance to the next page but stay within the total number of pages.
    setPage((current) => {
      if (!totalPages) {
        return current
      }

      return Math.min(totalPages, current + 1)
    })
  }, [totalPages])

  return {
    status,
    jobs,
    paginatedJobs,
    page,
    totalPages,
    open,
    close,
    goToPreviousPage,
    goToNextPage,
  }
}
