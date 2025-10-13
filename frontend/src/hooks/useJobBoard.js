import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { JOBS_PER_MODAL_PAGE, STATUSES } from '../lib/jobBoard'
import { normalizeLink } from '../lib/jobUtils'
import {
  createJobApplication,
  deleteJobApplication,
  listJobApplications,
  updateJobApplication,
  updateJobStatus as updateJobStatusRequest,
} from '../lib/api'

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
  const normalizedEditLink = normalizeLink(editForm.link)

  const originalTitle = (job.title ?? '').trim()
  const originalCompany = (job.company ?? '').trim()
  const originalLocation = (job.location ?? '').trim()
  const originalNotes = (job.notes ?? '').trim()
  const originalLink = normalizeLink(job.link ?? '')

  const titleChanged = sanitizedTitle ? sanitizedTitle !== originalTitle : false
  const companyChanged = sanitizedCompany ? sanitizedCompany !== originalCompany : false
  const locationChanged = sanitizedLocation ? sanitizedLocation !== originalLocation : false
  const notesChanged = sanitizedNotes !== originalNotes
  const linkChanged = normalizedEditLink !== originalLink

  return titleChanged || companyChanged || locationChanged || notesChanged || linkChanged
}

export function useJobBoard(initialJobs = []) {
  const [jobs, setJobs] = useState(() => (Array.isArray(initialJobs) ? initialJobs : []))
  const [manualJob, setManualJob] = useState(EMPTY_MANUAL_JOB)
  const [draggedJobId, setDraggedJobId] = useState(null)
  const [activeDropStatus, setActiveDropStatus] = useState(null)
  const [editingJob, setEditingJob] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
  const [successMessage, setSuccessMessage] = useState(null)
  const [expandedStatus, setExpandedStatus] = useState(null)
  const [expandedPage, setExpandedPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchJobs = useCallback(async () => {
    if (!isMountedRef.current) {
      return
    }

    setIsLoading(true)
    setJobs([])

    try {
      const response = await listJobApplications()
      if (!isMountedRef.current) {
        return
      }

      setJobs(Array.isArray(response) ? response : [])
      setErrorMessage(null)
    } catch (error) {
      console.error('Failed to load job applications', error)
      if (!isMountedRef.current) {
        return
      }

      setJobs([])
      setErrorMessage(error.body?.message || 'Unable to load job applications. Please try again.')
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

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

  const dismissError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  const handleManualSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      if (isCreating) {
        return
      }

      const sanitizedTitle = manualJob.title.trim()
      const sanitizedCompany = manualJob.company.trim()
      const sanitizedLocation = manualJob.location.trim()

      if (!sanitizedTitle || !sanitizedCompany || !sanitizedLocation) {
        return
      }

      const normalizedManualLink = normalizeLink(manualJob.link)
      const sanitizedNotes = manualJob.notes?.trim()

      setIsCreating(true)

      try {
        const createdJob = await createJobApplication({
          title: sanitizedTitle,
          company: sanitizedCompany,
          location: sanitizedLocation,
          link: normalizedManualLink || null,
          notes: sanitizedNotes || 'Added manually.',
        })

        if (!isMountedRef.current) {
          return
        }

        setJobs((previous) => [createdJob, ...previous])
        resetManualJob()
        setSuccessMessage('Job added successfully.')
        setErrorMessage(null)
      } catch (error) {
        console.error('Failed to create job application', error)
        if (isMountedRef.current) {
          setErrorMessage(error.body?.message || 'Unable to add job application. Please try again.')
        }
      } finally {
        if (isMountedRef.current) {
          setIsCreating(false)
        }
      }
    },
    [isCreating, manualJob, resetManualJob]
  )

  const handleEditSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      if (!editingJob || isSaving) {
        return
      }

      const previousJob = editingJob
      const sanitizedTitle = editForm.title.trim() || previousJob.title
      const sanitizedCompany = editForm.company.trim() || previousJob.company
      const sanitizedLocation = editForm.location.trim() || previousJob.location
      const sanitizedNotes = editForm.notes.trim()
      const normalizedEditLink = normalizeLink(editForm.link)

      const payload = {
        title: sanitizedTitle,
        company: sanitizedCompany,
        location: sanitizedLocation,
        link: normalizedEditLink || null,
        notes: sanitizedNotes || null,
      }

      const optimisticJob = {
        ...previousJob,
        ...payload,
      }

      setIsSaving(true)
      setJobs((previous) =>
        previous.map((job) => (job.id === previousJob.id ? optimisticJob : job))
      )
      setEditingJob(optimisticJob)

      try {
        const updatedJob = await updateJobApplication(previousJob.id, payload)
        if (!isMountedRef.current) {
          return
        }

        setJobs((previous) =>
          previous.map((job) => (job.id === updatedJob.id ? updatedJob : job))
        )
        setSuccessMessage('Job application updated')
        setErrorMessage(null)
        closeEditModal()
      } catch (error) {
        console.error('Failed to update job application', error)
        if (!isMountedRef.current) {
          return
        }

        setJobs((previous) =>
          previous.map((job) => (job.id === previousJob.id ? previousJob : job))
        )
        setEditingJob(previousJob)
        setErrorMessage(
          error.body?.message || 'Unable to update job application. Please try again.'
        )
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false)
        }
      }
    },
    [closeEditModal, editForm, editingJob, isSaving]
  )

  const handleDeleteJob = useCallback(async () => {
    if (!editingJob || isDeleting) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteJobApplication(editingJob.id)
      if (!isMountedRef.current) {
        return
      }

      setJobs((previous) => previous.filter((job) => job.id !== editingJob.id))
      setSuccessMessage('Job application removed')
      setErrorMessage(null)
      closeEditModal()
    } catch (error) {
      console.error('Failed to delete job application', error)
      if (isMountedRef.current) {
        setErrorMessage(error.body?.message || 'Unable to delete job application. Please try again.')
      }
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false)
      }
    }
  }, [closeEditModal, editingJob, isDeleting])

  const handleStatusChange = useCallback(async (jobId, status) => {
    if (!jobId) {
      return
    }

    let originalJob = null
    let didChange = false

    setJobs((previous) =>
      previous.map((job) => {
        if (job.id !== jobId) {
          return job
        }

        originalJob = job
        if (job.status === status) {
          return job
        }

        didChange = true
        return {
          ...job,
          status,
        }
      })
    )

    if (!didChange || !originalJob) {
      return
    }

    try {
      const updatedJob = await updateJobStatusRequest(jobId, status)
      if (!isMountedRef.current) {
        return
      }

      setJobs((previous) =>
        previous.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      )
      setErrorMessage(null)
    } catch (error) {
      console.error('Failed to update job status', error)
      if (!isMountedRef.current) {
        return
      }

      setJobs((previous) =>
        previous.map((job) => (job.id === originalJob.id ? originalJob : job))
      )
      setErrorMessage(error.body?.message || 'Unable to update job status. Please try again.')
    }
  }, [])

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
      handleStatusChange(jobId, status)
    },
    [draggedJobId, handleStatusChange]
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
    handleDeleteJob,
    closeEditModal,
    isEditFormDirty,
    successMessage,
    closeSuccessModal,
    errorMessage,
    dismissError,
    isLoading,
    isCreating,
    isSaving,
    isDeleting,
    expandedStatus,
    openStatusModal,
    closeStatusModal,
    paginatedModalJobs,
    modalJobs,
    expandedPage,
    totalModalPages,
    goToPreviousModalPage,
    goToNextModalPage,
    refreshJobs: fetchJobs,
  }
}
