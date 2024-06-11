import { ObjectId } from 'mongodb'
import { TweeType, TweetAudience } from '~/constants/enum'
import { Media } from '../Others'

export interface TweeRequestBody {
  type: TweeType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
}
