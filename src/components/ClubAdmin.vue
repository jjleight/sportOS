<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase';
import { useClub } from '../composables/useClub';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm'; 

// Sub-Components
import ClubTeamsList from './club/ClubTeamsList.vue';
import ClubMembersList from './club/ClubMembersList.vue';
import TeamModal from './club/TeamModal.vue';
import PlayerModal from './club/PlayerModal.vue';
import StaffModal from './club/StaffModal.vue';

// Icons
import { Plus, UserPlus, Shield, CheckCircle2, Clock } from 'lucide-vue-next';

const { activeClubId, activeClubName } = useClub(); 
const { showToast } = useToast();
const { showConfirm } = useConfirm();

const loading = ref(true);
const activeTab = ref('teams'); // 'teams', 'players', 'officials'

// Data
const teams = ref([]);
const players = ref([]);
const officials = ref([]);

// Modal Controls
const showTeamModal = ref(false);
const editingTeam = ref(null); 
const showPlayerModal = ref(false);
const editingPlayer = ref(null); 
const showStaffModal = ref(false);
const managingStaffTeam = ref(null);
const showOfficialModal = ref(false);

// Forms
const officialForm = ref({ first_name: '', last_name: '', email: '', role: 'treasurer' });

onMounted(fetchData);

async function fetchData() {
  loading.value = true;
  
  try {
    // 1. Teams
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('club_id', activeClubId.value)
      .order('team_level', { ascending: true });

    const { data: staffData } = await supabase
      .from('team_staff')
      .select('team_id')
      .in('team_id', (teamData || []).map(t => t.id));

    teams.value = (teamData || []).map(team => ({
        ...team,
        team_staff: [{ count: staffData?.filter(s => s.team_id === team.id).length || 0 }]
    }));

    // 2. Players
    const { data: playerData } = await supabase
      .from('players')
      .select(`*, team_memberships ( team_id, teams (name) ), households ( primary_email )`)
      .eq('club_id', activeClubId.value)
      .order('last_name');

    players.value = playerData || [];

    // 3. Officials
    const { data: offData } = await supabase
      .from('club_officials')
      .select('*')
      .eq('club_id', activeClubId.value);
    officials.value = offData || [];

  } catch (err) {
    console.error(err);
    showToast('Error', 'Failed to load data', 'error');
  } finally {
    loading.value = false;
  }
}

// --- ACTIONS ---

const openCreateTeam = () => { editingTeam.value = null; showTeamModal.value = true; };
const openEditTeam = (team) => { editingTeam.value = team; showTeamModal.value = true; };
const openStaff = (team) => { managingStaffTeam.value = team; showStaffModal.value = true; };

const openCreatePlayer = () => { editingPlayer.value = null; showPlayerModal.value = true; };
const openEditPlayer = (player) => { editingPlayer.value = player; showPlayerModal.value = true; };

const deletePlayer = async (player) => {
  if (!await showConfirm("Remove Player?", "This cannot be undone.")) return;
  const { error } = await supabase.from('players').delete().eq('id', player.id);
  if (error) showToast('Error', error.message, 'error');
  else { showToast('Deleted', 'Player removed.', 'success'); fetchData(); }
};

