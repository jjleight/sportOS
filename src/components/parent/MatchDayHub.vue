<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { supabase } from '../../supabase';
import { useHousehold } from '../../composables/useHousehold';
import { useToast } from '../../composables/useToast';
import { Trophy } from 'lucide-vue-next';

// Sub Components
import MatchHero from './MatchHero.vue';
import MatchList from './MatchList.vue';

const { householdId, fetchHousehold } = useHousehold();
const { showToast } = useToast();

const loading = ref(true);
const matches = ref([]);

onMounted(async () => {
  if (!householdId.value) await fetchHousehold();
  if (householdId.value) await fetchMyMatches();
});

watch(householdId, (newId) => {
  if (newId) fetchMyMatches();
});

async function fetchMyMatches() {
  loading.value = true;
  try {
    // 1. Get Kids IDs
    const { data: kids } = await supabase.from('players').select('id, first_name').eq('household_id', householdId.value);
    if (!kids || kids.length === 0) {
        loading.value = false;
        return;
    }
    const kidIds = kids.map(k => k.id);

    // 2. Get Matches
    const { data: matchData, error } = await supabase
      .from('matches')
      .select(`
        *,
        teams!inner ( name, team_memberships!inner(player_id) ),
        match_availability ( status, player_id ),
        appearances ( player_id ) 
      `)
      .in('teams.team_memberships.player_id', kidIds)
      .eq('status', 'Scheduled')
      .gte('match_date', new Date().toISOString().split('T')[0])
      .order('match_date');

    if (error) throw error;

    // 3. Transform
    matches.value = matchData.flatMap(m => {
      const involvedKids = kids.filter(k => 
        m.teams.team_memberships.some(tm => tm.player_id === k.id)
      );
      
      return involvedKids.map(kid => ({
        ...m,
        kidName: kid.first_name,
        playerId: kid.id,
        myStatus: m.match_availability?.find(a => a.player_id === kid.id)?.status || null,
        isSelected: m.appearances?.some(a => a.player_id === kid.id)
      }));
    });
    
    // Sort
    matches.value.sort((a, b) => {
        const dateA = new Date(`${a.match_date}T${a.match_time}`);
        const dateB = new Date(`${b.match_date}T${b.match_time}`);
        return dateA - dateB;
    });

  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

const handleStatusUpdate = async (match, status) => {
  const { error } = await supabase.from('match_availability').upsert({
    match_id: match.id,
    player_id: match.playerId,
    status
  }, { onConflict: 'match_id, player_id' });

  if (!error) {
    match.myStatus = status;
    showToast('Updated', `Marked as ${status}`, 'success');
  }
};

const openMap = (location) => {
  if (!location) return;
  window.open(`https://maps.google.com/?q=${location}`, '_blank');
};

// Grouping Logic
const nextMatchDate = computed(() => matches.value.length > 0 ? matches.value[0].match_date : null);
const todaysMatches = computed(() => nextMatchDate.value ? matches.value.filter(m => m.match_date === nextMatchDate.value) : []);
const futureMatches = computed(() => nextMatchDate.value ? matches.value.filter(m => m.match_date !== nextMatchDate.value) : []);

const prettyDateHeader = computed(() => {
    if (!nextMatchDate.value) return '';
    const date = new Date(nextMatchDate.value);
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    
    <div class="bg-indigo-600 text-white p-6 pt-12 shadow-xl sticky top-0 z-20">
      <h2 class="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Match Day Hub</h2>
      <h1 class="text-3xl font-extrabold">My Schedule</h1>
    </div>

    <div class="p-6 space-y-8">
      <div v-if="loading" class="text-center py-12 text-slate-400">Loading...</div>
      <div v-else-if="matches.length === 0" class="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
        <Trophy class="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 class="text-slate-900 font-bold text-lg">No matches found</h3>
      </div>

      <div v-else>
        <!-- Hero Carousel -->
        <div class="mb-8">
            <div class="flex justify-between items-end mb-4 px-1">
                <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">{{ prettyDateHeader }}</h3>
                <span class="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full" v-if="todaysMatches.length > 1">
                    {{ todaysMatches.length }} Games
                </span>
            </div>
            <div class="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 snap-x snap-mandatory no-scrollbar">
                <div v-for="match in todaysMatches" :key="`${match.id}-${match.playerId}`" class="snap-center shrink-0 w-full max-w-[340px]">
                    <MatchHero 
                        :match="match" 
                        @updateStatus="handleStatusUpdate" 
                        @openMap="openMap" 
                    />
                </div>
            </div>
            <!-- Dots -->
            <div v-if="todaysMatches.length > 1" class="flex justify-center gap-1.5 mt-3">
                <div v-for="n in todaysMatches.length" :key="n" class="w-1.5 h-1.5 rounded-full bg-slate-300 first:bg-indigo-500"></div>
            </div>
        </div>

        <!-- Future List -->
        <div v-if="futureMatches.length > 0">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Future Fixtures</h3>
            <MatchList 
                :matches="futureMatches" 
                @updateStatus="handleStatusUpdate" 
            />
        </div>
      </div>
    </div>
  </div>
</template>
