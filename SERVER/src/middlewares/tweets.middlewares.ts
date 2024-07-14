import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { errorWithStatus } from '~/models/errors'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validate'
import { filterMiddleware } from './common.middlewares'
import { NextFunction, Request, Response } from 'express'
import Tweets from '~/models/schemas/Tweet.schema'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetTypes = numberEnumToArray(TweetType)
const TweetAudiences = numberEnumToArray(TweetAudience)
const MediaTypes = numberEnumToArray(MediaType)
export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: TWEETS_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [TweetAudiences],
        errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          // nếu type là Retweet,Comment,QuoteTweet thì parent_id phải là tweet_id của tweet cha
          console.log(value)
          console.log(value)
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          // Nếu type là tweet thi parent_id phải là null
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashTags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          // nếu type là comment , QuoteTweet, Tweet và không có mentions và hashTags thì content phải string và không được rỗng
          if (
            [TweetType.QuoteTweet, TweetType.Comment, TweetType.Tweet].includes(type) &&
            isEmpty(hashTags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          // nếu type là tweet thì content phải " "
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }

          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yêu cầu mỗi phần tử tỏng array là string
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yêu cầu mỗi phần tử tỏng array là user_id
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yêu cầu mỗi phần tử tỏng array là media object
          if (
            !value.every((item: any) => {
              return typeof item.url !== 'string' || !MediaTypes.includes(item.type)
            })
          ) {
            throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)

export const tweetIdValidator = validate(
  checkSchema({
    tweet_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new errorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: TWEETS_MESSAGES.INVALID_TWEET_ID
            })
          }

          const [tweets] = await databaseService.tweets
            .aggregate<Tweets>([
              {
                $match: {
                  _id: new ObjectId(value)
                }
              },
              {
                $lookup: {
                  from: 'hashtags',
                  localField: 'hashtags',
                  foreignField: '_id',
                  as: 'hashtags'
                }
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'mentions',
                  foreignField: '_id',
                  as: 'mentions'
                }
              },
              {
                $addFields: {
                  mentions: {
                    $map: {
                      input: '$mentions',
                      as: 'mention',
                      in: {
                        _id: '$$mention._id',
                        name: '$$mention.name',
                        username: '$$mention.username',
                        email: '$$mention.email'
                      }
                    }
                  }
                }
              },
              {
                $lookup: {
                  from: 'bookmarks',
                  localField: '_id',
                  foreignField: 'tweet_id',
                  as: 'bookmarks'
                }
              },
              {
                $lookup: {
                  from: 'like',
                  localField: '_id',
                  foreignField: 'tweet_id',
                  as: 'likes'
                }
              },
              {
                $lookup: {
                  from: 'tweets',
                  localField: '_id',
                  foreignField: 'parent_id',
                  as: 'tweet_children'
                }
              },
              {
                $addFields: {
                  bookmarks: {
                    $size: '$bookmarks'
                  },
                  likes: {
                    $size: '$likes'
                  },
                  retweet_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TweetType.Retweet]
                        }
                      }
                    }
                  },
                  comment_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TweetType.Comment]
                        }
                      }
                    }
                  },
                  quote_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TweetType.QuoteTweet]
                        }
                      }
                    }
                  }
                }
              }
            ])
            .toArray()

          if (!tweets) {
            throw new errorWithStatus({
              status: HTTP_STATUS.NOT_FOUND,
              message: TWEETS_MESSAGES.TWEET_NOT_FOUND
            })
          }

          ;(req as Request).tweets = tweets as any
          return true
        }
      }
    }
  })
)

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweets as Tweets
  if (tweet.audience === TweetAudience.TwitterCricle) {
    // kiểm tra người xem tweet này đã đăng nhập hay chưa
    if (!req.decoded_authorization) {
      throw new errorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      })
    }
  }
  const author = await databaseService.users.findOne({
    _id: new ObjectId(tweet.user_id)
  })

  // kiểm tra tài khoản tác giả có ổn (bị khóa hay xóa chưa)
  if (!author || author.verify === UserVerifyStatus.Banned) {
    throw new errorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  // kiểm tra người xem tweet này có trong Twitter Cricle của tác giả hay không
  const { user_id } = req.decoded_authorization

  const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
  //nếu bạn không phải là tác giả và không nằm trong twitter circle thì quăng lỗi
  if (!isInTwitterCircle && !author._id.equals(user_id)) {
    throw new errorWithStatus({
      status: HTTP_STATUS.FORBIDDEN,
      message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
    })
  }
  next()
})

export const getTweetChildrenValidator = validate(
  checkSchema({
    tweet_type: {
      isIn: {
        options: [TweetType],
        errorMessage: TWEETS_MESSAGES.INVALID_TYPE
      }
    }
  })
)

export const paginationTweetValidator = validate(
  checkSchema({
    limit: {
      isNumeric: true,
      custom: {
        options: (value, { req }) => {
          const num = Number(value)
          if (num < 1 || num > 100) {
            throw new Error('LIMIT_SHOULD_BE_BETWEEN_1_AND_100')
          }
          return true
        }
      }
    },
    page: {
      isNumeric: true,
      custom: {
        options: (value, { req }) => {
          const num = Number(value)
          if (num < 1) {
            throw new Error('PAGE_SHOULD_BE_GREATER_THAN_OR_EQUAL_TO_1')
          }
          return true
        }
      }
    }
  })
)
