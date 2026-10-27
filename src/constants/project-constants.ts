const PROJECT_SCHEMA_CONST = {
  TABLE_NAME: 'projects',
  MODEL_NAME: 'Project',
  FIELDS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  RELATIONS: {
    FILES: 'files',
    JOBS: 'jobs',
  },
};

export { PROJECT_SCHEMA_CONST };
