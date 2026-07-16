import { describe, expect } from 'vitest'

import { Exception, ServiceException, withLog } from './index'

describe('Exception', (test) => {
  test('combines the given message and the cause message with a newline', ({ expect }) => {
    const cause = new Error('boom')

    const exception = new Exception({ cause, code: 'E_THING', message: 'failed to do thing', position: 'service.do' })

    expect(exception.message).toBe('failed to do thing\nboom')
    expect(exception.code).toBe('E_THING')
    expect(exception.position).toBe('service.do')
    expect(exception.cause).toBe(cause)
  })

  test('falls back to the cause message when no message is given', ({ expect }) => {
    const cause = new Error('boom')

    const exception = new Exception({ cause, code: 'E_THING', position: 'service.do' })

    expect(exception.message).toBe('boom')
  })

  test('is() returns true for Exception instances, including subclasses', ({ expect }) => {
    const exception = new Exception({ cause: new Error('boom'), code: 'E', position: 'p' })
    const serviceException = new ServiceException({ cause: new Error('boom'), code: 'S', position: 'p', status: 400 })

    expect(Exception.is(exception)).toBe(true)
    expect(Exception.is(serviceException)).toBe(true)
  })

  test.each([[{}], [null], [undefined], ['exception'], [new Error('plain error')]])(
    'is() returns false for %j',
    (value) => expect(Exception.is(value)).toBe(false)
  )

  test('json getter exposes only code and message', ({ expect }) => {
    const exception = new Exception({
      cause: new Error('boom'),
      code: 'E_THING',
      message: 'failed',
      position: 'service.do'
    })

    expect(exception.json).toEqual({ code: 'E_THING', message: 'failed\nboom' })
  })

  test('toPlainObject() returns cause, code, message, meta and position', ({ expect }) => {
    const cause = new Error('boom')
    const exception = new Exception({ cause, code: 'E_THING', message: 'failed', position: 'service.do' })

    expect(exception.toPlainObject({ requestId: 'abc' })).toEqual({
      cause,
      code: 'E_THING',
      message: 'failed\nboom',
      meta: { requestId: 'abc' },
      position: 'service.do'
    })
  })

  test('toPlainObject() applies overrides on top of the default fields', ({ expect }) => {
    const exception = new Exception({
      cause: new Error('boom'),
      code: 'E_THING',
      message: 'failed',
      position: 'service.do'
    })

    const result = exception.toPlainObject({ requestId: 'abc' }, { code: 'OVERRIDDEN' })

    expect(result.code).toBe('OVERRIDDEN')
    expect(result.message).toBe('failed\nboom')
  })

  test('aggregate() returns the same instance when aggregating with itself', ({ expect }) => {
    const exception = new Exception({ cause: new Error('boom'), code: 'E', position: 'p' })

    expect(exception.aggregate(exception)).toBe(exception)
  })

  test('aggregate() merges two exceptions into one backed by an AggregateError', ({ expect }) => {
    const causeA = new Error('cause A message')
    const exceptionA = new Exception({ cause: causeA, code: 'E1', message: 'e1 message', position: 'pos1' })
    const causeB = new Error('cause B message')
    const exceptionB = new Exception({ cause: causeB, code: 'E3', message: 'e3 message', position: 'pos3' })

    const aggregated = exceptionA.aggregate(exceptionB)

    expect(aggregated.code).toBe('E3\nE1')
    expect(aggregated.position).toBe('pos3\npos1')
    expect(aggregated.cause).toBeInstanceOf(AggregateError)
    expect((aggregated.cause as AggregateError).errors).toEqual([causeB, causeA])
  })

  test('fromException() carries over the original cause and combines code, message and position', ({ expect }) => {
    const cause = new Error('boom')
    const original = new Exception({ cause, code: 'E1', message: 'first message', position: 'pos1' })

    const wrapped = Exception.fromException(original, { code: 'E2', message: 'second message', position: 'pos2' })

    expect(wrapped.cause).toBe(cause)
    expect(wrapped.code).toBe('E2\nE1')
    expect(wrapped.position).toBe('pos2\npos1')
  })

  test('fromError() wraps a raw error, keeping it as the cause', ({ expect }) => {
    const cause = new Error('disk full')

    const exception = Exception.fromError(cause, { code: 'E_IO', position: 'fs.write' })

    expect(exception.cause).toBe(cause)
    expect(exception.code).toBe('E_IO')
    expect(exception.position).toBe('fs.write')
    expect(exception.message).toContain('disk full')
  })
})

describe('ServiceException', (test) => {
  test('extends Exception with an HTTP status code', ({ expect }) => {
    const cause = new Error('not found')

    const exception = new ServiceException({
      cause,
      code: 'E_NOT_FOUND',
      message: 'missing',
      position: 'repo.find',
      status: 404
    })

    expect(exception.status).toBe(404)
    expect(exception.message).toBe('missing\nnot found')
    expect(exception).toBeInstanceOf(Exception)
  })

  test('is() returns true only for ServiceException instances', ({ expect }) => {
    const serviceException = new ServiceException({ cause: new Error('boom'), code: 'S', position: 'p', status: 400 })
    const plainException = new Exception({ cause: new Error('boom'), code: 'E', position: 'p' })

    expect(ServiceException.is(serviceException)).toBe(true)
    expect(ServiceException.is(plainException)).toBe(false)
  })

  test('toRes() returns only the first message line alongside the status', ({ expect }) => {
    const exception = new ServiceException({
      cause: new Error('not found'),
      code: 'E_NOT_FOUND',
      message: 'missing',
      position: 'repo.find',
      status: 404
    })

    expect(exception.toRes()).toEqual([{ code: 'E_NOT_FOUND', message: 'missing' }, 404])
  })

  test('toPlainObject() includes the inherited fields plus status', ({ expect }) => {
    const cause = new Error('not found')
    const exception = new ServiceException({
      cause,
      code: 'E_NOT_FOUND',
      message: 'missing',
      position: 'repo.find',
      status: 404
    })

    expect(exception.toPlainObject({ requestId: 'abc' })).toEqual({
      cause,
      code: 'E_NOT_FOUND',
      message: 'missing\nnot found',
      meta: { requestId: 'abc' },
      position: 'repo.find',
      status: 404
    })
  })

  test('fromException() defaults the status to 500 when none is given', ({ expect }) => {
    const original = new Exception({ cause: new Error('boom'), code: 'E1', position: 'pos1' })

    const wrapped = ServiceException.fromException(original, {})

    expect(wrapped.status).toBe(500)
  })

  test('fromException() uses the given status when provided', ({ expect }) => {
    const original = new Exception({ cause: new Error('boom'), code: 'E1', position: 'pos1' })

    const wrapped = ServiceException.fromException(original, { status: 403 })

    expect(wrapped.status).toBe(403)
  })
})

describe('withLog', (test) => {
  test('logs the plain object representation with the given meta', ({ expect }) => {
    const exception = new Exception({ cause: new Error('boom'), code: 'E', message: 'failed', position: 'p' })
    const logged: unknown[] = []

    withLog(exception, (params) => logged.push(params), { requestId: 'abc' })

    expect(logged).toEqual([exception.toPlainObject({ requestId: 'abc' })])
  })

  test('returns the same exception instance it was given', ({ expect }) => {
    const exception = new Exception({ cause: new Error('boom'), code: 'E', message: 'failed', position: 'p' })

    const result = withLog(exception, () => {})

    expect(result).toBe(exception)
  })
})
