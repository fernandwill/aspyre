import { useCallback, useEffect, useMemo, useState } from 'react'
import { JOBS_PER_MODAL_PAGE, STATUSES } from '../lib/jobBoard'
import { generateId, normalizeLink } from '../lib/jobUtils'

const EMPTY_MANUAL_JOB = { title: '', company: '', location: '', link: '', notes: '' }
const EMPTY_EDIT_FORM = { title: '', company: '', location: '', link: '', notes: '' }

function hasEditChanges(editForm, job) {
  if (!job) {
    return false
  }

  const sanitizedTitle = editForm.title.trim()
  const sanitizedCompany = editForm.company.trim()
  const sanitizedLocation = editForm.location.trim()
  const sanitizedNotes = editForm.notes.trim()
  const normalizedLink = normalizeLink(editForm.link)

  const originalTitle = (job.title ?? '').trim()
  const originalCompany = (job.company ?? '').trim()
  const originalLocation = (job.location ?? '').trim()
  const originalNotes = (job.notes ?? '').trim()
  const originalLink = normalizeLink(job.link ?? '')

  const titleChanged = sanitizedTitle ? sanitizedTitle !== originalTitle : false
  const companyChanged = sanitizedCompany ? sanitizedCompany !== originalCompany : false
  const locationChanged = sanitizedLocation ? sanitizedLocation !== originalLocation : false
  const notesChanged = sanitizedNotes !== originalNotes
  const linkChanged = normalizedLink !== originalLink

  return titleChanged || companyChanged || locationChanged || notesChanged || linkChanged
}

export function useJobBoard(initialJobs = []) {
  const [jobs, setJobs] = useState(initialJobs)
  const [manualJob, setManualJob] = useState(EMPTY_MANUAL_JOB)
  const [draggedJobId, setDraggedJobId] = useState(null)
  const [activeDropStatus, setActiveDropStatus] = useState(null)
  const [editingJob, setEditingJob] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
  const [successMessage, setSuccessMessage] = useState(null)
  const [expandedStatus, setExpandedStatus] = useState(null)
  const [expandedPage, setExpandedPage] = useState(1)

  const jobsByStatus = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = jobs.filter((job) => job.status === status)
      return acc
    }, {})
  }, [jobs])

  const modalJobs = useMemo(() => {
    if (!expandedStatus) {
      return []
    }

    return jobsByStatus[expandedStatus] ?? []
  }, [expandedStatus, jobsByStatus])

  const totalModalPages = expandedStatus ? Math.ceil(modalJobs.length / JOBS_PER_MODAL_PAGE) : 0

  const paginatedModalJobs = useMemo(() => {
    if (!expandedStatus) {
      return []
    }

    const start = (expandedPage - 1) * JOBS_PER_MODAL_PAGE
    return modalJobs.slice(start, start + JOBS_PER_MODAL_PAGE)
  }, [expandedPage, expandedStatus, modalJobs])

  useEffect(() => {
    if (!expandedStatus) {
      return
    }

    if (totalModalPages === 0) {
      setExpandedPage(1)
      return
    }

    setExpandedPage((currentPage) => {
      if (currentPage > totalModalPages) {
        return totalModalPages
      }

      if (currentPage < 1) {
        return 1
      }

      return currentPage
    })
  }, [expandedStatus, totalModalPages])

  const isEditFormDirty = useMemo(() => hasEditChanges(editForm, editingJob), [editForm, editingJob])

  const resetManualJob = useCallback(() => {
    setManualJob(EMPTY_MANUAL_JOB)
  }, [])

  const updateManualJob = useCallback((field, value) => {
    setManualJob((previous) => ({
      ...previous,
      [field]: value,
    }))
  }, [])

  const openStatusModal = useCallback((status) => {
    setExpandedStatus(status)
    setExpandedPage(1)
  }, [])

  const closeStatusModal = useCallback(() => {
    setExpandedStatus(null)
    setExpandedPage(1)
  }, [])

  const goToPreviousModalPage = useCallback(() => {
    setExpandedPage((previous) => Math.max(1, previous - 1))
  }, [])

  const goToNextModalPage = useCallback(() => {
    setExpandedPage((previous) => {
      if (!totalModalPages) {
        return previous
      }

      return Math.min(totalModalPages, previous + 1)
    })
  }, [totalModalPages])

  const handleEditJob = useCallback((job) => {
    setEditingJob(job)
    setEditForm({
      title: job.title ?? '',
      company: job.company ?? '',
      location: job.location ?? '',
      link: job.link ?? '',
      notes: job.notes ?? '',
    })
  }, [])

  const updateEditForm = useCallback((field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }, [])

  const closeEditModal = useCallback(() => {
    setEditingJob(null)
    setEditForm(EMPTY_EDIT_FORM)
  }, [])

  const closeSuccessModal = useCallback(() => {
    setSuccessMessage(null)
  }, [])

  const updateJobStatus = useCallback((jobId, status) => {
    setJobs((previous) =>
      previous.map((job) => {
        if (job.id !== jobId) {
          return job
        }

        return {
          ...job,
          status,
        }
      })
    )
  }, [])

  const handleEditSubmit = useCallback(
    (event) => {
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
      setSuccessMessage('Job application updated')
    },
    [closeEditModal, editForm, editingJob]
  )

  const handleManualSubmit = useCallback(
    (event) => {
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
      resetManualJob()
      setSuccessMessage('Job added succesfully.')
    },
    [manualJob, resetManualJob]
  )

  const handleDragStart = useCallback((event, jobId) => {
    setDraggedJobId(jobId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', jobId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedJobId(null)
    setActiveDropStatus(null)
  }, [])

  const handleDragEnter = useCallback((status) => {
    setActiveDropStatus(status)
  }, [])

  const handleDragLeave = useCallback(
    (event, status) => {
      if (event.currentTarget.contains(event.relatedTarget)) {
        return
      }

      if (activeDropStatus === status) {
        setActiveDropStatus(null)
      }
    },
    [activeDropStatus]
  )

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (event, status) => {
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
    },
    [draggedJobId, jobs, updateJobStatus]
  )

  return {
    jobsByStatus,
    manualJob,
    updateManualJob,
    resetManualJob,
    handleManualSubmit,
    draggedJobId,
    activeDropStatus,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleEditJob,
    editingJob,
    editForm,
    updateEditForm,
    handleEditSubmit,
    closeEditModal,
    isEditFormDirty,
    successMessage,
    closeSuccessModal,
    expandedStatus,
    openStatusModal,
    closeStatusModal,
    paginatedModalJobs,
    modalJobs,
    expandedPage,
    totalModalPages,
    goToPreviousModalPage,
    goToNextModalPage,
  }
}
