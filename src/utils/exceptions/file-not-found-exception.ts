import { HTTP_STATUS_CODE } from '#/constants';
import { AppExceptionBase } from '#/utils/exceptions/app-exception-base.js';

class FileNotFoundException extends AppExceptionBase {
  constructor() {
    super('File not found', HTTP_STATUS_CODE.NOT_FOUND);
  }
}

export { FileNotFoundException };
