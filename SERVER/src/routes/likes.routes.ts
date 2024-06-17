import { Router } from 'express'
import { unbookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { likeTweetController } from '~/controllers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidatior } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likeRouter = Router()

/**
 * Description. create tweets
 * @path  ""
 * @Method POST
 * @Header { Authorization: Bearer <access_token> }
 * @body {LikeTweetReqBody}
 */
likeRouter.post(
  '',
  accessTokenValidator,
  verifyUserValidatior,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)
/**
 * Description. create tweets
 * @path   /likes/:tweet_id
 * @Method DELETE
 * @Header { Authorization: Bearer <access_token> }
 * @body {likeTweetReqBody}
 */

likeRouter.delete(
  '/likes/:tweet_id',
  accessTokenValidator,
  verifyUserValidatior,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default likeRouter
