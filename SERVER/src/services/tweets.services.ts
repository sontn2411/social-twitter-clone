import { TweeRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweets from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import { hash } from 'crypto'
import Hashtag from '~/models/schemas/Hashtag.schema'

class TweetService {
  async checkAndCreateHashtag(hashTags: string[]) {
    const hashTagsDocument = await Promise.all(
      hashTags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashTagsDocument.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }
  async createTweet(user_id: string, body: TweeRequestBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweets({
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )

    const tweets = await databaseService.tweets.findOne({ _id: result.insertedId })

    return tweets
  }
}

const tweetService = new TweetService()

export default tweetService
