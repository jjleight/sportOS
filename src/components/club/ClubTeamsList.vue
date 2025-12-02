<script setup>
import { ref, computed } from 'vue';
import { Search, Edit2, UserCog, Briefcase, LayoutGrid, Filter } from 'lucide-vue-next';

const props = defineProps({
  teams: Array
});

const emit = defineEmits(['edit', 'manageStaff']);

const searchQuery = ref('');
const categoryFilter = ref('All'); // 'All', 'Mens', 'Womens', 'Youth'

const categories = ['All', 'Mens', 'Womens', 'Youth'];

const filteredTeams = computed(() => {
  let list = props.teams;

  // 1. Filter by Category
  if (categoryFilter.value !== 'All') {
    if (categoryFilter.value === 'Youth') {
      list = list.filter(t => t.gender === 'Boys' || t.gender === 'Girls');
    } else {
      list = list.filter(t => t.gender === categoryFilter.value);
    }
  }

  // 2. Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(t => t.name.toLowerCase().includes(q));
  }

  return list;
});
</script>

<template>
  <div class="space-y-6">
    
    <!-- Toolbar -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      
      <!-- Category Tabs -->
      <div class="flex bg-slate-100 p-1 rounded-lg">
        <button v-for="cat in categories" :key="cat"
                @click="categoryFilter = cat"
                class="px-4 py-1.5 rounded-md text-xs font-bold transition-all"
                :class="categoryFilter === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          {{ cat }}
        </button>
      </div>

      <!-- Search -->
      <div class="relative w-full md:w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input v-model="searchQuery" type="text" placeholder="Find a team..." 
               class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>
    </div>

    <!-- Results Grid -->
    <div v-if="filteredTeams.length === 0" class="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
      <p class="text-slate-400 text-sm">No teams found matching filters.</p>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-4 animate-fade-in">
      <div v-for="team in filteredTeams" :key="team.id" 
           class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-indigo-300 transition relative overflow-hidden">
        
        <div class="flex items-center gap-4 z-10">
          <!-- Level Badge -->
          <div class="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex flex-col items-center justify-center border border-slate-100 font-mono">
             <span class="text-[9px] uppercase font-bold tracking-wider text-slate-400">Lvl</span>
             <span class="font-bold text-lg leading-none">{{ team.team_level }}</span>
          </div>
          
          <div>
            <h3 class="font-bold text-slate-900 text-lg">{{ team.name }}</h3>
            <div class="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap mt-1">
              <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{{ team.gender }}</span>
              <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                 <LayoutGrid class="w-3 h-3" /> {{ team.format || '11v11' }}
              </span>
              <span v-if="team.team_staff && team.team_staff[0]?.count > 0" class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                 <Briefcase class="w-3 h-3" /> {{ team.team_staff[0].count }} Staff
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
           <button @click="$emit('manageStaff', team)" class="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition" title="Staff">
             <UserCog class="w-5 h-5" />
           </button>
           <button @click="$emit('edit', team)" class="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="Edit">
             <Edit2 class="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
