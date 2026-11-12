import { HTTP_STATUS_CODE } from '#/constants';
import { AppExceptionBase } from '#/utils/exceptions/app-exception-base.js';

class InvalidRequestException extends AppExceptionBase {
  constructor(message = 'Invalid Request') {
    super(message, HTTP_STATUS_CODE.BAD_REQUEST);
  }
}

export { InvalidRequestException };
