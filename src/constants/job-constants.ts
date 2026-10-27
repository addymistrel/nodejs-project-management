const JOB_TYPES = {
  ZIP_COMPRESSION: 'ZIP_COMPRESSION',
} as const;

const JOB_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

const JOB_TYPE_VALUES = Object.values(JOB_TYPES);
const JOB_STATUS_VALUES = Object.values(JOB_STATUSES);

const JOB_SCHEMA_CONST = {
  TABLE_NAME: 'jobs',
  MODEL_NAME: 'Job',
  FIELDS: {
    PROJECT_ID: 'project_id',
    STATUS: 'status',
    OUTPUT_FILE_ID: 'output_file_id',
    ERROR_MESSAGE: 'error_message',
    STARTED_AT: 'started_at',
    COMPLETED_AT: 'completed_at',
  },
  INDEXES: {
    PROJECT_ID: 'jobs_project_id_idx',
    STATUS: 'jobs_status_idx',
    PROJECT_STATUS: 'jobs_project_status_idx',
  },
};

export { JOB_SCHEMA_CONST, JOB_STATUSES, JOB_STATUS_VALUES, JOB_TYPES, JOB_TYPE_VALUES };
