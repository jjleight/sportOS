<script setup>
import { ref, computed } from 'vue';
import { Search, Filter, ChevronLeft, ChevronRight, Edit2, Trash2, Users } from 'lucide-vue-next';

const props = defineProps({
  players: Array,
  teams: Array
});

const emit = defineEmits(['edit', 'delete']);

// Filter State
const searchQuery = ref('');
const teamFilter = ref('all');

// Pagination State
const currentPage = ref(1);
const itemsPerPage = 10;

// 1. Filter Logic
const filteredPlayers = computed(() => {
  let list = props.players;

  // Team Filter
  if (teamFilter.value !== 'all') {
    if (teamFilter.value === 'unassigned') {
      list = list.filter(p => !p.team_memberships || p.team_memberships.length === 0);
    } else {
      list = list.filter(p => p.team_memberships?.some(tm => tm.team_id === teamFilter.value));
    }
  }

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p => 
      p.first_name.toLowerCase().includes(q) || 
      p.last_name.toLowerCase().includes(q)
    );
  }
  
  return list;
});

// 2. Pagination Logic
const totalPages = computed(() => Math.ceil(filteredPlayers.value.length / itemsPerPage));
const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPlayers.value.slice(start, start + itemsPerPage);
});

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// Reset page when filters change
const handleFilterChange = () => { currentPage.value = 1; };
</script>

<template>
  <div class="space-y-4">
    
    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      
      <!-- Search -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input v-model="searchQuery" @input="handleFilterChange" 
               type="text" placeholder="Search member database..." 
               class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>

      <!-- Team Select -->
      <div class="relative w-full md:w-64">
         <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
         <select v-model="teamFilter" @change="handleFilterChange"
                 class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
            <option value="all">All Squads</option>
            <option value="unassigned">Unassigned Only</option>
            <option disabled>──────────</option>
            <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
         </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
            <tr>
              <th class="p-4 w-1/3">Name</th>
              <th class="p-4 w-1/3">Assigned Squads</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            
            <tr v-if="paginatedPlayers.length === 0" class="text-center">
               <td colspan="3" class="p-8 text-slate-400 italic">No members found.</td>
            </tr>

            <tr v-else v-for="player in paginatedPlayers" :key="player.id" class="hover:bg-slate-50 transition group">
              <td class="p-4 font-bold text-slate-900">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                      {{ player.first_name[0] }}{{ player.last_name[0] }}
                    </div>
                    <div>
                      <div>{{ player.first_name }} {{ player.last_name }}</div>
                      <!-- NEW: Email Display -->
                      <div class="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                          <span v-if="player.category === 'Adult'">{{ player.email }}</span>
                          <span v-else-if="player.households?.primary_email">Parent: {{ player.households.primary_email }}</span>
                          <span v-else class="text-rose-500 font-bold">Missing Email</span>
                      </div>
                    </div>
                </div>
              </td>
              
              <td class="p-4">
                <div class="flex gap-2 flex-wrap">
                  <span v-for="m in player.team_memberships" :key="m.teams?.name" 
                        class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100 whitespace-nowrap">
                    {{ m.teams?.name }}
                  </span>
                  <span v-if="!player.team_memberships || player.team_memberships.length === 0" 
                        class="text-slate-400 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200 flex items-center gap-1 w-fit">
                     <Users class="w-3 h-3" /> Pool
                  </span>
                </div>
              </td>
              
              <td class="p-4 text-right">
                 <div class="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="$emit('edit', player)" class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                        <Edit2 class="w-4 h-4" />
                    </button>
                    <button @click="$emit('delete', player)" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
                        <Trash2 class="w-4 h-4" />
                    </button>
                 </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
         <span class="text-xs text-slate-500">
            Showing <strong>{{ paginatedPlayers.length }}</strong> of <strong>{{ filteredPlayers.length }}</strong> members
         </span>
         <div class="flex gap-2">
            <button @click="prevPage" :disabled="currentPage === 1" 
                    class="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50 text-slate-600">
              <ChevronLeft class="w-4 h-4" />
            </button>
            <span class="px-4 py-2 text-xs font-bold text-slate-600 flex items-center bg-white border rounded-lg">
               Page {{ currentPage }}
            </span>
            <button @click="nextPage" :disabled="currentPage === totalPages" 
                    class="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50 text-slate-600">
              <ChevronRight class="w-4 h-4" />
            </button>
         </div>
      </div>

    </div>
  </div>
</template>
