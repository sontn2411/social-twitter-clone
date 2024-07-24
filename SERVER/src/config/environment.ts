import 'dotenv/config'

export const env = {
  APP_PORT: process.env.APP_PORT,
  APP_HOST: process.env.APP_HOST,
  HOST_PRODUCTION: process.env.HOST_PRODUCTION,
  CLIENT_URL: process.env.CLIENT_URL,
  //====== || COLLECTION DB || ========//
  MONGODB_URL: process.env.MONGODB_URL,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_NAME: process.env.DB_NAME,
  DB_USER_COLLECTION: process.env.DB_USER_COLLECTION,
  BD_REFRESH_TOKENS_COLLECTION: process.env.BD_REFRESH_TOKENS_COLLECTION,
  DB_FOLOWER_COLLECTION: process.env.DB_FOLOWER_COLLECTION,
  DB_TWEETS_COLLECTION: process.env.DB_TWEETS_COLLECTION,
  DB_HASHTAGS_COLLECTION: process.env.DB_HASHTAGS_COLLECTION,
  DB_BOOKMARKS_COLLECTION: process.env.DB_BOOKMARKS_COLLECTion,
  DB_LIKE_COLLECTION: process.env.DB_LIKE_COLLECTION,
  DB_CONVERSATIONS_COLLECTION: process.env.DB_CONVERSATIONS_COLLECTION,
  PASSWORD_SECRET: process.env.PASSWORD_SECRET,
  //====== || JWT AUTHENTICATION || ========//
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN,
  JWT_SECRET_RERFESH_TOKEN: process.env.JWT_SECRET_RERFESH_TOKEN,
  JWT_SECRET_EMAIL_VERIFY_TOKEN: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
  //====== || GOOGLE AUTH || ========//
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  CLIENT_REDERECT_CALLBACK: process.env.CLIENT_REDERECT_CALLBACK,
  //======== || AWS S3 KEY || ================//
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS
}
