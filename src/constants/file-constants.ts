const FILE_SCHEMA_CONST = {
  TABLE_NAME: 'files',
  MODEL_NAME: 'File',
  ATTRIBUTES: {
    PROJECT_ID: 'projectId',
    OUTPUT_FILE_ID: 'outputFileId',
  },
  FIELDS: {
    PROJECT_ID: 'project_id',
    STORAGE_PATH: 'storage_path',
    MIME_TYPE: 'mime_type',
    IS_OUTPUT: 'is_output',
  },
  RELATIONS: {
    PROJECT: 'project',
    OUTPUT_JOBS: 'outputJobs',
  },
  INDEXES: {
    PROJECT_ID: 'files_project_id_idx',
  },
};

export { FILE_SCHEMA_CONST };
