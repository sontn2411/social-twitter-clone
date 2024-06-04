import { checkSchema } from 'express-validator'
import USER_MESSAGES from '~/constants/messages'
import userService from '~/services/user.services'
import { confirmPasswordSchema, dateOfBirthSchema, nameSchema, passwordSchema } from '~/utils/schemaValidationOptions'
import { validate } from '~/utils/validate'

/**
 * @param RegisterValidator
 */
export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value: string) => {
            const isEmailExit = await userService.checkMailExit(value)
            if (isEmailExit) {
              throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)
