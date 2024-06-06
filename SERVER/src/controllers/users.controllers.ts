import { NextFunction, Request, Response } from 'express'
import USER_MESSAGES from '~/constants/messages'
import {
  LoginResBody,
  RegisterResBody,
  TokenPayload,
  VerifyEmailReqBody,
  forgotPasswordReqBody,
  forgotPasswordTokenReqBody
} from '~/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import userService from '~/services/user.services'
import databaseService from '~/services/database.services'
import HTTPSTATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { verify } from 'crypto'
import { UserVerifyStatus } from '~/constants/enum'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterResBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.status(200).json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginResBody>,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.json({
    messages: USER_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTPSTATUS.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }

  // Đã verify rồi thì sẽ không báo lỗi
  // mà sẽ trả về status ok với message là đã verify trước đó rồi
  if (user.email_verify_token === '') {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await userService.verifyEmail(user_id)
  return res.json({
    message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTPSTATUS.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await userService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, forgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify: verify })
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, forgotPasswordTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json('kgofdgkdfl;')
}
