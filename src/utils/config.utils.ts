import { configSchema } from '../validations/config.validation';
import { config } from '../config/config';
import { InternalServerError } from './errors';

export const initConfig = () => {
  // TODO: Implement validate Schema
  const { error } = configSchema.validate(config);

  if (error) {
    throw new InternalServerError(`Config validation error: ${error.message}`);
  }
};
