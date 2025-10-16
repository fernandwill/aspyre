import { useCallback, useEffect, useMemo, useState } from 'react'
import { STATUSES } from '../lib/jobBoard'
import { sanitizeJobFields } from '../lib/jobUtils'
import {
  createJobApplication,
  deleteJobApplication,
  listJobApplications,
  updateJobApplication,
  updateJobStatus as updateJobStatusRequest,
} from '../lib/api'
import { useIsMounted } from './useIsMounted'
import { useModalPagination } from './useModalPagination'

const EMPTY_MANUAL_JOB = { title: '', company: '', location: '', link: '', notes: '' }
const EMPTY_EDIT_FORM = { title: '', company: '', location: '', link: '', notes: '' }

// Create a reusable setter that updates a single field on a state object.
const updateField = (setState) => (field, value) => {
  setState((previous) => ({
    ...previous,
    [field]: value,
  }))
}

/**
 * Determine whether the edit form differs from the original job details.
 */
function hasEditChanges(editForm, job) {
  if (!job) {
    return false
  }

  const sanitizedForm = sanitizeJobFields(editForm)
  const original = sanitizeJobFields(job)

  return (
    (sanitizedForm.title && sanitizedForm.title !== original.title) ||
    (sanitizedForm.company && sanitizedForm.company !== original.company) ||
    (sanitizedForm.location && sanitizedForm.location !== original.location) ||
    sanitizedForm.notes !== original.notes ||
    sanitizedForm.link !== original.link
  )
}

/**
 * Build the payload for updating a job, preserving existing values when blank.
 */
function buildUpdatePayload(form, job) {
  const sanitized = sanitizeJobFields(form)

  return {
    title: sanitized.title || job.title,
    company: sanitized.company || job.company,
    location: sanitized.location || job.location,
    link: sanitized.link || null,
    notes: sanitized.notes || null,
  }
}

/**
 * Provide all state and handlers required to manage the job board UI.
 */
