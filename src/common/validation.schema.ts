import * as Joi from 'joi';

const requiredString = Joi.string().required();
const requiredNumber = Joi.number().required();

export const validationSchema = Joi.object({
  // DB
  DB_TYPE: requiredString,
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