const addOfficial = async () => {
  const { error } = await supabase.from('club_officials').insert({
    club_id: activeClubId.value,
    ...officialForm.value
  });
  
  if (error) showToast('Error', error.message, 'error');
  else {
      showToast('Success', 'Invite created.', 'success');
      showOfficialModal.value = false;
      officialForm.value = { first_name: '', last_name: '', email: '', role: 'treasurer' };
      fetchData();
  }
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
          
          <!-- Action Buttons based on Tab -->
          <div v-if="activeTab === 'teams'">
             <button @click="openCreateTeam" class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition hover:bg-indigo-700">
                <Plus class="w-4 h-4" /> Add Team
             </button>
          </div>
          <div v-else-if="activeTab === 'players'">
             <button @click="openCreatePlayer" class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition hover:bg-indigo-700">
                <UserPlus class="w-4 h-4" /> Add Player
             </button>
          </div>
           <div v-else-if="activeTab === 'officials'">
             <button @click="showOfficialModal = true" class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition hover:bg-indigo-700">
                <Shield class="w-4 h-4" /> Invite Official
             </button>
          </div>
        </div>

        <div class="flex gap-6 mt-6 border-b border-slate-100">
          <button @click="activeTab = 'teams'" class="pb-3 text-sm font-bold transition border-b-2" :class="activeTab === 'teams' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'">Teams</button>
          <button @click="activeTab = 'players'" class="pb-3 text-sm font-bold transition border-b-2" :class="activeTab === 'players' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'">Members</button>
          <button @click="activeTab = 'officials'" class="pb-3 text-sm font-bold transition border-b-2" :class="activeTab === 'officials' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'">Officials</button>
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
        v-else-if="activeTab === 'players'"
        :players="players" 
        :teams="teams"
        @edit="openEditPlayer" 
        @delete="deletePlayer"
      />

      <!-- OFFICIALS TAB -->
      <div v-else-if="activeTab === 'officials'" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div class="divide-y divide-slate-100">
            <div v-if="officials.length === 0" class="p-8 text-center text-slate-400 italic">No officials invited yet.</div>
            <div v-else v-for="off in officials" :key="off.id" class="p-4 flex items-center justify-between hover:bg-slate-50 transition">
               <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                     <Shield class="w-5 h-5" />
                  </div>
                  <div>
                     <div class="font-bold text-slate-900">{{ off.first_name }} {{ off.last_name }}</div>
                     <div class="text-xs text-slate-500 font-medium uppercase tracking-wide">{{ off.role.replace('_', ' ') }}</div>
                  </div>
               </div>
               <div class="text-xs font-bold px-2 py-1 rounded border"
                    :class="off.owner_profile_id 
                       ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                       : 'bg-slate-100 text-slate-500 border-slate-200'">
                  <span v-if="off.owner_profile_id" class="flex items-center gap-1"><CheckCircle2 class="w-3 h-3" /> Active</span>
                  <span v-else class="flex items-center gap-1"><Clock class="w-3 h-3" /> Pending</span>
               </div>
            </div>
         </div>
      </div>

    </div>

    <!-- Modals -->
    <TeamModal v-if="showTeamModal" :clubId="activeClubId" :team="editingTeam" @close="showTeamModal = false" @saved="fetchData" />
    <PlayerModal v-if="showPlayerModal" :clubId="activeClubId" :teams="teams" :player="editingPlayer" @close="showPlayerModal = false" @saved="fetchData" />
    <StaffModal v-if="showStaffModal" :team="managingStaffTeam" @close="showStaffModal = false" />
    
    <!-- Invite Official Modal -->
    <div v-if="showOfficialModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
       <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="showOfficialModal = false"></div>
       <div class="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
             <Shield class="w-5 h-5 text-indigo-600" /> Invite Official
          </h2>
          <div class="space-y-4">
             <div class="grid grid-cols-2 gap-4">
                <input v-model="officialForm.first_name" placeholder="First Name" class="input w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" />
                <input v-model="officialForm.last_name" placeholder="Last Name" class="input w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" />
             </div>
             <input v-model="officialForm.email" placeholder="Email Address" class="input w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" />
             <select v-model="officialForm.role" class="input w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none bg-white">
                <option value="treasurer">Treasurer</option>
                <option value="secretary">Secretary</option>
                <option value="welfare_officer">Welfare Officer</option>
                <option value="chairman">Chairman</option>
             </select>
             <button @click="addOfficial" :disabled="!officialForm.email" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-2 hover:bg-indigo-700 transition disabled:opacity-50">Send Invite</button>
          </div>
       </div>
    </div>

  </div>
</template>
