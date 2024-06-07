import { ParamSchema } from 'express-validator'
import HTTPSTATUS from '~/constants/httpStatus'
import USER_MESSAGES from '~/constants/messages'
import { errorWithStatus } from '~/models/errors'
import { verifyToken } from './jwt'
import { capitalize } from 'lodash'
import { JsonWebTokenError } from 'jsonwebtoken'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'

export const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },

  isLength: {
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  }
}

export const confirmPasswordSchema: ParamSchema = {
  isString: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1
    },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

export const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.NAME_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

export const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}

export const forgotPasswordToken: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new errorWithStatus({
          message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTPSTATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPrivateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })

        const { user_id } = decoded_forgot_password_token
        req.decoded_forgot_password_token = decoded_forgot_password_token

        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

        if (user === null) {
          throw new errorWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTPSTATUS.UNAUTHORIZED
          })
        }

        if (user.forgot_password_token !== value) {
          throw new errorWithStatus({
            message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTPSTATUS.UNAUTHORIZED
          })
        }
      } catch (error) {
        throw new errorWithStatus({
          message: capitalize((error as JsonWebTokenError).message),
          status: HTTPSTATUS.UNAUTHORIZED
        })
      }
      return true
    }
  }
}

export const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USER_MESSAGES.IMAGE_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 500
    },
    errorMessage: USER_MESSAGES.IMAGE_LENGTH
  }
}

export const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new errorWithStatus({
          message: USER_MESSAGES.INVALID_USER_ID,
          status: HTTPSTATUS.NOT_FOUND
        })
      }
      const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })

      if (followed_user === null) {
        throw new errorWithStatus({
          message: USER_MESSAGES.USER_NOT_FOUND,
          status: HTTPSTATUS.NOT_FOUND
        })
      }
    }
  }
}
