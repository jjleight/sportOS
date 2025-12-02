<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase';
import { useClub } from '../composables/useClub';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm'; 

// Layout Components
import ClubTeamsList from './club/ClubTeamsList.vue';
import ClubMembersList from './club/ClubMembersList.vue';

// Modals
import TeamModal from './club/TeamModal.vue';
import PlayerModal from './club/PlayerModal.vue';
import StaffModal from './club/StaffModal.vue';

import { Plus, UserPlus } from 'lucide-vue-next';

const { activeClubId, activeClubName } = useClub(); 
const { showToast } = useToast();
const { showConfirm } = useConfirm();

const loading = ref(true);
const activeTab = ref('teams'); 

// Data
const teams = ref([]);
const players = ref([]);

// Modal Controls
const showTeamModal = ref(false);
const editingTeam = ref(null); 
const showPlayerModal = ref(false);
const editingPlayer = ref(null); 
const showStaffModal = ref(false);
const managingStaffTeam = ref(null);

onMounted(fetchData);

async function fetchData() {
  loading.value = true;
  
  try {
    // 1. Teams (No Join)
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('club_id', activeClubId.value)
      .order('team_level', { ascending: true });

    // 2. Staff (Manual Join)
    const { data: staffData } = await supabase
      .from('team_staff')
      .select('team_id')
      .in('team_id', (teamData || []).map(t => t.id));

    // Merge
    teams.value = (teamData || []).map(team => ({
        ...team,
        team_staff: [{ count: staffData?.filter(s => s.team_id === team.id).length || 0 }]
    }));

    // 3. Players
    const { data: playerData } = await supabase
      .from('players')
      .select(`*, team_memberships ( team_id, teams (name) )`)
      .eq('club_id', activeClubId.value)
      .order('last_name');

    players.value = playerData || [];

  } catch (err) {
    console.error(err);
    showToast('Error', 'Failed to load data', 'error');
  } finally {
    loading.value = false;
  }
}

// --- TEAM ACTIONS ---
const openCreateTeam = () => { editingTeam.value = null; showTeamModal.value = true; };
const openEditTeam = (team) => { editingTeam.value = team; showTeamModal.value = true; };
const openStaff = (team) => { managingStaffTeam.value = team; showStaffModal.value = true; };

// --- PLAYER ACTIONS ---
const openCreatePlayer = () => { editingPlayer.value = null; showPlayerModal.value = true; };
const openEditPlayer = (player) => { editingPlayer.value = player; showPlayerModal.value = true; };

const deletePlayer = async (player) => {
  if (!await showConfirm("Remove Player?", "This cannot be undone.")) return;
  const { error } = await supabase.from('players').delete().eq('id', player.id);
  if (error) showToast('Error', error.message, 'error');
  else { showToast('Deleted', 'Player removed.', 'success'); fetchData(); }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-6 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">Club Management</h1>
            <p class="text-sm text-slate-500 font-medium">{{ activeClubName }}</p>
          </div>
          
          <button v-if="activeTab === 'teams'" @click="openCreateTeam"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition hover:bg-indigo-700">
            <Plus class="w-4 h-4" /> Add Team
          </button>
          <button v-else @click="openCreatePlayer"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition hover:bg-indigo-700">
            <UserPlus class="w-4 h-4" /> Add Player
          </button>
        </div>

        <div class="flex gap-6 mt-6 border-b border-slate-100">
          <button @click="activeTab = 'teams'" class="pb-3 text-sm font-bold transition border-b-2" :class="activeTab === 'teams' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'">Teams</button>
          <button @click="activeTab = 'players'" class="pb-3 text-sm font-bold transition border-b-2" :class="activeTab === 'players' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'">Member Database</button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-5xl mx-auto px-6 py-8">
      
      <div v-if="loading" class="text-center py-12 text-slate-400">Loading...</div>

      <!-- TEAMS TAB -->
      <ClubTeamsList 
        v-else-if="activeTab === 'teams'" 
        :teams="teams" 
        @edit="openEditTeam" 
        @manageStaff="openStaff"
      />

      <!-- PLAYERS TAB -->
      <ClubMembersList 
        v-else 
        :players="players" 
        :teams="teams"
        @edit="openEditPlayer" 
        @delete="deletePlayer"
      />

    </div>

    <!-- Modals -->
    <TeamModal v-if="showTeamModal" :clubId="activeClubId" :team="editingTeam" @close="showTeamModal = false" @saved="fetchData" />
    <PlayerModal v-if="showPlayerModal" :clubId="activeClubId" :teams="teams" :player="editingPlayer" @close="showPlayerModal = false" @saved="fetchData" />
    <StaffModal v-if="showStaffModal" :team="managingStaffTeam" @close="showStaffModal = false" />

  </div>
</template>
