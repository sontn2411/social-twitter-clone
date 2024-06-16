import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface LoginResBody {
  refresh_token: string
}

export interface LogoutResBody {
  refresh_token: string
}

export interface refreshTokenResBody {
  refresh_token: string
}

export interface forgotPasswordReqBody {
  email: string
}

export interface forgotPasswordTokenReqBody {
  forgot_password_token: string
}

export interface resetPasswordReqBody {
  password: string
  confirm_password: string
  forgotPasswordToken: string
}

export interface RegisterResBody {
  name: string
  email: string
  password: string
  confirmPassword: string
  date_of_birth: string
}

export interface updateMeReqbody {
  name?: string
  date_of_birth?: string
  bio: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface getProfileReqParam {
  username: string
}

export interface UnfollowReqParams {
  user_id: string
}

export interface FollwReqBody {
  followed_user_id: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}
