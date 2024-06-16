import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweeRequestBody } from '~/models/requests/Tweet.reques'
import { TokenPayload } from '~/models/requests/Users.requests'
import tweetService from '~/services/tweets.services'

export const crateTweetController = async (req: Request<ParamsDictionary, any, TweeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    message: 'create tweet success',
    result: result
  })
}
