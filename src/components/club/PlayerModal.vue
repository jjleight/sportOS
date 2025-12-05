<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../../supabase';
import { useToast } from '../../composables/useToast';
import { UserPlus, UserCog, Mail, Users, User, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  clubId: String,
  teams: Array,
  player: Object
});

const emit = defineEmits(['close', 'saved']);
const { showToast } = useToast();

const form = ref({ 
  first_name: '', 
  last_name: '', 
  team_id: '',
  email: '',
  category: 'Youth'
});

// NEW: Validation Logic
const isValid = computed(() => {
  return (
    form.value.first_name.trim() !== '' &&
    form.value.last_name.trim() !== '' &&
    form.value.email.trim() !== '' &&
    form.value.email.includes('@') // Basic format check
  );
});

onMounted(() => {
  if (props.player) {
    form.value = {
      first_name: props.player.first_name,
      last_name: props.player.last_name,
      team_id: props.player.team_memberships?.[0]?.team_id || '',
      category: props.player.category || 'Youth',
      
      // Fetch existing email safely
      email: props.player.category === 'Adult' 
        ? props.player.email 
        : props.player.households?.primary_email || ''
    };
  }
});

const save = async () => {
  if (!isValid.value) return; // Guard clause

  try {
    let playerId = props.player?.id;
    let householdId = props.player?.household_id;

    // 1. Handle Household / Email
    if (form.value.category === 'Youth') {
        // For Youth, we MUST find or create a Household using this email
        const { data: existingHH } = await supabase.from('households').select('id').eq('primary_email', form.value.email).single();
        
        if (existingHH) {
           householdId = existingHH.id;
        } else {
           const { data: newHH, error: hhError } = await supabase.from('households').insert({
              name: `${form.value.last_name} Family`,
              primary_email: form.value.email
           }).select().single();
           if (hhError) throw hhError;
           householdId = newHH.id;
        }
    }

    // 2. Create/Update Player
    const payload = {
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        category: form.value.category,
    };

    if (householdId) payload.household_id = householdId;
    
    // For Adult, save email directly on player (and they become their own household logically later)
    if (form.value.category === 'Adult') {
        payload.email = form.value.email;
        payload.household_id = null; // Adults manage themselves (or you could create a single-person household)
    }

    if (props.player) {
      const { error } = await supabase.from('players').update(payload).eq('id', playerId);
      if (error) throw error;
      // If updating Youth email, update the linked household too
      if (props.player.category === 'Youth' && householdId) {
          await supabase.from('households').update({ primary_email: form.value.email }).eq('id', householdId);
      }
    } else {
      const { data: newPlayer, error: pError } = await supabase
        .from('players')
        .insert({ ...payload, club_id: props.clubId })
        .select().single();
      if (pError) throw pError;
      playerId = newPlayer.id;
    }

    // 3. Team Assignment
    if (form.value.team_id) {
      await supabase.from('team_memberships').delete().eq('player_id', playerId);
      await supabase.from('team_memberships').insert({ player_id: playerId, team_id: form.value.team_id });
    }

    showToast('Success', props.player ? 'Player updated.' : 'Player registered.', 'success');
    emit('saved');
    emit('close');

  } catch (err) {
    console.error(err);
    showToast('Error', err.message, 'error');
  }
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
     <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="$emit('close')"></div>
     <div class="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
       
       <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
         <component :is="player ? UserCog : UserPlus" class="w-5 h-5 text-indigo-600" /> 
         {{ player ? 'Edit Player' : 'Register Player' }}
       </h2>

       <div class="space-y-4">
         
         <div class="bg-slate-100 p-1 rounded-lg flex mb-4">
            <button @click="form.category = 'Youth'" class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all" :class="form.category === 'Youth' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">Youth (Under 18)</button>
            <button @click="form.category = 'Adult'" class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all" :class="form.category === 'Adult' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">Adult (Senior)</button>
         </div>

         <div class="grid grid-cols-2 gap-4">
           <div>
             <label class="label">First Name <span class="text-rose-500">*</span></label>
             <input v-model="form.first_name" class="input" placeholder="Name" />
           </div>
           <div>
             <label class="label">Last Name <span class="text-rose-500">*</span></label>
             <input v-model="form.last_name" class="input" placeholder="Surname" />
           </div>
         </div>

         <!-- Email Field -->
         <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 transition-all" 
              :class="{'ring-1 ring-rose-200 bg-rose-50': !form.email && form.first_name}">
            <label class="label flex items-center gap-1">
                <component :is="form.category === 'Adult' ? User : Users" class="w-3 h-3" /> 
                {{ form.category === 'Adult' ? 'Player Email' : 'Parent / Guardian Email' }}
                <span class="text-rose-500">*</span>
            </label>
            <div class="relative mt-1">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="form.email" type="email" class="input pl-9 bg-white" placeholder="example@email.com" required />
            </div>
            
            <div v-if="!form.email" class="flex items-center gap-1 mt-2 text-[10px] text-rose-600 font-bold">
                <AlertCircle class="w-3 h-3" /> Required for billing & notifications
            </div>
            <p v-else class="text-[10px] text-slate-400 mt-1.5 ml-1">
                {{ form.category === 'Adult' ? 'Used for billing and app login.' : 'Updates family contact (affects siblings).' }}
            </p>
         </div>

         <div>
           <label class="label">Assign to Team</label>
           <select v-model="form.team_id" class="input bg-white">
             <option value="">-- Unassigned --</option>
             <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
           </select>
         </div>

         <button @click="save" :disabled="!isValid" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {{ player ? 'Save Changes' : 'Complete Registration' }}
         </button>
       </div>
     </div>
  </div>
</template>

<style scoped>
.label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 0.3rem; }
.input { width: 100%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 0.5rem; padding: 0.75rem; font-weight: 600; color: #0F172A; outline: none; transition: all 0.2s; }
.input:focus { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.btn-primary { width: 100%; color: white; font-weight: 700; padding: 0.75rem; border-radius: 0.75rem; background-color: #4F46E5; margin-top: 0.5rem; transition: all 0.2s; }
.btn-primary:hover { background-color: #4338CA; }
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
