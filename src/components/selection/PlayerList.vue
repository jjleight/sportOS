<script setup>
import { Search, ShieldAlert, AlertTriangle, CheckCircle2, Users, XCircle, HelpCircle } from 'lucide-vue-next';

defineProps({
  players: Array,
  loading: Boolean,
  searchQuery: String,
  viewMode: String
});

defineEmits(['update:searchQuery', 'toggle', 'setPosition']);
</script>

<template>
  <div class="p-4 space-y-2 flex-1 bg-slate-50 overflow-y-auto">
    
    <!-- Search Bar -->
    <div class="relative mb-4">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input :value="searchQuery" 
             @input="$emit('update:searchQuery', $event.target.value)"
             type="text" 
             placeholder="Search player..." 
             class="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
      <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs">Loading players...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="players.length === 0" class="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
      <Users class="w-8 h-8 text-slate-300 mx-auto mb-2" />
      <p class="text-sm text-slate-500 font-bold">No players found.</p>
      <p class="text-xs text-slate-400" v-if="viewMode === 'squad'">Try switching to "Whole Club" to find reserves.</p>
    </div>
    
    <!-- List -->
    <div v-else v-for="player in players" :key="player.id" 
         class="group p-3 rounded-xl border shadow-sm transition-all duration-200 bg-white border-slate-200 flex flex-col gap-2"
         :class="{
           'ring-1 ring-indigo-500 bg-indigo-50': player.isSelected,
           'opacity-60 bg-slate-50': player.availability === 'Unavailable' && !player.isSelected
         }">
      
      <div class="flex items-center justify-between cursor-pointer" @click="$emit('toggle', player)">
          <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors border" 
                   :class="player.isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-500 border-slate-200'">
                {{ player.first_name[0] }}
              </div>
              <div>
                  <div class="font-bold text-sm text-slate-900">{{ player.first_name }} {{ player.last_name }}</div>
                  
                  <!-- Status Row -->
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                     
                     <!-- Compliance Tags -->
                     <span v-if="player.complianceStatus === 'ineligible'" class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ShieldAlert class="w-3 h-3" /> Ineligible
                     </span>
                     <span v-else-if="player.complianceStatus === 'risk'" class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle class="w-3 h-3" /> Risk
                     </span>
                     
                     <!-- Availability Tags -->
                     <span v-if="player.availability === 'Unavailable'" class="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 border border-slate-300">
                        <XCircle class="w-3 h-3" /> Away
                     </span>
                     <span v-else-if="player.availability === 'Maybe'" class="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-200">
                        <HelpCircle class="w-3 h-3" /> Maybe
                     </span>
                  </div>
              </div>
          </div>
          <CheckCircle2 v-if="player.isSelected" class="w-5 h-5 text-indigo-600" />
          <div v-else class="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-indigo-300"></div>
      </div>

      <!-- Position Selector -->
      <div v-if="player.isSelected" class="border-t border-indigo-100 pt-2 flex gap-1 justify-between">
          <button v-for="pos in ['GK', 'DEF', 'MID', 'FWD', 'SUB']" :key="pos"
                  @click.stop="$emit('setPosition', player, pos)"
                  class="text-[10px] font-bold px-2 py-1 rounded transition border"
                  :class="player.position === pos ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'">
              {{ pos }}
          </button>
      </div>
    </div>

  </div>
</template>
