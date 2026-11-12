import { HTTP_STATUS_CODE } from '#/constants';
import { AppExceptionBase } from '#/utils/exceptions/app-exception-base.js';

class ProjectNotFoundException extends AppExceptionBase {
  constructor() {
    super('Project not found', HTTP_STATUS_CODE.NOT_FOUND);
  }
}

export { ProjectNotFoundException };
