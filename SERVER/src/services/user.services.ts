import { RegisterResBody } from '~/models/requests/Users.requests'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { signToken } from '~/utils/jwt'
import { env } from '~/config/environment'
import { ObjectId } from 'mongodb'
import { verify } from 'crypto'
import { RefeshToken } from '~/models/schemas/PefeshToken.schema'

class UserService {
  private signAccsessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccsesToken,
        verify
      },
      options: {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
      },
      secretOrPrivateKey: env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signPrefeshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccsesToken,
        verify
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      },
      secretOrPrivateKey: process.env.JWT_SECRET_RERFESH_TOKEN as string
    })
  }

  private acsessTokenAndFrefeshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccsessToken({ user_id, verify }), this.signPrefeshToken({ user_id, verify })])
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      options: {
        expiresIn: env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      },
      secretOrPrivateKey: env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  async checkMailExit(email: string) {
    const isEmail = await databaseService.users.findOne({ email })
    return Boolean(isEmail)
  }
  async register(payload: RegisterResBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user_${user_id}`,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [accses_token, refresh_token] = await this.acsessTokenAndFrefeshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refeshTokens.insertOne(
      new RefeshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    console.log('email_verify_token', email_verify_token)
    return {
      accses_token,
      refresh_token
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.acsessTokenAndFrefeshToken({ user_id, verify: UserVerifyStatus.Verified }),
      await databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
}

const userService = new UserService()

export default userService
