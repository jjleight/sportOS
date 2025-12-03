import { describe, it, expect, vi } from 'vitest';
import { filterFixtures } from '../../utils/fixtures';

describe('Fixture Filtering Engine', () => {
  // Mock Date to ensure tests pass regardless of when they run
  const mockDate = new Date('2025-06-01T12:00:00Z');
  vi.setSystemTime(mockDate);

  const matches = [
    { id: 1, match_date: '2025-06-05', team_id: 'A', status: 'Scheduled', teams: { name: 'U12' }, opponent_name: 'Rivals' }, // Upcoming
    { id: 2, match_date: '2025-05-20', team_id: 'A', status: 'Played', teams: { name: 'U12' }, opponent_name: 'Town' }, // Past
    { id: 3, match_date: '2025-06-05', team_id: 'B', status: 'Scheduled', teams: { name: 'U14' }, opponent_name: 'City' }, // Upcoming different team
  ];

  it('filters upcoming matches correctly', () => {
    const result = filterFixtures(matches, { timeframe: 'upcoming', teamId: 'all', searchQuery: '' });
    expect(result).toHaveLength(2); // Matches 1 & 3
    expect(result.map(m => m.id)).toContain(1);
    expect(result.map(m => m.id)).toContain(3);
  });

  it('filters by specific team', () => {
    const result = filterFixtures(matches, { timeframe: 'upcoming', teamId: 'B', searchQuery: '' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it('filters by search query (Opponent)', () => {
    const result = filterFixtures(matches, { timeframe: 'upcoming', teamId: 'all', searchQuery: 'Rival' });
    expect(result).toHaveLength(1);
    expect(result[0].opponent_name).toBe('Rivals');
  });
  
  it('correctly categorizes "Played" games as past, regardless of date', () => {
      // Edge case: A game marked 'Played' but date is technically today/future (e.g. marked early)
      const weirdMatch = [{ status: 'Played', match_date: '2025-06-10' }]; // Future date, but played
      
      const upcoming = filterFixtures(weirdMatch, { timeframe: 'upcoming', teamId: 'all' });
      expect(upcoming).toHaveLength(0); // Should NOT show in upcoming
  });
});
