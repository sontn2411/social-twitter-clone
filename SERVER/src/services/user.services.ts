import { RegisterResBody, updateMeReqbody } from '~/models/requests/Users.requests'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { signToken, verifyToken } from '~/utils/jwt'
import { env } from '~/config/environment'
import { ObjectId } from 'mongodb'
import { RefeshToken } from '~/models/schemas/PefeshToken.schema'
import { USER_MESSAGES } from '~/constants/messages'
import { errorWithStatus } from '~/models/errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Follower } from '~/models/schemas/Follower.schema'
import axios from 'axios'

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

  private signPrefeshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.AccsesToken,
          verify,
          exp
        },
        secretOrPrivateKey: env.JWT_SECRET_RERFESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccsesToken,
        verify
      },
      options: {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
      },
      secretOrPrivateKey: env.JWT_SECRET_RERFESH_TOKEN as string
    })
  }

  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({
      token: refreshToken,
      secretOrPrivateKey: env.JWT_SECRET_RERFESH_TOKEN as string
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
        expiresIn: env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      },
      secretOrPrivateKey: env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const data = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data.data as {
      id: string
      email: string
      given_name: string
      family_name: string
      picture: string
      locale: string
      verified_email: boolean
      name: string
    }
  }
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  async oauth(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const infoUser = await this.getGoogleUserInfo(access_token, id_token)
    if (!infoUser.verified_email) {
      throw new errorWithStatus({
        message: USER_MESSAGES.EMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const user = await databaseService.users.findOne({ email: infoUser.email })

    if (user) {
      const [access_token, refesh_tokens] = await this.acsessTokenAndFrefeshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })

      const { exp, iat } = await this.decodeRefreshToken(refesh_tokens)
      await databaseService.refeshTokens.insertOne(
        new RefeshToken({ user_id: user._id, token: refesh_tokens, exp, iat })
      )
      return {
        access_token,
        refresh_token: refesh_tokens,
        newUser: 0,
        verify: user.verify
      }
    } else {
      const password = Math.random().toString(36).substring(2, 15)
      const data = this.register({
        email: infoUser.email,
        name: infoUser.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirmPassword: password
      })

      return { ...data, newUser: 1, verify: UserVerifyStatus.Verified }
    }
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
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refeshTokens.insertOne(
      new RefeshToken({ user_id: new ObjectId(user_id), token: refresh_token, exp, iat })
    )
    console.log('email_verify_token', email_verify_token)
    return {
      accses_token,
      refresh_token
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accses_token, refresh_token] = await this.acsessTokenAndFrefeshToken({ user_id, verify })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refeshTokens.insertOne(
      new RefeshToken({ user_id: new ObjectId(user_id), token: refresh_token, exp, iat })
    )
    return {
      accses_token,
      refresh_token
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccsessToken({ user_id, verify }),
      this.signPrefeshToken({ user_id, verify, exp }),
      databaseService.users.deleteOne({ token: refresh_token })
    ])
    const decode_refeshToken = await this.decodeRefreshToken(new_refresh_token)
    await databaseService.refeshTokens.insertOne(
      new RefeshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        exp: decode_refeshToken.exp,
        iat: decode_refeshToken.iat
      })
    )

    return {
      new_access_token,
      new_refresh_token
    }
  }

  async logout(refresh_token: string) {
    const result = await databaseService.refeshTokens.deleteOne({ token: refresh_token })
    console.log(result, 'result service')
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESS
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
        status: HTTP_STATUS.NOT_FOUND
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
  async unfollower(user_id: string, followed_user_id: string) {
    const follower = await databaseService.follower.findOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      return {
        message: USER_MESSAGES.ALREADY_UNFOLLOW
      }
    }

    await databaseService.follower.deleteOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USER_MESSAGES.UNFOLLOW_SUCCESS
    }
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
}

const userService = new UserService()

export default userService
