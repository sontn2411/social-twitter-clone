import { Router } from 'express'
import { serverImageController, serverVideoController } from '~/controllers/medias.contollers'

const staticRouter = Router()

staticRouter.get('/images/:name', serverImageController)
staticRouter.get('/videos/:name', serverVideoController)

export default staticRouter
