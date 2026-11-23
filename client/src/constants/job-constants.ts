export const JOB_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const JOB_CONSTANTS = {
  POLL_INTERVAL_MS: 2000,
  DEFAULT_PAGE_LIMIT: 5,
} as const;

export const JOB_MESSAGES = {
  SECTION_TITLE: 'Background Zip Jobs',
  SECTION_SUBTITLE: 'Asynchronous workers create compressed archives of your files',
  CREATE_ZIP_BUTTON: 'Create Zip Archive',
  CREATING_BUTTON: 'Starting Job...',
  NO_FILES_SELECTED_WARNING:
    'Select at least one file from the table above to generate a ZIP archive.',
  EMPTY_JOBS_TITLE: 'No zip jobs yet',
  EMPTY_JOBS_SUBTITLE:
    'Select project files and click "Create Zip Archive" to trigger an asynchronous worker.',
  STATUS_PENDING: 'Pending',
  STATUS_PROCESSING: 'Processing',
  STATUS_COMPLETED: 'Completed',
  STATUS_FAILED: 'Failed',
  DOWNLOAD_ZIP_ACTION: 'Download ZIP',
  JOB_ID_LABEL: 'Job ID',
  CREATED_LABEL: 'Created',
  PROGRESS_LABEL: 'Progress',
  SUCCESS_CREATED: 'Zip generation job triggered! Processing in background...',
} as const;
