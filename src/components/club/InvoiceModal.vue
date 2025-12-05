<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../supabase';
import { useToast } from '../../composables/useToast';
import { useClub } from '../../composables/useClub';
import { prepareTeamInvoices } from '../../utils/invoice'; // Import Logic
import { Receipt, Users, ChevronRight, CheckCircle2, ArrowLeft, X, AlertTriangle } from 'lucide-vue-next';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'sent']);
const { showToast } = useToast();
const { activeClubId } = useClub();

const step = ref(1);
const loading = ref(false);
const categories = ref([]);
const teams = ref([]);
const players = ref([]);

// Form State
const form = ref({
  category: null,      
  targetType: 'team',  
  targetId: '',        
  amount: 0,
  description: '',
  dueDate: ''
});

onMounted(async () => {
  const today = new Date();
  const nextWeek = new Date(today.setDate(today.getDate() + 7));
  form.value.dueDate = nextWeek.toISOString().split('T')[0];

  await fetchOptions();
});

async function fetchOptions() {
  const { data: cats } = await supabase.from('transaction_categories').select('*');
  categories.value = cats || [];

  const { data: tms } = await supabase.from('teams').select('id, name').eq('club_id', activeClubId.value);
  teams.value = tms || [];

  const { data: pls } = await supabase.from('players').select('id, first_name, last_name').eq('club_id', activeClubId.value);
  players.value = pls || [];
}

const selectCategory = (cat) => {
  form.value.category = cat;
  form.value.amount = cat.default_amount;
  form.value.description = cat.name;
  step.value = 2;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const createInvoices = async () => {
  loading.value = true;
  try {
    let ledgerEntries = [];
    let skippedInfo = { count: 0, names: [] };

    // 1. SINGLE PLAYER
    if (form.value.targetType === 'player') {
      // Fetch full player details to get household_id
      const { data: player, error } = await supabase
        .from('players')
        .select('id, household_id')
        .eq('id', form.value.targetId)
        .single();

      if (error || !player) throw new Error("Player not found");
      if (!player.household_id) throw new Error("This player has no linked parent/household.");

      ledgerEntries = [{
        player_id: player.id,
        household_id: player.household_id,
        amount: form.value.amount,
        description: form.value.description,
        due_date: form.value.dueDate,
        status: 'pending'
      }];
    } 
    // 2. WHOLE TEAM
    else {
      const { data: teamMembers, error } = await supabase
        .from('team_memberships')
        .select('player_id, players(id, first_name, last_name, household_id)')
        .eq('team_id', form.value.targetId);
      
      if (error) throw error;

      // Use our Tested Utility Function
      const result = prepareTeamInvoices(teamMembers, {
          amount: form.value.amount,
          description: form.value.description,
          dueDate: form.value.dueDate
      });

      ledgerEntries = result.validEntries;
      skippedInfo = { count: result.skippedCount, names: result.skippedNames };
    }

    if (ledgerEntries.length === 0) {
      throw new Error("No valid players found to invoice (Check if they have linked households).");
    }

    // 3. Insert to DB
    const { error: insertError } = await supabase.from('ledger').insert(ledgerEntries);
    if (insertError) throw insertError;

    // 4. Feedback
    if (skippedInfo.count > 0) {
        showToast('Warning', `Sent ${ledgerEntries.length} requests. Skipped ${skippedInfo.count} players (No Parent Email).`, 'info');
    } else {
        showToast('Success', `Generated ${ledgerEntries.length} payment requests.`, 'success');
    }
    
    emit('sent');
    emit('close');

  } catch (err) {
    console.error(err);
    showToast('Error', err.message, 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <div class="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
        <div class="flex items-center gap-2">
             <h2 class="font-bold text-slate-900 flex items-center gap-2">
               <Receipt class="w-5 h-5 text-indigo-600" /> Create Request
             </h2>
             <div class="text-[10px] font-bold text-slate-400 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">Step {{ step }} / 3</div>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition">
            <X class="w-5 h-5" />
        </button>
      </div>

      <!-- STEP 1: CATEGORY -->
      <div v-if="step === 1" class="p-6 overflow-y-auto animate-fade-in">
        <h3 class="text-lg font-bold text-slate-900 mb-4">What is this payment for?</h3>
        <div class="grid gap-3">
          <button v-for="cat in categories" :key="cat.id" 
                  @click="selectCategory(cat)"
                  class="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition group text-left">
            <div>
              <div class="font-bold text-slate-700 group-hover:text-indigo-700">{{ cat.name }}</div>
              <div class="text-xs text-slate-400">Default: £{{ cat.default_amount }}</div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
          </button>
        </div>
      </div>

      <!-- STEP 2: AUDIENCE -->
      <div v-if="step === 2" class="p-6 overflow-y-auto space-y-6 animate-fade-in">
        <h3 class="text-lg font-bold text-slate-900">Who needs to pay?</h3>

        <div class="flex bg-slate-100 p-1 rounded-lg">
           <button @click="form.targetType = 'team'" class="flex-1 py-2 rounded-md text-sm font-bold transition-all" :class="form.targetType === 'team' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'">Whole Team</button>
           <button @click="form.targetType = 'player'" class="flex-1 py-2 rounded-md text-sm font-bold transition-all" :class="form.targetType === 'player' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'">Single Player</button>
        </div>

        <div v-if="form.targetType === 'team'">
           <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Select Squad</label>
           <select v-model="form.targetId" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="" disabled>Choose a team...</option>
              <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
           </select>
           <div class="bg-indigo-50 p-3 rounded-lg mt-3 flex gap-2 items-start">
              <AlertTriangle class="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p class="text-xs text-indigo-700">Only players with a linked <strong>Parent Email</strong> will receive this request.</p>
           </div>
        </div>

        <div v-else>
           <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Select Member</label>
           <select v-model="form.targetId" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="" disabled>Choose a player...</option>
              <option v-for="p in players" :key="p.id" :value="p.id">{{ p.first_name }} {{ p.last_name }}</option>
           </select>
        </div>

        <div class="flex justify-between items-center pt-4">
           <button @click="prevStep" class="text-slate-400 hover:text-slate-600 font-bold text-sm px-4 py-2 transition flex items-center gap-2">
             <ArrowLeft class="w-4 h-4" /> Back
           </button>
           <button @click="step = 3" :disabled="!form.targetId" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
             Next: Details
           </button>
        </div>
      </div>

      <!-- STEP 3: CONFIRM -->
      <div v-if="step === 3" class="p-6 space-y-4 animate-fade-in">
        <h3 class="text-lg font-bold text-slate-900">Review & Send</h3>
        
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
           <div>
             <label class="text-xs font-bold text-slate-400 uppercase">Amount (£)</label>
             <input v-model="form.amount" type="number" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold text-lg" />
           </div>
           <div>
             <label class="text-xs font-bold text-slate-400 uppercase">Description</label>
             <input v-model="form.description" type="text" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium" />
           </div>
           <div>
             <label class="text-xs font-bold text-slate-400 uppercase">Due Date</label>
             <input v-model="form.dueDate" type="date" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium" />
           </div>
        </div>

        <div class="flex gap-3 pt-4">
            <button @click="prevStep" class="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition">
                Back
            </button>
            <button @click="createInvoices" :disabled="loading" class="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else>Send Requests</span>
                <CheckCircle2 v-if="!loading" class="w-5 h-5" />
            </button>
        </div>
      </div>

    </div>
  </div>
</template>
