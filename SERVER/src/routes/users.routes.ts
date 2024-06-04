import express from 'express'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const routerUser = express.Router()

/**
 * Description. Register a new user
 * @param {*} path /register
 * @param {*} Method: POST
 * @param {*} Body { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
routerUser.post('/register', registerValidator, wrapRequestHandler(registerController))

export default routerUser
