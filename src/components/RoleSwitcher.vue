<script setup>
import { useUser } from '../composables/useUser';
import { UserCircle2, ChevronDown, Check } from 'lucide-vue-next';
import { ref, computed } from 'vue';

const props = defineProps({
  theme: { type: String, default: 'dark' }, // 'dark' | 'light'
  direction: { type: String, default: 'up' } // 'up' | 'down'
});

const { currentUser, setPersona } = useUser();
const isOpen = ref(false);

// The options available in the demo
const roles = [
  { id: 'admin', label: 'Club Admin', desc: 'Full Access' },
  { id: 'treasurer', label: 'Treasurer', desc: 'Finance & Health' },
  { id: 'secretary', label: 'Secretary', desc: 'Rules & Compliance' },
  { id: 'coach', label: 'Team Coach', desc: 'Squad Selection' },
  { id: 'welfare', label: 'Welfare Officer', desc: 'Safeguarding' },
  { id: 'parent', label: 'Parent', desc: 'Family Wallet' },
];

const currentRoleLabel = computed(() => {
  const role = currentUser.value.roles[0].role;
  const match = roles.find(r => r.id === role || r.id === 'admin' && role === 'admin'); 
  // Simple map back to label, handling the mapping loosely for demo
  return role.replace('_', ' ');
});

const selectRole = (roleId) => {
  setPersona(roleId);
  isOpen.value = false;
};
</script>

<template>
  <div class="relative w-full">
    
    <!-- THE TRIGGER BUTTON -->
    <button @click="isOpen = !isOpen" 
            class="flex items-center gap-3 w-full p-2.5 rounded-xl transition text-left border relative z-10"
            :class="theme === 'dark' 
              ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-white' 
              : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-900 shadow-sm'">
      
      <div class="rounded-full p-1 shrink-0" 
           :class="theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-100 text-indigo-600'">
        <UserCircle2 class="w-5 h-5" />
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="text-[10px] font-bold uppercase tracking-wider opacity-70">Viewing As</div>
        <div class="text-sm font-bold capitalize truncate leading-tight">{{ currentRoleLabel }}</div>
      </div>
      
      <ChevronDown class="w-4 h-4 opacity-50" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- BACKDROP -->
    <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-0 cursor-default"></div>

    <!-- THE DROPDOWN MENU -->
    <div v-if="isOpen" 
         class="absolute left-0 w-full min-w-[240px] border rounded-xl shadow-xl overflow-hidden z-20"
         :class="[
           direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2',
           theme === 'dark' 
             ? 'bg-slate-800 border-slate-600 text-slate-200' 
             : 'bg-white border-slate-100 text-slate-700 ring-1 ring-slate-900/5'
         ]">
      
      <div v-for="role in roles" :key="role.id" 
           @click="selectRole(role.id)"
           class="p-3 cursor-pointer flex justify-between items-center group transition-colors border-b last:border-0"
           :class="theme === 'dark' 
             ? 'border-slate-700 hover:bg-slate-700' 
             : 'border-slate-50 hover:bg-slate-50'">
        
        <div>
          <div class="text-sm font-bold" 
               :class="theme === 'dark' ? 'text-slate-200 group-hover:text-white' : 'text-slate-900'">
            {{ role.label }}
          </div>
          <div class="text-[10px]" 
               :class="theme === 'dark' ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-400'">
            {{ role.desc }}
          </div>
        </div>
        
        <Check v-if="currentUser.roles[0].role === (role.id === 'welfare' ? 'welfare_officer' : role.id)" class="w-4 h-4 text-emerald-500" />
      </div>
    </div>

  </div>
</template>
