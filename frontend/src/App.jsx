import './App.css'
import aspyreLogo from './assets/aspyre-icon.svg'
import { JobColumn } from './components/JobColumn'
import { ManualJobForm } from './components/ManualJobForm'
import { EditJobModal } from './components/EditJobModal'
import { SuccessModal } from './components/SuccessModal'
import { JobsModal } from './components/JobsModal'
import { Button } from './components/ui/button'
import { useJobBoard } from './hooks/useJobBoard'
import { MAIN_STATUSES, OUTCOME_STATUSES } from './lib/jobBoard'

function App() {
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
  } = useJobBoard()

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
          <Button type="button" variant="ghost" size="sm" className="header-link">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="app-main">
        <ManualJobForm
          manualJob={manualJob}
          onFieldChange={updateManualJob}
          onSubmit={handleManualSubmit}
          onClear={resetManualJob}
        />

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
