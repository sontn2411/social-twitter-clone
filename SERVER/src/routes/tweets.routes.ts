import { Router } from 'express'
import { crateTweetController, getChildrenTweetController, getTweetController } from '~/controllers/tweets.Controllers'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
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
  isLoggedValidation(accessTokenValidator),
  isLoggedValidation(verifyUserValidatior),
  audienceValidator,
  wrapRequestHandler(getChildrenTweetController)
)

export default tweetRouter
