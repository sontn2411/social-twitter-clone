import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enum'

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface RegisterResBody {
  name: string
  email: string
  password: string
  confirmPassword: string
  date_of_birth: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}
