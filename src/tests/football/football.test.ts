import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import axios from 'axios';
import { CacheService } from '../../services/cache.service';
import * as FootballApiService from '../../services/football-api.service';
import { Team } from '../../utils/interfaces/football-api.interface';
import { createAndLoginTestUser } from '../../utils';

describe('FOOTBALL ROUTES', () => {
  let token: string;
  let userId: string;
  
  const mockTeams: Team[] = [
    { id: 1, name: 'Team 1', code: 'T1', country: 'Country 1', founded: 1900, logo: 'logo1.png', national: false },
    { id: 2, name: 'Team 2', code: 'T2', country: 'Country 2', founded: 1910, logo: 'logo2.png', national: false }
  ];

  beforeEach(async () => {
    const loginResponse = await createAndLoginTestUser();
    token = loginResponse.accessToken;
    userId = loginResponse.userId;
    
    jest.clearAllMocks();
    jest.spyOn(FootballApiService, 'getTeams').mockResolvedValue(mockTeams);
    CacheService.getInstance().clear();
  });

  describe('GET /football/teams', () => {
    it('should get teams successfully', async () => {
      const response = await supertest(app)
        .get('/football/teams')
        .set('Authorization', `Bearer ${token}`)
        .query({ league: 39, season: 2023 });

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('logo');
    });

    it('should return 400 when league parameter is missing', async () => {
      const response = await supertest(app)
        .get('/football/teams')
        .set('Authorization', `Bearer ${token}`)
        .query({ season: 2023 });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 when season parameter is missing', async () => {
      const response = await supertest(app)
        .get('/football/teams')
        .set('Authorization', `Bearer ${token}`)
        .query({ league: 39 });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 when league is not a number', async () => {
      const response = await supertest(app)
        .get('/football/teams')
        .set('Authorization', `Bearer ${token}`)
        .query({ league: 'invalid', season: 2023 });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 when season is not a number', async () => {
      const response = await supertest(app)
        .get('/football/teams')
        .set('Authorization', `Bearer ${token}`)
        .query({ league: 39, season: 'invalid' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 500 when service throws an error', async () => {
      jest.spyOn(FootballApiService, 'getTeams').mockRejectedValueOnce(new Error('API Error'));

      const response = await supertest(app)
        .get('/football/teams')
        .set('Authorization', `Bearer ${token}`)
        .query({ league: 39, season: 2023 });

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app)
        .get('/football/teams')
        .set('Authorization', 'Bearer invalid-token')
        .query({ league: 39, season: 2023 });

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('Football API Service', () => {
    it('should return cached data when available', async () => {
      const cacheService = CacheService.getInstance();
      const spy = jest.spyOn(cacheService, 'get').mockReturnValueOnce(mockTeams);
      const axiosSpy = jest.spyOn(axios, 'get');

      jest.spyOn(FootballApiService, 'getTeams').mockRestore();

      const result = await FootballApiService.getTeams(39, 2023, cacheService);

      expect(result).toEqual(mockTeams);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(axiosSpy).not.toHaveBeenCalled();
    });

    it('should fetch data from API when cache is empty', async () => {
      const cacheService = CacheService.getInstance();
      const getSpy = jest.spyOn(cacheService, 'get').mockReturnValueOnce(null);
      const setSpy = jest.spyOn(cacheService, 'set');
      
      const mockResponse = {
        data: {
          response: mockTeams.map(team => ({ team }))
        }
      };
      
      const axiosSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce(mockResponse);

      jest.spyOn(FootballApiService, 'getTeams').mockRestore();

      const result = await FootballApiService.getTeams(39, 2023, cacheService);

      expect(result).toEqual(mockTeams);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(axiosSpy).toHaveBeenCalledTimes(1);
      expect(setSpy).toHaveBeenCalledWith(expect.any(String), mockTeams);
    });

    it('should throw error when API call fails', async () => {
      const cacheService = CacheService.getInstance();
      jest.spyOn(cacheService, 'get').mockReturnValueOnce(null);
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('API Error'));

      jest.spyOn(FootballApiService, 'getTeams').mockRestore();

      await expect(FootballApiService.getTeams(39, 2023, cacheService)).rejects.toThrow('API Error');
    });
  });

  describe('Cache Service', () => {
    it('should store and retrieve data correctly', () => {
      const cacheService = CacheService.getInstance();
      const testData = { test: 'data' };
      
      cacheService.set('test_key', testData);
      const retrievedData = cacheService.get('test_key');
      
      expect(retrievedData).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const cacheService = CacheService.getInstance();
      const result = cacheService.get('non_existent_key');
      
      expect(result).toBeNull();
    });

    it('should clear all cached data', () => {
      const cacheService = CacheService.getInstance();
      cacheService.set('test_key', { test: 'data' });
      
      cacheService.clear();
      
      const result = cacheService.get('test_key');
      expect(result).toBeNull();
    });

    it('should return null for expired cache entries', () => {
      const cacheService = CacheService.getInstance();
      const testData = { test: 'data' };
      
      // מוק לפונקציית Date.now כדי לדמות מעבר זמן
      const originalNow = Date.now;
      const mockNow = jest.fn()
        .mockReturnValueOnce(1000) // בזמן השמירה במטמון
        .mockReturnValueOnce(1000 + 3600001); // אחרי שעה ומילישנייה אחת (פג תוקף)
      
      global.Date.now = mockNow;
      
      cacheService.set('test_key', testData);
      const retrievedData = cacheService.get('test_key');
      
      // החזר את הפונקציה המקורית
      global.Date.now = originalNow;
      
      expect(retrievedData).toBeNull();
    });
  });
}); 