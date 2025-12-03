export function filterFixtures(fixtures, { timeframe, teamId, searchQuery }) {
  if (!fixtures) return [];

  const today = new Date().toISOString().split('T')[0];

  return fixtures.filter(f => {
    // 1. Status Check (Played games are 'Past')
    if (f.status === 'Played') {
        if (timeframe === 'upcoming') return false;
    } else {
        // Date Check
        const isFuture = f.match_date >= today;
        if (timeframe === 'upcoming' && !isFuture) return false;
        if (timeframe === 'past' && isFuture) return false;
    }

    // 2. Team Check
    if (teamId !== 'all' && f.team_id !== teamId) return false;

    // 3. Search Check
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const teamName = f.teams?.name?.toLowerCase() || '';
      const opponent = f.opponent_name?.toLowerCase() || '';
      if (!teamName.includes(q) && !opponent.includes(q)) return false;
    }

    return true;
  });
}
