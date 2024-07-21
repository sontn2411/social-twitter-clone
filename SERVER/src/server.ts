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
import bookmarkRouter from './routes/bookmart.routes'
import likeRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import cors from 'cors'
import '~/utils/mail'
import '~/utils/s3'
import conversationRouter from './routes/conversation.routes'
import initSocket from './utils/socket'
// import '~/utils/faker'

const app = express()
const httpServer = createServer(app)

const START_SERVER = async () => {
  initFolder()

  app.use(express.json())
  app.use(cors())
  app.use('/medias', mediasRouter)
  app.use('/users', routerUser)
  app.use('/tweet', tweetRouter)
  app.use('/bookmarks', bookmarkRouter)
  app.use('/likes', likeRouter)
  app.use('/conversation', conversationRouter)
  app.use('/search', searchRouter)
  app.use('/static', staticRouter)
  app.use(defaultErrorHandle)
  app.use('/static/videos', express.static(UPLOAD_VIDEO_DIR))

  exitHook(() => {
    databaseService.closeDb()
  })

  initSocket(httpServer)

  httpServer.listen(env.APP_PORT, () => {
    console.log(`Hello Phong phan, I am running at ${env.APP_HOST}:${env.APP_PORT}`)
  })
}

// ========|| DATABASE SERVER || ===========//
databaseService
  .connect()
  .then(() => console.log('connected to mongodb database'))
  .then(() => START_SERVER())
  .then(() => {
    databaseService.indexUses(),
      databaseService.indexRefreshToken(),
      databaseService.indexFollower(),
      databaseService.indexTweets()
  })

  .catch((error) => {
    console.log('Error when connect to mongodb database')
    process.exit(0)
  })
