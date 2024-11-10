import * as Joi from 'joi';

const requiredString = Joi.string().required();
const requiredNumber = Joi.number().required();

export const validationSchema = Joi.object({
  // DB
  ENV: Joi.valid('test', 'dev', 'prod').required(),
  DB_TYPE: Joi.string().valid('postgres').required(),
  DB_HOST: requiredString,
  DB_PORT: requiredNumber,
  DB_USERNAME: requiredString,
  DB_PASSWORD: Joi.required(),
  DB_DATABASE: requiredString,

  // Token
  REFRESHTOKEN_SECRET: requiredString,
  ACCESSTOKEN_SECRET: requiredString,

  // 프론트주소
  REDIRECT_URL: requiredString,

  // 소셜 로그인 콜백
  SOCIAL_CALLBACK_URL: requiredString,

  // 구글
  SOCIAL_GOOGLE_ID: requiredString,
  SOCIAL_GOOGLE_SECRET: requiredString,

  // 카카오
  SOCIAL_KAKAO_ID: requiredString,
  SOCIAL_KAKAO_SECRET: requiredString,

  // 네이버
  SOCIAL_NAVER_ID: requiredString,
  SOCIAL_NAVER_SECRET: requiredString,
});

export enum envKeys {
  env = 'ENV',

  // DB
  dbType = 'DB_TYPE',
  dbHost = 'DB_HOST',
  dbPort = 'DB_PORT',
  dbUsername = 'DB_USERNAME',
  dbPassword = 'DB_PASSWORD',
  dbDatabase = 'DB_DATABASE',

  // Token
  refreshTokenSecret = 'REFRESHTOKEN_SECRET',
  accessTokenSecret = 'ACCESSTOKEN_SECRET',

  // 프론트주소
  redirectURL = 'REDIRECT_URL',

  // 소셜 로그인 콜백
  socailCallBackURL = 'SOCIAL_CALLBACK_URL',

  // 구글
  socailGoogleId = 'SOCIAL_GOOGLE_ID',
  socailGoogleSecet = 'SOCIAL_GOOGLE_SECRET',

  // 카카오
  socailKakaoId = 'SOCIAL_KAKAO_ID',
  socailKakaoSecet = 'SOCIAL_KAKAO_SECRET',

  // 네이버
  socailNaverId = 'SOCIAL_NAVER_ID',
  socailNaverSecet = 'SOCIAL_NAVER_SECRET',
}
