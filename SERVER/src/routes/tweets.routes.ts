import { Router } from 'express'
import {
  crateTweetController,
  getChildrenTweetController,
  getNewFeedController,
  getTweetController
} from '~/controllers/tweets.Controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationTweetValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidatior } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { isLoggedValidation } from '../middlewares/user.middlewares'

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

/**
 * Description. create tweets
 * @path  /:tweet_id
 * @Method GET
 * @Header { Authorization: Bearer <access_token> }
 */
tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isLoggedValidation(accessTokenValidator),
  isLoggedValidation(verifyUserValidatior),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * Description. Get Tweet Children
 * @path  /:tweet_id/children
 * @Method GET
 * @Header { Authorization: Bearer <access_token> }
 * @Query: {limit: number, page:number, tweet_type: TweetType }
 */
tweetRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  getTweetChildrenValidator,
  paginationTweetValidator,
  isLoggedValidation(accessTokenValidator),
  isLoggedValidation(verifyUserValidatior),
  audienceValidator,
  wrapRequestHandler(getChildrenTweetController)
)

/**
 * Description. Get new feed
 * @path  /
 * @Method GET
 * @Header { Authorization: Bearer <access_token> }
 * @Query: {limit: number, page:number }
 */
tweetRouter.get(
  '/',
  paginationTweetValidator,
  accessTokenValidator,
  verifyUserValidatior,
  wrapRequestHandler(getNewFeedController)
)

export default tweetRouter
