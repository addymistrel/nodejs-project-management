import { HTTP_STATUS_CODE } from '#/constants';
import { AppExceptionBase } from '#/utils/exceptions/app-exception-base.js';

class InvalidCredentialsException extends AppExceptionBase {
  constructor(message = 'Invalid email or password') {
    super(message, HTTP_STATUS_CODE.UNAUTHORIZED);
  }
}

class EmailAlreadyExistsException extends AppExceptionBase {
  constructor() {
    super('Email already exists', HTTP_STATUS_CODE.CONFLICT);
  }
}

export { EmailAlreadyExistsException, InvalidCredentialsException };
