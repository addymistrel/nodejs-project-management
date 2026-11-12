import { HTTP_STATUS_CODE } from '#/constants';
import { AppExceptionBase } from '#/utils/exceptions/app-exception-base.js';

class FileDoesNotBelongToProjectException extends AppExceptionBase {
  constructor() {
    super('File does not belong to this project', HTTP_STATUS_CODE.BAD_REQUEST);
  }
}

export { FileDoesNotBelongToProjectException };
