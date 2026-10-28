import {
  initializeJobFileRelations,
  initializeProjectFileRelations,
  initializeProjectJobRelations,
} from '#/database';

function initializeModelRelations(): void {
  initializeProjectFileRelations();
  initializeProjectJobRelations();
  initializeJobFileRelations();
}

export { initializeModelRelations };
