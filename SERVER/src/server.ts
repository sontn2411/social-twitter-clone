import express from 'express'
import databaseService from './services/database.services'
import exitHook from 'async-exit-hook'
import { env } from './config/environment'
const app = express()

const START_SERVER = async () => {
  app.listen(env.APP_PORT, () => {
    console.log(`Hello Phong phan, I am running at ${env.APP_HOST}:${env.APP_PORT}`)
  })

  // =======|| CLOSE DB WHEN ERROR || =======//
  exitHook(() => {
    databaseService.closeDb()
  })
}

// ========|| DATABASE SERVER || ===========//
databaseService
  .connect()
  .then(() => console.log('connected to mongodb database'))
  .then(() => START_SERVER())
  .catch((error) => {
    console.log('Error when connect to mongodb database')
    process.exit(0)
  })
