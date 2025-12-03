<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../supabase';
import { useToast } from '../../composables/useToast';
import { Users, LayoutGrid } from 'lucide-vue-next';

const props = defineProps({
  clubId: String,
  team: Object // If provided, we are in "Edit Mode"
});

const emit = defineEmits(['close', 'saved']);
const { showToast } = useToast();

const form = ref({ name: '', level: 5, gender: 'Mens', format: '11v11' });

onMounted(() => {
  if (props.team) {
    // EDIT MODE: Map Database Columns -> Form Fields
    form.value = { 
      name: props.team.name,
      level: props.team.team_level, // Map team_level (DB) to level (Form)
      gender: props.team.gender,
      format: props.team.format || '11v11'
    };
  }
});

const save = async () => {
  // SAVE MODE: Map Form Fields -> Database Columns
  const payload = { 
    club_id: props.clubId,
    name: form.value.name,
    team_level: form.value.level, // The Fix: Send as 'team_level'
    gender: form.value.gender,
    format: form.value.format
  };

  let error = null;

  if (props.team) {
    // UPDATE
    const { error: err } = await supabase
      .from('teams')
      .update(payload)
      .eq('id', props.team.id);
    error = err;
  } else {
    // CREATE
    const { error: err } = await supabase
      .from('teams')
      .insert(payload);
    error = err;
  }

  if (error) return showToast('Error', error.message, 'error');
  
  showToast('Success', props.team ? 'Team updated.' : 'Team created.', 'success');
  emit('saved');
  emit('close');
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
      
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <Users class="w-5 h-5 text-indigo-600" />
        {{ team ? 'Edit Team' : 'Create New Team' }}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="label">Team Name</label>
          <input v-model="form.name" class="input" placeholder="e.g. U15 Tigers" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Level (1=High)</label>
            <input v-model="form.level" type="number" class="input" />
          </div>
          <div>
            <label class="label">Category</label>
            <select v-model="form.gender" class="input bg-white">
              <option>Mens</option>
              <option>Womens</option>
              <option>Boys</option>
              <option>Girls</option>
            </select>
          </div>
        </div>
        <div>
            <label class="label">Match Format</label>
            <div class="grid grid-cols-4 gap-2">
              <button v-for="f in ['5v5', '7v7', '9v9', '11v11']" :key="f" 
                      @click="form.format = f"
                      class="py-2 rounded-lg text-xs font-bold border transition"
                      :class="form.format === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'">
                {{ f }}
              </button>
            </div>
        </div>
        <button @click="save" class="btn-primary">{{ team ? 'Save Changes' : 'Create Team' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 0.3rem; }
.input { width: 100%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 0.5rem; padding: 0.75rem; font-weight: 600; color: #0F172A; outline: none; }
.input:focus { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.btn-primary { width: 100%; color: white; font-weight: 700; padding: 0.75rem; border-radius: 0.75rem; background-color: #4F46E5; margin-top: 0.5rem; transition: all 0.2s; }
.btn-primary:hover { background-color: #4338CA; }
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
