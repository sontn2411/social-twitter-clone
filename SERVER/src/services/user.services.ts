import { RegisterResBody } from '~/models/requests/Users.requests'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema'

class UserService {
  async checkMailExit(email: string) {
    const isEmail = await databaseService.users.findOne({ email })
    return Boolean(isEmail)
  }
  async register(payload: RegisterResBody) {
    await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
  }
}

const userService = new UserService()

export default userService
