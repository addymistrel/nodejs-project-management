import { initializeJobFileRelations } from '#/database/relations/job-file-relations.js';
import { initializeProjectFileRelations } from '#/database/relations/project-file-relations.js';
import { initializeProjectJobRelations } from '#/database/relations/project-job-relations.js';

export function initializeModelRelations(): void {
  initializeProjectFileRelations();
  initializeProjectJobRelations();
  initializeJobFileRelations();
}
