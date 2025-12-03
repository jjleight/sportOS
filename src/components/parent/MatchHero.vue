<script setup>
import { ShieldCheck, Clock, Shirt, MapPin, ExternalLink } from 'lucide-vue-next';
import AvailabilitySelector from './AvailabilitySelector.vue';

const props = defineProps({
  match: Object
});

const emit = defineEmits(['updateStatus', 'openMap']);
</script>

<template>
  <div class="relative h-full">
      <!-- Glow Effect -->
      <div class="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-3xl opacity-20 blur"></div>
      
      <div class="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 h-full flex flex-col">
          
          <!-- Badge -->
          <div class="bg-slate-900 text-white px-4 py-2 text-xs font-bold flex justify-between items-center">
              <span class="uppercase tracking-wide text-indigo-200">{{ match.kidName }}'s Match</span>
              <div v-if="match.isSelected" class="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck class="w-3 h-3" /> SELECTED
              </div>
              <div v-else class="text-slate-400">Pending Selection</div>
          </div>

          <div class="p-5 flex-1 flex flex-col">
              <!-- Head to Head -->
              <div class="text-center mb-5">
                  <div class="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{{ match.teams.name }}</div>
                  <div class="text-xl font-black text-slate-900 leading-tight mb-1">{{ match.opponent_name }}</div>
                  <div class="text-xs text-slate-500 font-medium">{{ match.is_home ? '(Home)' : '(Away)' }}</div>
              </div>

              <!-- Logistics -->
              <div class="grid grid-cols-2 gap-2 mb-5">
                  <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <Clock class="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <div class="font-bold text-slate-900 text-sm">{{ match.match_time.slice(0,5) }}</div>
                  </div>
                  <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <Shirt class="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <div class="font-bold text-slate-900 text-sm">{{ match.kit }}</div>
                  </div>
              </div>

              <!-- Location -->
              <button @click="$emit('openMap', match.location)" class="w-full flex items-center justify-center gap-2 p-2.5 bg-indigo-50 rounded-lg text-indigo-700 text-xs font-bold mb-5 hover:bg-indigo-100 transition">
                  <MapPin class="w-3 h-3" /> {{ match.location || 'Location TBC' }}
              </button>

              <!-- Availability Reusable Component -->
              <div class="mt-auto">
                  <p class="text-[10px] text-slate-400 font-bold uppercase text-center mb-2">Confirm Availability</p>
                  <AvailabilitySelector 
                    :status="match.myStatus" 
                    size="normal"
                    @update="(s) => $emit('updateStatus', match, s)" 
                  />
              </div>
          </div>
      </div>
  </div>
</template>

