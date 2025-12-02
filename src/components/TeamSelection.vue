<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useClub } from '../composables/useClub';
import { useTeamLogic } from '../composables/useTeamLogic'; // The new brain
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';

// Sub-Components
import SelectionHeader from './selection/SelectionHeader.vue';
import PlayerList from './selection/PlayerList.vue';
import PitchView from './selection/PitchView.vue';

// 1. Setup Composables
const { activeClubId } = useClub();
const { showToast } = useToast();
const { showConfirm } = useConfirm();
const { 
  loading, matches, players, leagueLimit, 
  fetchRules, fetchMatches, fetchRoster, updateSelection, updatePosition 
} = useTeamLogic(activeClubId);

// 2. UI State
const selectedMatchId = ref(null);
const viewMode = ref('squad'); // 'squad' | 'club'
const displayMode = ref('list'); // 'list' | 'pitch'
const searchQuery = ref('');

// 3. Derived State
const currentMatch = computed(() => matches.value.find(m => m.id === selectedMatchId.value));
const teamFormat = computed(() => currentMatch.value?.teams?.format || '11v11');
const selectedPlayers = computed(() => players.value.filter(p => p.isSelected));

// 4. Lifecycle
onMounted(async () => {
  loading.value = true;
  await fetchRules();
  await fetchMatches();
  if (matches.value.length > 0) selectedMatchId.value = matches.value[0].id;
  loading.value = false;
});

// 5. Watchers (React to UI changes)
watch([selectedMatchId, viewMode], () => {
  if (selectedMatchId.value) {
    fetchRoster(selectedMatchId.value, viewMode.value, searchQuery.value);
  }
});

const handleSearch = (query) => {
  searchQuery.value = query;
  if (selectedMatchId.value) fetchRoster(selectedMatchId.value, viewMode.value, query);
};

// 6. User Interactions
const handleTogglePlayer = async (player, desiredPos = 'SUB') => {
  if (loading.value) return;

  try {
    if (!player.isSelected) {
      // A. Availability Check
      if (player.availability === 'Unavailable') {
        const confirmed = await showConfirm(
          "⚠️ Player Unavailable",
          `${player.first_name} marked themselves as unavailable. Select anyway?`
        );
        if (!confirmed) return;
      }

      // B. Compliance Check
      if (player.complianceStatus === 'ineligible') {
        const confirmed = await showConfirm(
          "⚠️ Rule Violation", 
          "Selecting this player may result in a fine. Proceed?"
        );
        if (!confirmed) return;
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

    <!-- Main Content View -->
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
