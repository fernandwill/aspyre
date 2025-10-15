import { useCallback, useState } from 'react'
import './App.css'
import aspyreLogo from './assets/aspyre-icon.svg'
import { JobColumn } from './components/JobColumn'
import { ManualJobForm } from './components/ManualJobForm'
import { StatusPieChart } from './components/StatusPieChart'
import { EditJobModal } from './components/EditJobModal'
import { SuccessModal } from './components/SuccessModal'
import { JobsModal } from './components/JobsModal'
import { Button } from './components/ui/button'
import { useJobBoard } from './hooks/useJobBoard'
import { MAIN_STATUSES, OUTCOME_STATUSES } from './lib/jobBoard'
import { signOut } from './lib/api'

/**
 * Render the Aspyre job tracking board and wire up all interactions.
 */
function App() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const {
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
  } = useJobBoard()

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)

    try {
      await signOut()
    } catch (error) {
      console.error('Failed to shut down the application during sign out', error)
    } finally {
      if (typeof window !== 'undefined') {
        window.open('', '_self')
        window.close()

        setTimeout(() => {
          if (!window.closed) {
            window.location.replace('about:blank')
          }
        }, 150)
      }
    }
  }, [isSigningOut])

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <img src={aspyreLogo} alt="Aspyre logo" />
          </div>
        </div>
        <div className="header-actions">
          <Button type="button" variant="ghost" size="sm" className="header-link">
            Analytics
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="header-link"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Signing Out…' : 'Sign Out'}
          </Button>
        </div>
      </header>

      <main className="app-main">
        {errorMessage && (
          <div className="feedback-banner" role="alert">
            <div className="feedback-banner__content">
              <h3>Something went wrong</h3>
              <p>{errorMessage}</p>
            </div>
            <button
              type="button"
              className="pill-button ghost-button feedback-banner__dismiss"
              onClick={dismissError}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="overview-grid">
          <ManualJobForm
            manualJob={manualJob}
            onFieldChange={updateManualJob}
            onSubmit={handleManualSubmit}
            onClear={resetManualJob}
            isSubmitting={isCreating}
          />

          <StatusPieChart jobsByStatus={jobsByStatus} />
        </div>

        {isLoading && (
          <div className="loading-state" role="status" aria-live="polite">
            <span aria-hidden="true">⏳</span>
            <span>Loading job applications…</span>
          </div>
        )}

        <div className="board-divider" role="separator" aria-label="My application board">
          <span className="board-divider__label">My Application</span>
        </div>

        <section className="board-section">
          <div className="board-grid board-grid--main">
            {MAIN_STATUSES.map((status) => (
              <JobColumn
                key={status}
                status={status}
                jobs={jobsByStatus[status] ?? []}
                draggedJobId={draggedJobId}
                activeDropStatus={activeDropStatus}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onViewMore={openStatusModal}
                onEdit={handleEditJob}
              />
            ))}
          </div>
          <div className="board-grid board-grid--outcome">
            {OUTCOME_STATUSES.map((status) => (
              <JobColumn
                key={status}
                status={status}
                jobs={jobsByStatus[status] ?? []}
                draggedJobId={draggedJobId}
                activeDropStatus={activeDropStatus}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onViewMore={openStatusModal}
                onEdit={handleEditJob}
              />
            ))}
          </div>
        </section>
      </main>

      <EditJobModal
        job={editingJob}
        form={editForm}
        isDirty={isEditFormDirty}
        onChange={updateEditForm}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        onDelete={handleDeleteJob}
        isSaving={isSaving}
        isDeleting={isDeleting}
      />

      <SuccessModal message={successMessage} onClose={closeSuccessModal} />

      <JobsModal
        status={expandedStatus}
        jobs={modalJobs}
        paginatedJobs={paginatedModalJobs}
        page={expandedPage}
        totalPages={totalModalPages}
        onClose={closeStatusModal}
        onNextPage={goToNextModalPage}
        onPreviousPage={goToPreviousModalPage}
      />
    </div>
  )
}

export default App
