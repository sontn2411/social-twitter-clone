import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidatior } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarkRouter = Router()

/**
 * Description. create tweets
 * @path  ""
 * @Method POST
 * @Header { Authorization: Bearer <access_token> }
 * @body {BookmarkTweetReqBody}
 */
bookmarkRouter.post(
  '',
  accessTokenValidator,
  verifyUserValidatior,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description. create tweets
 * @path   /tweets/:tweet_id
 * @Method DELETE
 * @Header { Authorization: Bearer <access_token> }
 * @body {BookmarkTweetReqBody}
 */

bookmarkRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifyUserValidatior,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarkRouter
