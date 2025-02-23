import axios from 'axios';
import { config } from '../config/config';
import { Team, TeamResponse } from '../utils/interfaces/football-api.interface';
import { CacheService } from './cache.service';
import { headers } from '../utils/consts/footballHeaderRequest';
import { getCacheKey } from '../utils/functions/getCacheKey';

const baseUrl: string = config.footballApi.footballApiUrl;

export const getTeams = async (
  league: number, 
  season: number, 
  cacheService: CacheService = CacheService.getInstance()
): Promise<Team[]> => {
  const cacheKey: string = getCacheKey(league, season);
  const cachedData: Team[] | null = cacheService.get<Team[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const response = await axios.get(`${baseUrl}/teams`,{ headers, params: { league, season } });  
  const teams: Team[] = response.data.response.map((item: TeamResponse) => item.team);
    
  cacheService.set(cacheKey, teams);
    
    return teams;
};
