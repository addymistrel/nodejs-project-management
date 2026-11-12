import { HTTP_STATUS_CODE } from '#/constants';
import { AppExceptionBase } from '#/utils/exceptions/app-exception-base.js';

class JobNotFoundException extends AppExceptionBase {
  constructor() {
    super('Job not found', HTTP_STATUS_CODE.NOT_FOUND);
  }
}

export { JobNotFoundException };
