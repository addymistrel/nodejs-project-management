const FILE_SCHEMA_CONST = {
  TABLE_NAME: 'files',
  MODEL_NAME: 'File',
  ATTRIBUTES: {
    PROJECT_ID: 'projectId',
    OUTPUT_FILE_ID: 'outputFileId',
  },
  FIELDS: {
    ID: 'id',
    PROJECT_ID: 'project_id',
    NAME: 'name',
    STORAGE_PATH: 'storage_path',
    SIZE: 'size',
    MIME_TYPE: 'mime_type',
    CHECKSUM: 'checksum',
    IS_OUTPUT: 'is_output',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  RELATIONS: {
    PROJECT: 'project',
    OUTPUT_JOBS: 'outputJobs',
  },
  INDEXES: {
    PROJECT_ID: 'files_project_id_idx',
  },
};

const UPLOAD_DEFAULT_DIR = 'uploads';

const FILE_FOLDER_NAME = 'files';

const DEFAULT_FILE_NAME_PREFIX = 'uploaded-file-';

const MAX_FILE_PER_UPLOAD = 20;

const MAX_FILE_SIZE_ALLOWED = 100 * 1024 * 1024;

const DEFAULT_MIME_TYPE = 'application/octet-stream';

export {
  FILE_SCHEMA_CONST,
  UPLOAD_DEFAULT_DIR,
  FILE_FOLDER_NAME,
  DEFAULT_FILE_NAME_PREFIX,
  MAX_FILE_PER_UPLOAD,
  MAX_FILE_SIZE_ALLOWED,
  DEFAULT_MIME_TYPE,
};
