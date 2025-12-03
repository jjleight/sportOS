<script setup>
import { Check, X, HelpCircle } from 'lucide-vue-next';
import AvailabilitySelector from './AvailabilitySelector.vue';

defineProps({
  matches: Array
});

const emit = defineEmits(['updateStatus']);
</script>

<template>
  <div class="space-y-3">
      <div v-for="match in matches" :key="`${match.id}-${match.playerId}`" 
           class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 transition hover:border-indigo-300">
          
          <!-- Compact Header -->
          <div class="flex items-center gap-4">
              <div class="flex flex-col items-center justify-center bg-slate-50 w-10 h-10 rounded-lg border border-slate-100 shrink-0">
                 <span class="text-[9px] font-bold text-slate-400 uppercase">{{ new Date(match.match_date).toLocaleString('en-GB', { month: 'short' }) }}</span>
                 <span class="text-sm font-black text-slate-900">{{ new Date(match.match_date).getDate() }}</span>
              </div>
              
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

          <!-- Availability Reusable Component (Compact Mode) -->
          <AvailabilitySelector 
            :status="match.myStatus" 
            size="compact"
            @update="(s) => $emit('updateStatus', match, s)" 
          />

      </div>
  </div>
</template>

