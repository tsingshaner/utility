type ClientErrorStatusCode =
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 428
  | 429
  | 431
  | 451
type ServerErrorStatusCode = 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511
type ExceptionStatusCode = ClientErrorStatusCode | ServerErrorStatusCode

const concatString = (a: string | undefined, b: string): string => (a ? `${a}\n${b}` : b)

interface ExceptionConstructorParams {
  message?: string
  code: string
  position: string
  cause: Error
}

interface ExceptionPlainObject {
  code: string
  message: string
  meta?: Record<string, unknown>
  position?: string
  cause?: Error
}

interface ServiceExceptionPlainObject extends ExceptionPlainObject {
  status: ExceptionStatusCode
}

export const withLog = <T extends Exception>(
  exception: T,
  logger: (params: ExceptionPlainObject) => void,
  meta?: Record<string, unknown>
): T => {
  logger(exception.toPlainObject(meta))
  return exception
}

export class Exception implements Readonly<Pick<ExceptionConstructorParams, 'code' | 'position' | 'message'>> {
  readonly code: string
  readonly position: string
  readonly message: string
  readonly cause: Error

  constructor({ message, code, position, cause }: ExceptionConstructorParams) {
    this.cause = cause
    this.message = concatString(message, this.cause.message)
    this.code = code
    this.position = position
  }

  static is(instance: unknown): instance is Exception {
    return instance instanceof Exception
  }

  get json(): Required<Pick<ExceptionConstructorParams, 'code' | 'message'>> {
    return {
      code: this.code,
      message: this.message
    }
  }

  toPlainObject(meta?: Record<string, unknown>, overrides?: Partial<ExceptionPlainObject>): ExceptionPlainObject {
    return {
      cause: this.cause,
      code: this.code,
      message: this.message,
      meta,
      position: this.position,
      ...overrides
    }
  }

  aggregate = (exception: Exception): Exception => {
    if (this === exception) {
      return this
    }

    return new Exception({
      cause: new AggregateError([exception.cause, this.cause], concatString(exception.message, this.message)),
      code: concatString(exception.code, this.code),
      position: concatString(exception.position, this.position)
    })
  }

  static fromException = (
    exception: Exception,
    { message, code, position }: Partial<ExceptionConstructorParams>
  ): Exception => {
    return new Exception({
      cause: exception.cause,
      code: concatString(code, exception.code),
      message: concatString(message, exception.message),
      position: concatString(position, exception.position)
    })
  }

  /** 从错误创建异常, 会自动合并错误信息, cause 为传入的原始错误 */
  static fromError = (
    cause: Error,
    { code, position, message }: Pick<ExceptionConstructorParams, 'code' | 'position' | 'message'>
  ): Exception => new Exception({ cause, code, message: concatString(message, cause.message), position })
}

interface ServiceExceptionConstructorParams extends ExceptionConstructorParams {
  status: ExceptionStatusCode
}

export class ServiceException extends Exception {
  static fromException(
    exception: Exception,
    { status = 500, message, code, position }: Partial<ServiceExceptionConstructorParams>
  ): ServiceException {
    return new ServiceException({
      cause: exception.cause,
      code: concatString(code, exception.code),
      message: concatString(message, exception.message),
      position: concatString(position, exception.position),
      status
    })
  }

  readonly status: ExceptionStatusCode

  constructor({ status, ...rest }: ServiceExceptionConstructorParams) {
    super(rest)
    this.status = status
  }

  static is(instance: unknown): instance is ServiceException {
    return instance instanceof ServiceException
  }

  toRes(): [Record<string, unknown>, number] {
    const jsonBody = super.json
    jsonBody.message = jsonBody.message.split('\n')[0]

    return [jsonBody, this.status] as const
  }

  toPlainObject(tags?: Record<string, string>): ServiceExceptionPlainObject {
    return {
      ...super.toPlainObject(tags),
      status: this.status
    }
  }
}
