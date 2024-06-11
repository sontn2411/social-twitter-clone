import { Router } from 'express'
import { crateTweetController } from '~/controllers/tweets.Controllers'
import { createTweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidatior } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetRouter = Router()
/**
 * Description. create tweets
 * @path  /follower/user_id
 * @Method POST
 * @Header { Authorization: Bearer <access_token> }
 * @body {TweeRequestBody}
 */
tweetRouter.post(
  '/create-tweet',
  accessTokenValidator,
  verifyUserValidatior,
  createTweetValidator,
  wrapRequestHandler(crateTweetController)
)

export default tweetRouter
