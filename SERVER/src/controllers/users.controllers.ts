import { NextFunction, Request, Response } from 'express'
import USER_MESSAGES from '~/constants/messages'
import { RegisterResBody } from '~/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import userService from '~/services/user.services'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterResBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.status(200).json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
}
