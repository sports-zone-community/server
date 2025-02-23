import { config } from '../../config/config';

export const headers: Record<string, string> = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': config.footballApi.apiKey
  };