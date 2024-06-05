import express from 'express'
import { emailVerifyController, registerController } from '~/controllers/users.controllers'
import { accessTokenValidator, emailVerifyTokenValidator, registerValidator } from '~/middlewares/user.middlewares'
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
 * Description. verify email when user client click  on the link in email
 * @param {*} path /verify-email
 * @param {*} Method POST
 * @param {*} Header { Authorization: Bearer <access_token> }
 * @param {*} Body  { verify_email_token: string }
 */
routerUser.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))

export default routerUser
