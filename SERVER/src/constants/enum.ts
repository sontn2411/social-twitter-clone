export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccsesToken,
  RefeshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TwitterCricle
}

export enum PeopleFollow {
  Anyone = '0',
  Following = '1'
}
