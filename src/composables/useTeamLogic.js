import { ref } from 'vue';
import { supabase } from '../supabase';
import { useToast } from './useToast';

export function calculateEligibility(higherApps, limit) {
  if (higherApps > limit) return 'ineligible';
  if (higherApps === limit) return 'risk';
  return 'eligible';
}

export function useTeamLogic(activeClubId) {
  
  const { showToast } = useToast();
  const loading = ref(true);
  const matches = ref([]);
  const players = ref([]);
  const leagueLimit = ref(5);

  const fetchRules = async () => {
    const { data } = await supabase
      .from('league_rules')
      .select('threshold_value')
      .eq('rule_type', 'max_higher_apps')
      .single();
    if (data) leagueLimit.value = data.threshold_value;
  };

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select(`*, teams!inner(*)`)
      .eq('teams.club_id', activeClubId.value)
      .eq('status', 'Scheduled')
      .order('match_date', { ascending: true });
    matches.value = data || [];
  };

  const fetchRoster = async (matchId, viewMode, searchQuery) => {
    loading.value = true;
    const match = matches.value.find(m => m.id === matchId);
    if (!match) return (loading.value = false);

    try {
      const [allPlayers, currentSelections, availabilityData] = await Promise.all([
        supabase.from('players').select(`*, team_memberships!left (team_id)`).eq('club_id', activeClubId.value).order('last_name'),
        supabase.from('appearances').select('player_id, position').eq('match_id', matchId),
        supabase.from('match_availability').select('player_id, status, note').eq('match_id', matchId)
      ]);

      const selectionMap = new Map(currentSelections.data?.map(a => [a.player_id, a.position]));
      const availabilityMap = new Map(availabilityData.data?.map(a => [a.player_id, a]));

      const filteredList = allPlayers.data.filter(p => {
        const isSelected = selectionMap.has(p.id);
        if (searchQuery) {
          const term = searchQuery.toLowerCase();
          return p.first_name.toLowerCase().includes(term) || p.last_name.toLowerCase().includes(term);
        }
        if (isSelected) return true;
        if (viewMode === 'squad') return p.team_memberships?.some(m => m.team_id === match.team_id);
        return true;
      });

      const processedPlayers = await Promise.all(filteredList.map(async (p) => {
        const { count } = await supabase
          .from('appearances')
          .select('*, matches!inner(match_date, teams!inner(team_level))', { count: 'exact', head: true })
          .eq('player_id', p.id)
          .lt('matches.teams.team_level', match.teams.team_level)
          .lt('matches.match_date', match.match_date);

        const complianceStatus = calculateEligibility(count, leagueLimit.value);

        return {
          ...p,
          isSelected: selectionMap.has(p.id),
          position: selectionMap.get(p.id) || 'SUB',
          higherApps: count,
          complianceStatus, // Now uses the tested logic
          availability: availabilityMap.get(p.id)?.status || 'Unknown'
        };
      }));

      players.value = processedPlayers.sort((a, b) => {
        if (a.isSelected !== b.isSelected) return a.isSelected ? -1 : 1;
        if (a.availability === 'Unavailable' && b.availability !== 'Unavailable') return 1;
        if (b.availability === 'Unavailable' && a.availability !== 'Unavailable') return -1;
        return a.last_name.localeCompare(b.last_name);
      });

    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to load roster data', 'error');
    } finally {
      loading.value = false;
    }
  };

  const updateSelection = async (matchId, player, isSelecting, position = 'SUB') => {
    if (isSelecting) {
       const { error } = await supabase.from('appearances').insert({
        match_id: matchId,
        player_id: player.id,
        type: 'Start',
        position
      });
      if (error) throw error;
      player.isSelected = true;
      player.position = position;
    } else {
      const { error } = await supabase.from('appearances').delete().eq('match_id', matchId).eq('player_id', player.id);
      if (error) throw error;
      player.isSelected = false;
      player.position = null;
    }
  };

  const updatePosition = async (matchId, player, position) => {
     const { error } = await supabase.from('appearances').update({ position }).eq('match_id', matchId).eq('player_id', player.id);
     if (error) throw error;
     player.position = position;
  };

  return {
    loading,
    matches,
    players,
    leagueLimit,
    fetchRules,
    fetchMatches,
    fetchRoster,
    updateSelection,
    updatePosition
  };
}
