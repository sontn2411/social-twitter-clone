import express from 'express'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  registerController,
  resendVerifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  verifyForgotPasswordValidator
} from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const routerUser = express.Router()

/**
 * Description. Register a new user
 * @param {*} path /register
 * @param {*} Method POST
 * @param {*} Body { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
routerUser.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description. Login user
 * @param {*} path /login
 * @param {*} Method POST
 * @param {*} Body { email: string, password: string}
 */
routerUser.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description. verify email when user client click  on the link in email
 * @param {*} path /verify-email
 * @param {*} Method POST
 * @param {*} Header { Authorization: Bearer <access_token> }
 * @param {*} Body  { verify_email_token: string }
 */
routerUser.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))

/**
 * Description. Resend verify email
 * @param {*} path /resend-verify-email
 * @param {*} Method POST
 * @param {*} Header { Authorization: Bearer <access_token> }
 * @param {*} Body  {}
 */
routerUser.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description. Submit email to reset password ,send email to user
 * @param {*} path /forgot-password
 * @param {*} Method POST
 * @param {*} Body  {email: string}
 */
routerUser.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description. Verify link in email to reset password
 * @param {*} path /verify-forgot-password
 * @param {*} Method POST
 * @param {*} Body  {forgot_password_token: string}
 */
routerUser.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

export default routerUser
