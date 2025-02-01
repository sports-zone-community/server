import Joi from 'joi';
import { Config } from '../config/config';

export const configSchema: Joi.ObjectSchema<Config> = Joi.object<Config>({
  environment: Joi.string().required(),
  port: Joi.number().required(),
  ssl: Joi.object({
    keyPath: Joi.string().optional(),
    certPath: Joi.string().optional(),
  }).optional(),
  allowedOrigins: Joi.array().items(Joi.string()).required(),
  database: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    name: Joi.string().required(),
  }).required(),
  jwt: Joi.object({
    accessTokenSecret: Joi.string().required(),
    refreshTokenSecret: Joi.string().required(),
    tokenExpiration: Joi.string().required(),
  }).required(),
  google: Joi.object({
    userDetailsUrl: Joi.string().required(),
  }).required(),
});
