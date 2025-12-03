<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { supabase } from '../../supabase';
import { useHousehold } from '../../composables/useHousehold';
import { useToast } from '../../composables/useToast';
import { 
  Calendar, MapPin, Shirt, Clock, 
  Check, HelpCircle, X, ExternalLink, 
  Trophy, ShieldCheck 
} from 'lucide-vue-next';

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

    // 2. Get Matches + Availability + Selection Status
    // We join 'appearances' to see if the coach has picked them
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

    // 3. Transform Data
    matches.value = matchData.flatMap(m => {
      // Filter for our kids in this specific team
      const involvedKids = kids.filter(k => 
        m.teams.team_memberships.some(tm => tm.player_id === k.id)
      );
      
      return involvedKids.map(kid => ({
        ...m,
        kidName: kid.first_name,
        playerId: kid.id,
        // My Availability
        myStatus: m.match_availability?.find(a => a.player_id === kid.id)?.status || null,
        // Coach Selection (Did I make the squad?)
        isSelected: m.appearances?.some(a => a.player_id === kid.id)
      }));
    });

  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

const setStatus = async (match, status) => {
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

// Computed: Separate the next game from the rest
const nextMatch = computed(() => matches.value[0]);
const futureMatches = computed(() => matches.value.slice(1));
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    
    <!-- Header -->
    <div class="bg-indigo-600 text-white p-6 pt-12 shadow-xl sticky top-0 z-20">
      <h2 class="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Match Day Hub</h2>
      <h1 class="text-3xl font-extrabold">My Schedule</h1>
    </div>

    <div class="p-6 space-y-8">
      
      <div v-if="loading" class="text-center py-12 text-slate-400">Loading...</div>
      
      <div v-else-if="matches.length === 0" class="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
        <Trophy class="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 class="text-slate-900 font-bold text-lg">No matches found</h3>
        <p class="text-slate-500 text-sm">Enjoy your weekend!</p>
      </div>

      <div v-else>
        
        <!-- 1. HERO CARD (Next Match) -->
        <div class="relative mb-8">
            <div class="absolute -inset-1 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-3xl opacity-30 blur"></div>
            <div class="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                
                <!-- Badge -->
                <div class="bg-slate-900 text-white px-4 py-2 text-xs font-bold flex justify-between items-center">
                    <span>NEXT UP</span>
                    <div v-if="nextMatch.isSelected" class="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck class="w-3 h-3" /> SELECTED
                    </div>
                    <div v-else class="text-slate-400">Pending Selection</div>
                </div>

                <div class="p-6">
                    <!-- Head to Head -->
                    <div class="text-center mb-6">
                        <div class="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">{{ nextMatch.kidName }} • {{ nextMatch.teams.name }}</div>
                        <div class="text-2xl font-black text-slate-900">{{ nextMatch.opponent_name }}</div>
                        <div class="text-sm text-slate-500 font-medium">{{ nextMatch.is_home ? '(Home)' : '(Away)' }}</div>
                    </div>

                    <!-- Logistics Grid -->
                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <Clock class="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                            <div class="text-xs text-slate-400 font-bold uppercase">Kick Off</div>
                            <div class="font-bold text-slate-900">{{ nextMatch.match_time.slice(0,5) }}</div>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <Shirt class="w-5 h-5 text-rose-500 mx-auto mb-1" />
                            <div class="text-xs text-slate-400 font-bold uppercase">Kit</div>
                            <div class="font-bold text-slate-900">{{ nextMatch.kit }}</div>
                        </div>
                    </div>

                    <!-- Location -->
                    <button @click="openMap(nextMatch.location)" class="w-full flex items-center justify-between p-3 bg-indigo-50 rounded-xl text-indigo-700 text-sm font-bold mb-6 hover:bg-indigo-100 transition">
                        <span class="flex items-center gap-2"><MapPin class="w-4 h-4" /> {{ nextMatch.location || 'Location TBC' }}</span>
                        <ExternalLink class="w-4 h-4" />
                    </button>

                    <!-- Availability Toggle -->
                    <div class="space-y-2">
                        <p class="text-[10px] text-slate-400 font-bold uppercase text-center">Confirm Availability</p>
                        <div class="flex bg-slate-100 p-1 rounded-xl">
                           <button @click="setStatus(nextMatch, 'Available')" class="flex-1 py-3 rounded-lg flex justify-center items-center transition-all" :class="nextMatch.myStatus === 'Available' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-emerald-600'"><Check class="w-5 h-5" /></button>
                           <button @click="setStatus(nextMatch, 'Maybe')" class="flex-1 py-3 rounded-lg flex justify-center items-center transition-all" :class="nextMatch.myStatus === 'Maybe' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-amber-500'"><HelpCircle class="w-5 h-5" /></button>
                           <button @click="setStatus(nextMatch, 'Unavailable')" class="flex-1 py-3 rounded-lg flex justify-center items-center transition-all" :class="nextMatch.myStatus === 'Unavailable' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-rose-500'"><X class="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. COMPACT FUTURE LIST -->
        <div v-if="futureMatches.length > 0">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Future Fixtures</h3>
            
            <div class="space-y-3">
                <div v-for="match in futureMatches" :key="`${match.id}-${match.playerId}`" 
                     class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 transition hover:border-indigo-300">
                    
                    <!-- Compact Header -->
                    <div class="flex items-center gap-4">
                        <!-- Date Badge -->
                        <div class="flex flex-col items-center justify-center bg-slate-50 w-10 h-10 rounded-lg border border-slate-100 shrink-0">
                           <span class="text-[9px] font-bold text-slate-400 uppercase">{{ new Date(match.match_date).toLocaleString('en-GB', { month: 'short' }) }}</span>
                           <span class="text-sm font-black text-slate-900">{{ new Date(match.match_date).getDate() }}</span>
                        </div>
                        
                        <!-- Match Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-center mb-0.5">
                                <span class="text-[10px] font-bold text-indigo-600">{{ match.kidName }}</span>
                                <span class="text-[10px] text-slate-400">{{ match.is_home ? 'Home' : 'Away' }}</span>
                            </div>
                            <div class="font-bold text-slate-900 text-sm truncate">vs {{ match.opponent_name }}</div>
                        </div>

                        <!-- Mini Status Indicator (Current State) -->
                        <div v-if="match.myStatus" class="shrink-0">
                             <div v-if="match.myStatus === 'Available'" class="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><Check class="w-4 h-4" /></div>
                             <div v-if="match.myStatus === 'Unavailable'" class="bg-rose-100 text-rose-600 p-1.5 rounded-full"><X class="w-4 h-4" /></div>
                             <div v-if="match.myStatus === 'Maybe'" class="bg-amber-100 text-amber-600 p-1.5 rounded-full"><HelpCircle class="w-4 h-4" /></div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                       <button @click="setStatus(match, 'Available')" 
                               class="flex-1 py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition"
                               :class="match.myStatus === 'Available' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-emerald-600'">
                          Yes
                       </button>
                       <div class="w-px bg-slate-200 my-1"></div>
                       <button @click="setStatus(match, 'Maybe')" 
                               class="flex-1 py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition"
                               :class="match.myStatus === 'Maybe' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-amber-500'">
                          Maybe
                       </button>
                       <div class="w-px bg-slate-200 my-1"></div>
                       <button @click="setStatus(match, 'Unavailable')" 
                               class="flex-1 py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition"
                               :class="match.myStatus === 'Unavailable' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-rose-500'">
                          No
                       </button>
                    </div>

                </div>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>
