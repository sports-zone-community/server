import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getTeams } from '../services/football-api.service';

export const getTeamsFromServer = async (req: Request, res: Response): Promise<void> => {
    const { league, season } = req.query;
    const teams = await getTeams(
      Number(league),
      Number(season)
    );

    res.status(StatusCodes.OK).json(teams);
}; 
