<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../supabase';
import { useToast } from '../../composables/useToast';
import { UserCog, Trash2 } from 'lucide-vue-next';

const props = defineProps(['team']);
const emit = defineEmits(['close']);
const { showToast } = useToast();

const staff = ref([]);
const form = ref({ first_name: '', last_name: '', role: 'Head Coach', email: '' });

onMounted(async () => {
  const { data } = await supabase
    .from('team_staff')
    .select('*')
    .eq('team_id', props.team.id)
    .order('role');
  staff.value = data || [];
});

const addStaff = async () => {
  const { data, error } = await supabase.from('team_staff').insert({
    team_id: props.team.id,
    ...form.value
  }).select();

  if (error) {
    showToast('Error', error.message, 'error');
  } else {
    showToast('Success', 'Coach appointed.', 'success');
    staff.value.push(data[0]);
    form.value = { first_name: '', last_name: '', role: 'Head Coach', email: '' };
  }
};

const removeStaff = async (id) => {
  const { error } = await supabase.from('team_staff').delete().eq('id', id);
  if (!error) {
    staff.value = staff.value.filter(s => s.id !== id);
    showToast('Removed', 'Staff member removed.', 'success');
  }
};
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[80vh]">
       
       <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold flex items-center gap-2">
             <UserCog class="w-5 h-5 text-emerald-600" /> Staff: {{ team.name }}
          </h2>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">Close</button>
       </div>

       <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Appoint New Staff</p>
          <div class="grid grid-cols-2 gap-3 mb-3">
             <input v-model="form.first_name" placeholder="First Name" class="input bg-white" />
             <input v-model="form.last_name" placeholder="Last Name" class="input bg-white" />
          </div>
          <div class="grid grid-cols-2 gap-3 mb-3">
             <select v-model="form.role" class="input bg-white">
                <option>Head Coach</option>
                <option>Assistant Coach</option>
                <option>Team Manager</option>
                <option>Physio</option>
             </select>
             <input v-model="form.email" placeholder="Email (Required for Login)" class="input bg-white" />
          </div>
          <button @click="addStaff" :disabled="!form.first_name || !form.email" class="btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
             Add to Staff
          </button>
       </div>

       <div class="flex-1 overflow-y-auto space-y-2">
          <p v-if="staff.length === 0" class="text-center text-slate-400 text-sm py-4">No staff assigned yet.</p>
          <div v-for="s in staff" :key="s.id" class="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
             <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                   {{ s.first_name[0] }}
                </div>
                <div>
                   <div class="text-sm font-bold text-slate-900">{{ s.first_name }} {{ s.last_name }}</div>
                   <div class="text-[10px] text-slate-500">{{ s.role }}</div>
                </div>
             </div>
             <button @click="removeStaff(s.id)" class="text-slate-300 hover:text-rose-500 transition p-1">
                <Trash2 class="w-4 h-4" />
             </button>
          </div>
       </div>
    </div>
  </div>
</template>

<style scoped>
.label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 0.3rem; }
.input { width: 100%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-weight: 600; color: #0F172A; outline: none; }
.input:focus { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.btn-primary { width: 100%; color: white; font-weight: 700; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; }
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
