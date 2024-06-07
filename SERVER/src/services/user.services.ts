import { RegisterResBody, updateMeReqbody } from '~/models/requests/Users.requests'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { signToken } from '~/utils/jwt'
import { env } from '~/config/environment'
import { ObjectId } from 'mongodb'
import { verify } from 'crypto'
import { RefeshToken } from '~/models/schemas/PefeshToken.schema'
import USER_MESSAGES from '~/constants/messages'
import { errorWithStatus } from '~/models/errors'
import HTTPSTATUS from '~/constants/httpStatus'
import { Follower } from '~/models/schemas/Follower.schema'

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

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      },
      secretOrPrivateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
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

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accses_token, refresh_token] = await this.acsessTokenAndFrefeshToken({ user_id, verify })
    await databaseService.refeshTokens.insertOne(
      new RefeshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
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

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Verified })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      message: USER_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    // Gửi lên email kèm đường link  đến email người dùng
    console.log('forgot_pasword', forgot_password_token)
    return {
      forgot_password_token
    }
  }

  async resentPassword({ user_id, password }: { user_id: string; password: string }) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async updateMe(user_id: string, payload: updateMeReqbody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as updateMeReqbody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    return user
  }
  async getProfile(username: string) {
    const profile = await databaseService.users.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (profile === null) {
      throw new errorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTPSTATUS.NOT_FOUND
      })
    }
    return profile
  }
  async follower(user_id: string, followed_user_id: string) {
    const follower = await databaseService.follower.findOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(followed_user_id)
    })

    if (follower === null) {
      await databaseService.follower.insertOne(
        new Follower({ user_id: new ObjectId(user_id), follower_user_id: new ObjectId(followed_user_id) })
      )
      return {
        message: USER_MESSAGES.FOLLOW_SUCCESS
      }
    }
    return {
      message: USER_MESSAGES.ALREADY_FOLLOW
    }
  }
}

const userService = new UserService()

export default userService
