<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { supabase } from '../supabase';
import { useClub } from '../composables/useClub';
import { useTeamLogic } from '../composables/useTeamLogic';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import { useUser } from '../composables/useUser'; // Import Permissions

// Sub-Components
import SelectionHeader from './selection/SelectionHeader.vue';
import PlayerList from './selection/PlayerList.vue';
import PitchView from './selection/PitchView.vue';

const { activeClubId } = useClub();
const { showToast } = useToast();
const { showConfirm } = useConfirm();
const { permissions } = useUser();

// We still use the logic composable, but we need to override fetchMatches to filter it
const { 
  loading, players, leagueLimit, 
  fetchRules, fetchRoster, updateSelection, updatePosition 
} = useTeamLogic(activeClubId);

// Local State
const matches = ref([]);
const selectedMatchId = ref(null);
const viewMode = ref('squad');
const displayMode = ref('list');
const searchQuery = ref('');

// Derived State
const currentMatch = computed(() => matches.value.find(m => m.id === selectedMatchId.value));
const teamFormat = computed(() => currentMatch.value?.teams?.format || '11v11');
const selectedPlayers = computed(() => players.value.filter(p => p.isSelected));

onMounted(async () => {
  loading.value = true;
  await fetchRules();
  await fetchUpcomingMatches();
  if (matches.value.length > 0) selectedMatchId.value = matches.value[0].id;
  loading.value = false;
});

watch([selectedMatchId, viewMode], () => {
  if (selectedMatchId.value) {
    fetchRoster(selectedMatchId.value, viewMode.value, searchQuery.value);
  }
});

const handleSearch = (query) => {
  searchQuery.value = query;
  if (selectedMatchId.value) fetchRoster(selectedMatchId.value, viewMode.value, query);
};

// Override Fetch Matches to include Permission Filter
async function fetchUpcomingMatches() {
  const { data } = await supabase
    .from('matches')
    .select(`*, teams!inner(*)`)
    .eq('teams.club_id', activeClubId.value)
    .eq('status', 'Scheduled')
    .order('match_date', { ascending: true });
  
  let allMatches = data || [];

  // FILTER: Only show matches for my teams (if restricted)
  if (permissions.value.managedTeamIds !== 'all') {
      allMatches = allMatches.filter(m => permissions.value.managedTeamIds.includes(m.team_id));
  }

  matches.value = allMatches;
}

// User Interactions
const handleTogglePlayer = async (player, desiredPos = 'SUB') => {
  if (loading.value) return;

  try {
    if (!player.isSelected) {
      // Checks
      if (player.availability === 'Unavailable') {
        if (!await showConfirm("⚠️ Player Unavailable", `${player.first_name} marked themselves as unavailable. Select anyway?`)) return;
      }
      if (player.complianceStatus === 'ineligible') {
        if (!await showConfirm("⚠️ Rule Violation", "Selecting may result in a fine. Proceed?")) return;
      }

      await updateSelection(selectedMatchId.value, player, true, desiredPos);
      showToast('Added', `${player.first_name} added to squad.`, 'success');

    } else {
      await updateSelection(selectedMatchId.value, player, false);
    }
  } catch (e) {
    showToast('Error', e.message, 'error');
  }
};

const handleSetPosition = async (player, pos) => {
  try {
    if (!player.isSelected) await handleTogglePlayer(player, pos);
    else await updatePosition(selectedMatchId.value, player, pos);
  } catch (e) {
    showToast('Error', e.message, 'error');
  }
};
</script>

<template>
  <div class="w-full bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden min-h-[80vh] flex flex-col">
    
    <SelectionHeader 
      :matches="matches"
      v-model:selectedMatchId="selectedMatchId"
      v-model:viewMode="viewMode"
      v-model:displayMode="displayMode"
      :selectedCount="selectedPlayers.length"
      :teamFormat="teamFormat"
    />

    <PitchView 
      v-if="displayMode === 'pitch'" 
      :selectedPlayers="selectedPlayers" 
    />

    <PlayerList 
      v-else 
      :players="players" 
      :loading="loading"
      :viewMode="viewMode"
      :searchQuery="searchQuery"
      @update:searchQuery="handleSearch"
      @toggle="handleTogglePlayer"
      @setPosition="handleSetPosition"
    />

  </div>
</template>
