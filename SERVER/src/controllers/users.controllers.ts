import { NextFunction, Request, Response } from 'express'
import USER_MESSAGES from '~/constants/messages'
import {
  ChangePasswordReqBody,
  FollwReqBody,
  LoginResBody,
  RegisterResBody,
  TokenPayload,
  UnfollowReqParams,
  VerifyEmailReqBody,
  forgotPasswordReqBody,
  forgotPasswordTokenReqBody,
  getProfileReqParam,
  resetPasswordReqBody,
  updateMeReqbody
} from '~/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import userService from '~/services/user.services'
import databaseService from '~/services/database.services'
import HTTPSTATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { verify } from 'crypto'
import { UserVerifyStatus } from '~/constants/enum'
import { body } from 'express-validator'

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

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  console.log(code)
  const result = (await userService.oauth(code as string)) as {
    access_token: string
    refresh_token: string
    newUser: number
    verify: UserVerifyStatus
  }
  const urlRedirect = `${process.env.CLIENT_REDERECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)
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
  return res.json({
    message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const Result = await userService.resentPassword({ user_id, password })
  return res.json(Result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getMe(user_id)
  return res.json({
    message: USER_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, never, updateMeReqbody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await userService.updateMe(user_id, body)
  return res.json({
    message: USER_MESSAGES.UPDATE_ME_SUCCESS,
    result: result
  })
}

export const getProfileController = async (
  req: Request<ParamsDictionary, never, getProfileReqParam>,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params
  const profile = await userService.getProfile(username)
  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result: profile
  })
}

export const followerController = async (
  req: Request<ParamsDictionary, never, FollwReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await userService.follower(user_id, followed_user_id)
  return res.json(result)
}

export const unfollowerController = async (
  req: Request<ParamsDictionary, never, UnfollowReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: unfollowed_user_id } = req.params
  const result = await userService.unfollower(user_id, unfollowed_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, never, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userService.changePassword(user_id, password)
  return res.json(result)
}
