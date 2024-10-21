import * as Joi from 'joi';

const requiredString = Joi.string().required();
const requiredNumber = Joi.number().required();

export const validationSchema = Joi.object({
  DB_TYPE: requiredString,
  DB_HOST: requiredString,
  DB_PORT: requiredNumber,
  DB_USERNAME: requiredString,
  DB_PASSWORD: Joi.required(),
  DB_DATABASE: requiredString,
});
