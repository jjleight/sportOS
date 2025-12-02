<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../supabase';
import { useToast } from '../../composables/useToast';
import { UserPlus, UserCog, Mail, Users } from 'lucide-vue-next';

const props = defineProps({
  clubId: String,
  teams: Array,
  player: Object // If present, we are in "Edit Mode"
});

const emit = defineEmits(['close', 'saved']);
const { showToast } = useToast();

const form = ref({ 
  first_name: '', 
  last_name: '', 
  team_id: '',
  parent_email: ''
});

onMounted(() => {
  if (props.player) {
    // EDIT MODE: Pre-fill data
    form.value = {
      first_name: props.player.first_name,
      last_name: props.player.last_name,
      // Grab the first team ID if they have one (Simplification for MVP)
      team_id: props.player.team_memberships?.[0]?.team_id || '',
      // We don't fetch parent email back in this simple query, leaving blank for now
      // In a full app, you'd fetch the linked household email here
      parent_email: '' 
    };
  }
});

const save = async () => {
  try {
    let playerId = props.player?.id;

    // 1. CREATE or UPDATE Player Details
    if (props.player) {
      // UPDATE
      const { error } = await supabase
        .from('players')
        .update({
          first_name: form.value.first_name,
          last_name: form.value.last_name
        })
        .eq('id', playerId);
      
      if (error) throw error;

    } else {
      // CREATE (Logic from before)
      let householdId = null;
      
      if (form.value.parent_email) {
        const { data: existingHH } = await supabase
          .from('households')
          .select('id')
          .eq('primary_email', form.value.parent_email)
          .single();

        if (existingHH) {
          householdId = existingHH.id;
        } else {
          const { data: newHH, error: hhError } = await supabase
            .from('households')
            .insert({
              name: `${form.value.last_name} Family`,
              primary_email: form.value.parent_email
            })
            .select()
            .single();
          if (hhError) throw hhError;
          householdId = newHH.id;
        }
      }

      const { data: newPlayer, error: pError } = await supabase
        .from('players')
        .insert({
          club_id: props.clubId,
          first_name: form.value.first_name,
          last_name: form.value.last_name,
          household_id: householdId
        })
        .select()
        .single();

      if (pError) throw pError;
      playerId = newPlayer.id;
    }

    // 2. HANDLE TEAM ASSIGNMENT (The "Membership")
    // For simplicity, we wipe existing team links and add the new one selected
    if (form.value.team_id) {
      // Remove old links (Reset)
      await supabase.from('team_memberships').delete().eq('player_id', playerId);
      
      // Add new link
      const { error: mError } = await supabase.from('team_memberships').insert({
        player_id: playerId,
        team_id: form.value.team_id
      });
      
      if (mError) throw mError;
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
         <div class="grid grid-cols-2 gap-4">
           <div>
             <label class="label">First Name</label>
             <input v-model="form.first_name" class="input" placeholder="Jack" />
           </div>
           <div>
             <label class="label">Last Name</label>
             <input v-model="form.last_name" class="input" placeholder="Smith" />
           </div>
         </div>

         <!-- Parent Email (Only show on Create for now to keep simple) -->
         <div v-if="!player" class="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label class="label flex items-center gap-1">
                <Users class="w-3 h-3" /> Parent Email
            </label>
            <div class="relative mt-1">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="form.parent_email" type="email" class="input pl-9 bg-white" placeholder="parent@example.com" />
            </div>
            <p class="text-[10px] text-slate-400 mt-1.5 ml-1">
                Links player to a family household.
            </p>
         </div>

         <div>
           <label class="label">Assign to Team</label>
           <select v-model="form.team_id" class="input bg-white">
             <option value="">-- Unassigned --</option>
             <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
           </select>
         </div>

         <button @click="save" :disabled="!form.first_name || !form.last_name" class="btn-primary">
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
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
