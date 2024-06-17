import { Router } from 'express'
import { serverImageController, serverVideoStreamController } from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/images/:name', serverImageController)
staticRouter.get('/videos-stream/:name', serverVideoStreamController)

export default staticRouter
