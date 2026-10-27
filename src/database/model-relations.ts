import {
  initializeJobFileRelations,
  initializeProjectFileRelations,
  initializeProjectJobRelations,
} from '#/database/relations';

function initializeModelRelations(): void {
  initializeProjectFileRelations();
  initializeProjectJobRelations();
  initializeJobFileRelations();
}

export { initializeModelRelations };
