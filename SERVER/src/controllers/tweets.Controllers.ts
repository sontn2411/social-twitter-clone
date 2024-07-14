import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweeRequestBody, TweetParam, TweetQuery } from '~/models/requests/Tweet.requests'
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

export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweets,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: 'get tweet success',
    result: tweet
  })
}

export const getChildrenTweetController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type)
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id
  const { tweets, total } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })
  return res.json({
    message: 'get children tweet success',
    result: {
      tweets: tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}

export const getNewFeedController = async (req: Request<ParamsDictionary, any, any, TweetQuery>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await tweetService.getNewFeeds({ user_id, limit, page })
  return res.json({
    message: 'get new feed success',
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
