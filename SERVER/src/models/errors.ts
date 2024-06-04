import HTTPSTATUS from '~/constants/httpStatus'
import USER_MESSAGES from '~/constants/messages'

type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class errorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityErorr extends errorWithStatus {
  errors: ErrorType
  constructor({ message, errors }: { message?: string; errors: ErrorType }) {
    super({ message: USER_MESSAGES.VALIDATION_ERROR, status: HTTPSTATUS.UNPROCCESSABLE_ENTITY })
    this.errors = errors
  }
}
