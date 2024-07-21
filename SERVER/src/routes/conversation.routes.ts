import { Router } from 'express'
import { getConversationController } from '~/controllers/conversation.controller'
import { paginationTweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, getConversationsValidator, verifyUserValidatior } from '~/middlewares/user.middlewares'

const conversationRouter = Router()

conversationRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifyUserValidatior,
  paginationTweetValidator,
  getConversationsValidator,
  getConversationController
)

export default conversationRouter
