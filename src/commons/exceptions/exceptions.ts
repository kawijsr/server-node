export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
      message: string, statusCode: number,
      options?: { cause?: any; details?: any }) {
    super(message);
    this.statusCode = statusCode;
    this.details = options?.details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends HttpException {
  constructor(
      message: string = 'Bad Request',
      options?: { cause?: any; details?: any }) {
    super(message, 400, options);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(
      message: string = 'Unauthorized',
      options?: { cause?: any; details?: any }) {
    super(message, 401, options);
  }
}

export class NotFoundException extends HttpException {
  constructor(
      message: string = 'Not Found', options?: { cause?: any; details?: any }) {
    super(message, 404, options);
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(
      message: string = 'Unprocessable Entity',
      options?: { cause?: any; details?: any }) {
    super(message, 422, options);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(
      message: string = 'Internal Server Error',
      options?: { cause?: any; details?: any }) {
    super(message, 500, options);
  }
}
