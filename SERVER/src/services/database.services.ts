import { Collection, Db, MongoClient } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { env } from '~/config/environment'
import { RefeshToken } from '~/models/schemas/PefeshToken.schema'
import { Follower } from '~/models/schemas/Follower.schema'
import Tweets from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversation.schema'

const uri = `mongodb+srv://${env.DB_USERNAME}:${env.DB_PASSWORD}@cluster0.wga91f9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.log('Error', err)
      throw err
    }
  }
  async indexUses() {
    const exists = await this.users.indexExists(['email_1_password_1', 'username_1', 'email_1'])
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async indexRefreshToken() {
    const exists = await this.users.indexExists(['token_1', 'exp_1'])
    if (!exists) {
      this.refeshTokens.createIndex({ token: 1 })
      this.refeshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }
  async indexFollower() {
    const exists = await this.users.indexExists(['user_id_1_followed_user_id_1'])
    if (!exists) {
      this.follower.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }
  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text'])
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(env.DB_USER_COLLECTION as string)
  }
  get refeshTokens(): Collection<RefeshToken> {
    return this.db.collection(env.BD_REFRESH_TOKENS_COLLECTION as string)
  }
  get follower(): Collection<Follower> {
    return this.db.collection(env.DB_FOLOWER_COLLECTION as string)
  }
  get tweets(): Collection<Tweets> {
    return this.db.collection(env.DB_TWEETS_COLLECTION as string)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(env.DB_HASHTAGS_COLLECTION as string)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(env.DB_BOOKMARKS_COLLECTION as string)
  }
  get likes(): Collection<Like> {
    return this.db.collection(env.DB_LIKE_COLLECTION as string)
  }
  get conversations(): Collection<Conversation> {
    return this.db.collection(env.DB_CONVERSATIONS_COLLECTION as string)
  }
  async closeDb() {
    await this.client.close()
  }
}

const databaseService = new DatabaseService()

export default databaseService
