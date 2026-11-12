import { HTTP_STATUS_CODE } from '#/constants';
import { AppExceptionBase } from '#/utils/exceptions/app-exception-base.js';

class RequiredFileException extends AppExceptionBase {
  constructor() {
    super('At least one file is required', HTTP_STATUS_CODE.BAD_REQUEST);
  }
}

export { RequiredFileException };
