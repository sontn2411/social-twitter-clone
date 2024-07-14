import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { searchValidator } from '~/middlewares/search.middlewares'
import { accessTokenValidator, verifyUserValidatior } from '~/middlewares/user.middlewares'

const searchRouter = Router()

searchRouter.get('/', accessTokenValidator, verifyUserValidatior, searchValidator, searchController)

export default searchRouter
