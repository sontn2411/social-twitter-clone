import express from 'express'
import {
  emailVerifyController,
  followerController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifyForgotPasswordValidator,
  verifyUserValidatior
} from '~/middlewares/user.middlewares'
import { updateMeReqbody } from '~/models/requests/Users.requests'
import { wrapRequestHandler } from '~/utils/handlers'
const routerUser = express.Router()

/**
 * Description. Register a new user
 * @path /register
 * @Method POST
 * @Body { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
routerUser.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description. Login user
 * @path /login
 * @Method POST
 * @Body { email: string, password: string}
 */
routerUser.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description. verify email when user client click  on the link in email
 * @path /verify-email
 * @Method POST
 * @Header Header { Authorization: Bearer <access_token> }
 * @Body { verify_email_token: string }
 */
routerUser.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))

/**
 * Description. Resend verify email
 * @path /resend-verify-email
 * @Method  POST
 * @Header  Header { Authorization: Bearer <access_token> }
 * @Body  {}
 */
routerUser.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description. Submit email to reset password ,send email to user
 * @path /forgot-password
 * @Method  POST
 * @Body {email: string}
 */
routerUser.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description. Verify link in email to reset password
 * @path /verify-forgot-password
 * @Method POST
 * @Body {forgot_password_token: string}
 */
routerUser.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description. reset password
 * @path /reset-password
 * @Method POST
 * @Body {forgot_password_token: string, password: string, confirm_password: string}
 */
routerUser.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description. get me
 * @path /getMe
 * @Method  GET
 * @Header Header { Authorization: Bearer <access_token> }
 */
routerUser.get('/getMe', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description. update-me
 * @path /update-me
 * @Method PATH
 * @Header { Authorization: Bearer <access_token> }
 * @body userSchema
 */
routerUser.patch(
  '/update-me',
  accessTokenValidator,
  verifyUserValidatior,
  updateMeValidator,
  filterMiddleware<updateMeReqbody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'website'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description. get profile user
 * @path  /:username
 * @Method GET
 * @Header { Authorization: Bearer <access_token> }
 */
routerUser.get('/:username', wrapRequestHandler(getProfileController))

/**
 * Description. follow
 * @path  /follow
 * @Method GET
 * @Header { Authorization: Bearer <access_token> }
 * @body  {followed_user_id: string}
 */
routerUser.post(
  '/follow',
  accessTokenValidator,
  verifyUserValidatior,
  followValidator,
  wrapRequestHandler(followerController)
)

export default routerUser
