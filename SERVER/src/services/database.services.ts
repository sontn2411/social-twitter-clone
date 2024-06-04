import { Collection, Db, MongoClient } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import { env } from '~/config/environment'

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wga91f9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
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
  get users(): Collection<User> {
    return this.db.collection(env.DB_USER_COLLECTION as string)
  }
  async closeDb() {
    await this.client.close()
  }
}

const databaseService = new DatabaseService()

export default databaseService
