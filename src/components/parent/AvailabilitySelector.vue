<script setup>
import { Check, HelpCircle, X } from 'lucide-vue-next';

const props = defineProps({
  status: String, // 'Available', 'Unavailable', 'Maybe', null
  size: { type: String, default: 'normal' } // 'normal' (Hero) or 'compact' (List)
});

const emit = defineEmits(['update']);

const update = (newStatus) => {
  emit('update', newStatus);
};
</script>

<template>
  <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full">
    
    <!-- YES -->
    <button @click="update('Available')" 
            class="flex-1 rounded-lg flex justify-center items-center transition-all active:scale-95"
            :class="[
              size === 'compact' ? 'py-1.5' : 'py-2.5',
              status === 'Available' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-emerald-600'
            ]">
       <Check :class="size === 'compact' ? 'w-4 h-4' : 'w-5 h-5'" />
       <span v-if="size === 'compact'" class="ml-1 text-[10px] font-bold">Yes</span>
    </button>
    
    <div class="w-px bg-slate-200 my-1"></div>

    <!-- MAYBE -->
    <button @click="update('Maybe')" 
            class="flex-1 rounded-lg flex justify-center items-center transition-all active:scale-95"
            :class="[
              size === 'compact' ? 'py-1.5' : 'py-2.5',
              status === 'Maybe' ? 'bg-white text-amber-500 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-amber-500'
            ]">
       <HelpCircle :class="size === 'compact' ? 'w-4 h-4' : 'w-5 h-5'" />
       <span v-if="size === 'compact'" class="ml-1 text-[10px] font-bold">Maybe</span>
    </button>
    
    <div class="w-px bg-slate-200 my-1"></div>

    <!-- NO -->
    <button @click="update('Unavailable')" 
            class="flex-1 rounded-lg flex justify-center items-center transition-all active:scale-95"
            :class="[
              size === 'compact' ? 'py-1.5' : 'py-2.5',
              status === 'Unavailable' ? 'bg-white text-rose-500 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-rose-500'
            ]">
       <X :class="size === 'compact' ? 'w-4 h-4' : 'w-5 h-5'" />
       <span v-if="size === 'compact'" class="ml-1 text-[10px] font-bold">No</span>
    </button>

  </div>
</template>

