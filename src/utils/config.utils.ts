import { configSchema } from '../validations/config.validation';
import { config } from '../config/config';
import { validateSchema } from '../middlewares';

export const initConfig = () => validateSchema(configSchema, config);
