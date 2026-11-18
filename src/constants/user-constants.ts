const USER_SCHEMA_CONST = {
  TABLE_NAME: 'users',
  MODEL_NAME: 'User',
  FIELDS: {
    ID: 'id',
    NAME: 'name',
    EMAIL: 'email',
    PASSWORD_HASH: 'password_hash',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
} as const;

export { USER_SCHEMA_CONST };
