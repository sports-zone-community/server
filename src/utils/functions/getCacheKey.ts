export const getCacheKey = (league: number, season: number): string => {
    return `football-teams-${league}-${season}`;
};