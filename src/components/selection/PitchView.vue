<script setup>
defineProps({
  selectedPlayers: { type: Array, required: true }
});
</script>

<template>
  <div class="flex-1 bg-emerald-800 relative overflow-hidden flex flex-col min-h-[400px]">
    <!-- Pitch Graphics -->
    <div class="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none"></div>
    <div class="absolute top-1/2 left-4 right-4 h-px bg-white/30 pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/30 pointer-events-none"></div>

    <!-- Zones -->
    <div class="flex-1 flex flex-col relative z-10 p-4 gap-4 justify-between">
        <!-- FWD -->
        <div class="flex justify-center items-center gap-4 h-1/4">
             <div v-for="p in selectedPlayers.filter(x => x.position === 'FWD')" :key="p.id" class="player-dot">{{ p.first_name }}</div>
        </div>
        <!-- MID -->
        <div class="flex justify-center items-center gap-4 h-1/4">
             <div v-for="p in selectedPlayers.filter(x => x.position === 'MID')" :key="p.id" class="player-dot">{{ p.first_name }}</div>
        </div>
        <!-- DEF -->
        <div class="flex justify-center items-center gap-4 h-1/4">
             <div v-for="p in selectedPlayers.filter(x => x.position === 'DEF')" :key="p.id" class="player-dot">{{ p.first_name }}</div>
        </div>
        <!-- GK -->
        <div class="flex justify-center h-auto pb-2">
             <div v-for="p in selectedPlayers.filter(x => x.position === 'GK')" :key="p.id" class="player-dot bg-yellow-400 text-yellow-900 border-yellow-200">{{ p.first_name }}</div>
        </div>
    </div>

    <!-- Bench -->
    <div class="bg-slate-900/90 p-3 border-t border-white/10">
        <div class="text-[10px] text-slate-400 uppercase font-bold mb-2">Substitutes</div>
        <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
             <div v-for="p in selectedPlayers.filter(x => x.position === 'SUB')" :key="p.id" 
                  class="shrink-0 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                {{ p.first_name }}
             </div>
             <div v-if="selectedPlayers.filter(x => x.position === 'SUB').length === 0" class="text-slate-500 text-xs italic">Bench empty</div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.player-dot {
    background: white; color: #0F172A; font-size: 10px; font-weight: 800;
    padding: 4px 8px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    border: 2px solid rgba(255,255,255,0.8); text-transform: uppercase;
    min-width: 48px; text-align: center;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>

