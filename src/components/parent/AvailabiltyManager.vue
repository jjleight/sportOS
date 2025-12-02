<script setup>
import { ref, onMounted, watch } from 'vue'; // Added watch
import { supabase } from '../../supabase';
import { useToast } from '../../composables/useToast';
import { Check, X, HelpCircle, Calendar } from 'lucide-vue-next';

// NEW: Accept householdId from parent
const props = defineProps({
  householdId: { type: String, default: null }
});

const { showToast } = useToast();
const loading = ref(true);
const upcomingMatches = ref([]);

onMounted(async () => {
  if (props.householdId) await fetchSchedule();
});

// Watch for changes (if the parent component finds the ID late)
watch(() => props.householdId, (newId) => {
  if (newId) fetchSchedule();
});

async function fetchSchedule() {
  loading.value = true;
  try {
    if (!props.householdId) return;

    // 1. Find all players (kids) in this family
    const { data: kids, error: kidError } = await supabase
      .from('players')
      .select('id, first_name')
      .eq('household_id', props.householdId);

    if (kidError) throw kidError;
    if (!kids || kids.length === 0) {
      upcomingMatches.value = []; // Reset
      loading.value = false;
      return;
    }

    const kidIds = kids.map(k => k.id);

    // 2. Find matches
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(`
        id, opponent_name, match_date, match_time,
        teams!inner ( name, team_memberships!inner ( player_id ) ),
        match_availability ( status, player_id )
      `)
      .in('teams.team_memberships.player_id', kidIds)
      .eq('status', 'Scheduled')
      .gte('match_date', new Date().toISOString().split('T')[0])
      .order('match_date', { ascending: true });

    if (matchError) throw matchError;

    // 3. Transform
    const list = [];
    matches.forEach(m => {
      const ourKidsInTeam = m.teams.team_memberships.filter(tm => kidIds.includes(tm.player_id));
      ourKidsInTeam.forEach(tm => {
        const kid = kids.find(k => k.id === tm.player_id);
        const availRecord = m.match_availability?.find(a => a.player_id === kid.id);
        list.push({
          match_id: m.id,
          player_id: kid.id,
          kidName: kid.first_name,
          opponent: m.opponent_name,
          date: m.match_date,
          time: m.match_time,
          teamName: m.teams.name,
          status: availRecord?.status || null
        });
      });
    });

    upcomingMatches.value = list;

  } catch (err) {
    console.error('Error fetching schedule:', err);
  } finally {
    loading.value = false;
  }
}

const setStatus = async (item, status) => {
  const oldStatus = item.status;
  item.status = status; // Optimistic

  const { error } = await supabase.from('match_availability').upsert({
    match_id: item.match_id,
    player_id: item.player_id,
    status: status
  }, { onConflict: 'match_id, player_id' });

  if (error) {
    item.status = oldStatus;
    showToast('Error', 'Could not save availability.', 'error');
  } else {
    const messages = { 'Available': 'Coach notified.', 'Unavailable': 'Marked as away.', 'Maybe': 'Marked as tentative.' };
    showToast('Updated', `${item.kidName}: ${messages[status]}`, 'success');
  }
};
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <div class="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
      <h3 class="font-bold text-slate-900 flex items-center gap-2">
        <Calendar class="w-4 h-4 text-indigo-600" /> Upcoming Matches
      </h3>
    </div>

    <div v-if="loading" class="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
      <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      Checking schedule...
    </div>
    
    <div v-else-if="!householdId" class="p-8 text-center text-slate-400 text-sm">
      No family linked. Add a player with a parent email in Admin.
    </div>

    <div v-else-if="upcomingMatches.length === 0" class="p-8 text-center text-slate-400 text-sm">
      No upcoming matches found for your children.
    </div>

    <div v-else class="divide-y divide-slate-100">
      <div v-for="match in upcomingMatches" :key="`${match.match_id}-${match.player_id}`" class="p-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-fit mb-1">
              {{ match.kidName }} • {{ match.teamName }}
            </div>
            <div class="font-bold text-slate-900 text-sm">vs {{ match.opponent }}</div>
            <div class="text-xs text-slate-500 mt-0.5">
              {{ new Date(match.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short'}) }}
            </div>
          </div>
          <div v-if="match.status" class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border"
               :class="{
                 'bg-emerald-50 text-emerald-600 border-emerald-100': match.status === 'Available',
                 'bg-rose-50 text-rose-600 border-rose-100': match.status === 'Unavailable',
                 'bg-amber-50 text-amber-600 border-amber-100': match.status === 'Maybe'
               }">
             {{ match.status }}
          </div>
          <div v-else class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border bg-slate-100 text-slate-500 border-slate-200">
             Pending
          </div>
        </div>
        <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button @click="setStatus(match, 'Available')" class="flex-1 py-2 rounded-md flex justify-center items-center transition-all" :class="match.status === 'Available' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-emerald-600'"><Check class="w-5 h-5" /></button>
          <button @click="setStatus(match, 'Maybe')" class="flex-1 py-2 rounded-md flex justify-center items-center transition-all" :class="match.status === 'Maybe' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-amber-500'"><HelpCircle class="w-5 h-5" /></button>
          <button @click="setStatus(match, 'Unavailable')" class="flex-1 py-2 rounded-md flex justify-center items-center transition-all" :class="match.status === 'Unavailable' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-rose-500'"><X class="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  </div>
</template>