export function useJobBoard(initialJobs = []) {
  const [jobs, setJobs] = useState(() => (Array.isArray(initialJobs) ? initialJobs : []))
  const [manualJob, setManualJob] = useState(EMPTY_MANUAL_JOB)
  const [draggedJobId, setDraggedJobId] = useState(null)
  const [activeDropStatus, setActiveDropStatus] = useState(null)
  const [editingJob, setEditingJob] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isMounted = useIsMounted()

  const fetchJobs = useCallback(async () => {
    // Retrieve the latest jobs from the API and populate state.
    if (!isMounted()) {
      return
    }

    setIsLoading(true)
    setJobs([])

    try {
      const response = await listJobApplications()
      if (!isMounted()) {
        return
      }

      setJobs(Array.isArray(response) ? response : [])
      setErrorMessage(null)
    } catch (error) {
      console.error('Failed to load job applications', error)
      if (!isMounted()) {
        return
      }

      setJobs([])
      setErrorMessage(error.body?.message || 'Unable to load job applications. Please try again.')
    } finally {
      if (isMounted()) {
        setIsLoading(false)
      }
    }
  }, [isMounted])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const jobsByStatus = useMemo(() => {
    // Group jobs by their status for easier rendering.
    return STATUSES.reduce((acc, status) => {
      acc[status] = jobs.filter((job) => job.status === status)
      return acc
    }, {})
  }, [jobs])

  const modalControls = useModalPagination(jobsByStatus)

  // Track whether the edit form has diverged from the persisted job data.
  const isEditFormDirty = useMemo(() => hasEditChanges(editForm, editingJob), [editForm, editingJob])

  const resetManualJob = useCallback(() => {
    // Reset the manual job form back to its empty defaults.
    setManualJob(EMPTY_MANUAL_JOB)
  }, [])

  // Expose a field updater for the manual job form inputs.
  const updateManualJob = useMemo(() => updateField(setManualJob), [setManualJob])

  const handleEditJob = useCallback((job) => {
    // Populate the edit modal with the selected job's details.
    setEditingJob(job)
    setEditForm({ ...EMPTY_EDIT_FORM, ...sanitizeJobFields(job) })
  }, [])

  // Provide a change handler for the edit modal fields.
  const updateEditForm = useMemo(() => updateField(setEditForm), [setEditForm])

  const closeEditModal = useCallback(() => {
    // Close the edit modal and clear any staged form values.
    setEditingJob(null)
    setEditForm(EMPTY_EDIT_FORM)
  }, [])

  const closeSuccessModal = useCallback(() => {
    // Hide the success modal once the user acknowledges it.
    setSuccessMessage(null)
  }, [])

  const dismissError = useCallback(() => {
    // Clear the current error banner message.
    setErrorMessage(null)
  }, [])

  // Submit the manual job form when the user adds a new opportunity.
  const handleManualSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      if (isCreating) {
        return
      }

      const sanitized = sanitizeJobFields(manualJob)
      const { title, company, location, link, notes } = sanitized

      if (!title || !company || !location) {
        return
      }

      setIsCreating(true)

      try {
        const createdJob = await createJobApplication({
          title,
          company,
          location,
          link: link || null,
          notes: notes || 'Added manually.',
        })

        if (isMounted()) {
          setJobs((previous) => [createdJob, ...previous])
          resetManualJob()
          setSuccessMessage('Job added successfully.')
          setErrorMessage(null)
        }
      } catch (error) {
        console.error('Failed to create job application', error)
        if (isMounted()) {
          setErrorMessage(error.body?.message || 'Unable to add job application. Please try again.')
        }
      } finally {
        if (isMounted()) {
          setIsCreating(false)
        }
      }
    },
    [isCreating, isMounted, manualJob, resetManualJob]
  )

  // Save edits made in the modal and sync them with the API.
  const handleEditSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      if (!editingJob || isSaving) {
        return
      }

      const previousJob = editingJob
      const payload = buildUpdatePayload(editForm, previousJob)

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
        if (!isMounted()) {
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
        if (!isMounted()) {
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
        if (isMounted()) {
          setIsSaving(false)
        }
      }
    },
    [closeEditModal, editForm, editingJob, isMounted, isSaving]
  )

  // Remove the currently selected job from the board.
  const handleDeleteJob = useCallback(async () => {
    if (!editingJob || isDeleting) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteJobApplication(editingJob.id)
      if (!isMounted()) {
        return
      }

      setJobs((previous) => previous.filter((job) => job.id !== editingJob.id))
      setSuccessMessage('Job application removed')
      setErrorMessage(null)
      closeEditModal()
    } catch (error) {
      console.error('Failed to delete job application', error)
      if (isMounted()) {
        setErrorMessage(error.body?.message || 'Unable to delete job application. Please try again.')
      }
    } finally {
      if (isMounted()) {
        setIsDeleting(false)
      }
    }
  }, [closeEditModal, editingJob, isDeleting, isMounted])

  // Persist drag-and-drop status changes to the backend.
  const handleStatusChange = useCallback(async (jobId, status) => {
    if (!jobId) {
      return
    }

    const normalizedJobId =
      typeof jobId === 'string' ? Number.parseInt(jobId, 10) : jobId
    if (Number.isNaN(normalizedJobId)) {
      return
    }

    const existingJob = jobs.find((job) => {
      const jobIdNumber =
        typeof job.id === 'number' ? job.id : Number.parseInt(job.id, 10)
      return !Number.isNaN(jobIdNumber) && jobIdNumber === normalizedJobId
    })

    if (!existingJob || existingJob.status === status) {
      return
    }

    const optimisticJob = {
      ...existingJob,
      status,
    }

    setJobs((previous) =>
      previous.map((job) => {
        const jobIdNumber =
          typeof job.id === 'number' ? job.id : Number.parseInt(job.id, 10)
        if (Number.isNaN(jobIdNumber) || jobIdNumber !== normalizedJobId) {
          return job
        }

        return optimisticJob
      })
    )

    try {
      const updatedJob = await updateJobStatusRequest(normalizedJobId, status)
      if (!isMounted()) {
        return
      }

      setJobs((previous) =>
        previous.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      )
      setErrorMessage(null)
    } catch (error) {
      console.error('Failed to update job status', error)
      if (!isMounted()) {
        return
      }

      setJobs((previous) =>
        previous.map((job) => (job.id === existingJob.id ? existingJob : job))
      )
      setErrorMessage(error.body?.message || 'Unable to update job status. Please try again.')
    }
  // Depend on `jobs` so we always inspect the freshest data set; without this the memoized
  // callback may miss the dragged job and skip the status update entirely.
  }, [isMounted, jobs])

  // Begin tracking a drag interaction for a job card.
  const handleDragStart = useCallback((event, jobId) => {
    setDraggedJobId(jobId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', jobId)
  }, [])

  // Clear drag state when the interaction completes.
  const handleDragEnd = useCallback(() => {
    setDraggedJobId(null)
    setActiveDropStatus(null)
  }, [])

  // Set the active drop target when a card hovers over a column.
  const handleDragEnter = useCallback((status) => {
    setActiveDropStatus(status)
  }, [])

  // Remove column highlighting when a drag leaves the area.
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

  // Allow dropping by preventing the default drag-over behavior.
  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Complete the drag-and-drop interaction and trigger a status update.
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
    handleStatusChange,
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
    expandedStatus: modalControls.status,
    openStatusModal: modalControls.open,
    closeStatusModal: modalControls.close,
    paginatedModalJobs: modalControls.paginatedJobs,
    modalJobs: modalControls.jobs,
    expandedPage: modalControls.page,
    totalModalPages: modalControls.totalPages,
    goToPreviousModalPage: modalControls.goToPreviousPage,
    goToNextModalPage: modalControls.goToNextPage,
    refreshJobs: fetchJobs,
  }
}
