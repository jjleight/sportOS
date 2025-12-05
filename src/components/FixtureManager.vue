<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import { useClub } from '../composables/useClub';
import { useUser } from '../composables/useUser'; // Import Permissions
import { 
  Calendar, Plus, MapPin, Clock, 
  Search, Edit2, Trash2, XCircle, 
  AlertOctagon, Filter, ChevronDown, 
  ArrowRight, History, CheckSquare, Shirt
} from 'lucide-vue-next';

// Sub-Components
import FixtureList from './fixtures/FixtureList.vue';
import FixtureModal from './fixtures/FixtureModal.vue';

const { showToast } = useToast();
const { showConfirm } = useConfirm();
const { activeClubId } = useClub();
const { permissions } = useUser(); // Get User Permissions

const loading = ref(true);
const teams = ref([]);
const fixtures = ref([]);

// Filters
const selectedTeamId = ref('all');
const timeframe = ref('upcoming');
const searchQuery = ref('');

// Modal State
const showModal = ref(false);
const editingFixture = ref(null);

onMounted(fetchData);

async function fetchData() {
  loading.value = true;
  
  // 1. Fetch Teams
  const { data: teamData } = await supabase
    .from('teams')
    .select('id, name')
    .eq('club_id', activeClubId.value)
    .order('team_level');
  
  // FILTER TEAMS: Only show teams this user manages
  let allowedTeams = teamData || [];
  if (permissions.value.managedTeamIds !== 'all') {
      allowedTeams = allowedTeams.filter(t => permissions.value.managedTeamIds.includes(t.id));
  }
  teams.value = allowedTeams;

  // 2. Fetch Matches
  const { data: matchData, error } = await supabase
    .from('matches')
    .select(`*, teams!inner(name, club_id)`)
    .eq('teams.club_id', activeClubId.value)
    .order('match_date', { ascending: timeframe.value === 'upcoming' });

  if (error) console.error(error);
  
  // FILTER MATCHES: Only show matches for managed teams
  let allowedMatches = matchData || [];
  if (permissions.value.managedTeamIds !== 'all') {
      allowedMatches = allowedMatches.filter(m => permissions.value.managedTeamIds.includes(m.team_id));
  }
  fixtures.value = allowedMatches;
  
  // Auto-select first team if user only manages specific teams
  if (permissions.value.managedTeamIds !== 'all' && teams.value.length > 0 && selectedTeamId.value === 'all') {
      // Optional: We could force selection, or leave 'all' to mean 'All MY teams'
      // selectedTeamId.value = teams.value[0].id;
  }

  loading.value = false;
}

// Computed Filter Logic
const processedFixtures = computed(() => {
  let list = fixtures.value.filter(f => {
    if (f.status === 'Played' && timeframe.value === 'upcoming') return false;
    if (f.status === 'Played' && timeframe.value === 'past') return true;

    const matchDate = new Date(f.match_date);
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);

    if (timeframe.value === 'upcoming') return matchDate >= todayDate;
    if (timeframe.value === 'past') return matchDate < todayDate;
    return true;
  });

  if (selectedTeamId.value !== 'all') {
    list = list.filter(f => f.team_id === selectedTeamId.value);
  }

  return list;
});

const groupedFixtures = computed(() => {
  const groups = {};
  processedFixtures.value.forEach(match => {
    const dateKey = match.match_date;
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(match);
  });
  return Object.keys(groups).sort().reduce((obj, key) => {
    obj[key] = groups[key];
    return obj;
  }, {});
});

// Actions
const handleOpenCreate = () => {
  editingFixture.value = null;
  showModal.value = true;
};

const handleOpenEdit = (match) => {
  editingFixture.value = match;
  showModal.value = true;
};

const handleSave = async (formData) => {
  const payload = { ...formData };
  delete payload.teams; 

  if (editingFixture.value) {
    const { error } = await supabase.from('matches').update(payload).eq('id', editingFixture.value.id);
    if (error) return showToast('Error', error.message, 'error');
    showToast('Success', 'Fixture updated.', 'success');
  } else {
    const { error } = await supabase.from('matches').insert(payload);
    if (error) return showToast('Error', error.message, 'error');
    showToast('Success', 'Fixture added.', 'success');
  }
  showModal.value = false;
  fetchData();
};

const handleDelete = async (id) => {
  if (!await showConfirm("Delete Match?", "This cannot be undone.")) return;
  await supabase.from('matches').delete().eq('id', id);
  showToast('Deleted', 'Fixture removed.', 'success');
  fetchData();
};

const handleStatusUpdate = async (match, newStatus) => {
  const { error } = await supabase.from('matches').update({ status: newStatus }).eq('id', match.id);
  if (!error) {
    match.status = newStatus;
    showToast('Status Updated', `Marked as ${newStatus}`, 'info');
    if (newStatus === 'Played') setTimeout(fetchData, 500);
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div class="max-w-5xl mx-auto px-6 py-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">Fixture Hub</h1>
            <p class="text-sm text-slate-500">Manage {{ teams.length }} teams</p>
          </div>
          <button @click="handleOpenCreate" class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95">
            <Plus class="w-4 h-4" /> <span class="hidden sm:inline">Add Match</span>
          </button>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select v-model="selectedTeamId" class="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none">
              <option value="all">All My Teams</option>
              <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div class="bg-slate-100 p-1 rounded-xl flex gap-1 shrink-0">
             <button @click="timeframe = 'upcoming'" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2" :class="timeframe === 'upcoming' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"><Calendar class="w-3 h-3" /> Upcoming</button>
             <button @click="timeframe = 'past'" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2" :class="timeframe === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"><History class="w-3 h-3" /> Past</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-5xl mx-auto px-6 py-8">
      <div v-if="loading" class="text-center py-12 text-slate-400">Loading...</div>
      
      <div v-else-if="Object.keys(groupedFixtures).length === 0" class="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
         <Calendar class="w-12 h-12 text-slate-300 mx-auto mb-3" />
         <h3 class="text-slate-900 font-bold text-lg">No matches found</h3>
      </div>

      <FixtureList 
        v-else 
        :groupedFixtures="groupedFixtures" 
        @edit="handleOpenEdit" 
        @delete="handleDelete" 
        @updateStatus="handleStatusUpdate" 
      />
    </div>

    <!-- Modal -->
    <FixtureModal 
      v-if="showModal"
      :teams="teams"
      :fixture="editingFixture"
      @close="showModal = false"
      @save="handleSave"
    />

  </div>
</template>
