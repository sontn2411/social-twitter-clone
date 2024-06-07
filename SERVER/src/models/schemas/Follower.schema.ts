import { ObjectId } from 'mongodb'

interface RefeshTokenType {
  _id?: ObjectId
  user_id: ObjectId
  created_at?: Date
  follower_user_id: ObjectId
}

export class Follower {
  _id?: ObjectId
  user_id: ObjectId
  created_at: Date
  follower_user_id: ObjectId
  constructor({ _id, user_id, created_at, follower_user_id }: RefeshTokenType) {
    this._id = _id
    this.user_id = user_id
    this.created_at = created_at || new Date()
    this.follower_user_id = follower_user_id
  }
}
