import { NextFunction, Response, Request } from 'express'
import { omit } from 'lodash'
import HTTPSTATUS from '~/constants/httpStatus'
import { errorWithStatus } from '~/models/errors'

const defaultErrorHandle = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err instanceof errorWithStatus)
  if (err instanceof errorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, ['stack'])
  })
}

export default defaultErrorHandle
