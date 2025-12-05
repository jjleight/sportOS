<script setup>
import { ChevronDown, Users, LayoutTemplate } from 'lucide-vue-next';

const props = defineProps({
  matches: Array,
  selectedMatchId: String,
  viewMode: String,
  displayMode: String,
  selectedCount: Number,
  teamFormat: String
});

const emit = defineEmits(['update:selectedMatchId', 'update:viewMode', 'update:displayMode']);
</script>

<template>
  <div class="bg-slate-900 text-white p-6 pt-8 shadow-lg relative z-10 space-y-6">
    
    <!-- Match Selector -->
    <div v-if="matches.length > 0" class="relative">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Fixture</label>
        <select :value="selectedMatchId" 
                @input="$emit('update:selectedMatchId', $event.target.value)"
                class="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-xl py-3 pl-4 pr-10 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition">
          <option v-for="m in matches" :key="m.id" :value="m.id">
            vs {{ m.opponent_name }} ({{ m.teams.format || '11v11' }})
          </option>
        </select>
        <ChevronDown class="absolute right-4 bottom-3.5 text-slate-400 pointer-events-none w-5 h-5" />
    </div>
    <div v-else class="text-center py-2 text-slate-400">No matches scheduled.</div>

    <!-- Controls Row -->
    <div class="flex items-center gap-2">
        <!-- View Mode (Squad vs Club) -->
        <div class="flex bg-slate-800 p-1 rounded-lg flex-1">
          <button @click="$emit('update:viewMode', 'squad')" 
                  class="flex-1 py-1.5 rounded text-xs font-bold transition-all"
                  :class="viewMode === 'squad' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'">
             Team Only
          </button>
          <button @click="$emit('update:viewMode', 'club')" 
                  class="flex-1 py-1.5 rounded text-xs font-bold transition-all"
                  :class="viewMode === 'club' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'">
             Whole Club
          </button>
        </div>

        <!-- Display Mode (List vs Pitch) -->
        <div class="flex bg-slate-800 p-1 rounded-lg">
           <button @click="$emit('update:displayMode', 'list')" class="p-2 rounded hover:bg-slate-700" :class="{'text-indigo-400': displayMode==='list', 'text-slate-400': displayMode!=='list'}"><Users class="w-4 h-4" /></button>
           <button @click="$emit('update:displayMode', 'pitch')" class="p-2 rounded hover:bg-slate-700" :class="{'text-indigo-400': displayMode==='pitch', 'text-slate-400': displayMode!=='pitch'}"><LayoutTemplate class="w-4 h-4" /></button>
        </div>
    </div>
    
    <!-- Counter -->
    <div class="flex justify-between items-end pt-2 border-t border-slate-800">
       <div class="text-xs text-slate-400">{{ teamFormat }} Format</div>
       <div class="text-right">
          <span class="text-2xl font-bold">{{ selectedCount }}</span>
          <span class="text-[10px] text-slate-400 uppercase font-bold ml-1">Selected</span>
       </div>
    </div>
  </div>
</template>
