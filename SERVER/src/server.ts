import express from 'express'
import databaseService from './services/database.services'
import exitHook from 'async-exit-hook'
import { env } from './config/environment'
import routerUser from './routes/users.routes'
import defaultErrorHandle from './middlewares/errors.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routes'
import { UPLOAD_VIDEO_DIR } from './constants/upload'
import tweetRouter from './routes/tweets.routes'
const app = express()

const START_SERVER = async () => {
  app.listen(env.APP_PORT, () => {
    console.log(`Hello Phong phan, I am running at ${env.APP_HOST}:${env.APP_PORT}`)
  })
  initFolder()
  app.use(express.json())
  app.use('/medias', mediasRouter)
  app.use('/users', routerUser)
  app.use('/tweet', tweetRouter)
  app.use('/static', staticRouter)
  app.use(defaultErrorHandle)
  app.use('/static/videos', express.static(UPLOAD_VIDEO_DIR))

  exitHook(() => {
    databaseService.closeDb()
  })
}

// ========|| DATABASE SERVER || ===========//
databaseService
  .connect()
  .then(() => console.log('connected to mongodb database'))
  .then(() => START_SERVER())
  .then(() => {
    databaseService.indexUses(), databaseService.indexRefreshToken(), databaseService.indexFollower()
  })

  .catch((error) => {
    console.log('Error when connect to mongodb database')
    process.exit(0)
  })
