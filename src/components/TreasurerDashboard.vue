<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '../supabase';
import { useClub } from '../composables/useClub'; 
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import { Heart, Plus, ArrowRight, HandCoins } from 'lucide-vue-next';

import InvoiceModal from './club/InvoiceModal.vue';

const { activeClubId, activeClubName } = useClub();
const { showToast } = useToast();
const { showConfirm } = useConfirm();

const loading = ref(true);
const totalPending = ref(0);
const recentTransactions = ref([]);
const pendingCount = ref(0);
const isCharging = ref(false);

// FIX: Ensure this is explicitly false
const showInvoiceModal = ref(false);

onMounted(async () => {
  await fetchClubFinances();
});

watch(activeClubId, () => {
  fetchClubFinances();
});

async function fetchClubFinances() {
  loading.value = true;
  try {
    const { data: ledgerData, error } = await supabase
      .from('ledger')
      .select(`
        amount, 
        status, 
        created_at, 
        description,
        players!inner(first_name, last_name, club_id)
      `)
      .eq('status', 'pending')
      .eq('players.club_id', activeClubId.value)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!ledgerData) {
        totalPending.value = 0;
        pendingCount.value = 0;
        recentTransactions.value = [];
        return;
    }

    totalPending.value = ledgerData.reduce((sum, item) => sum + item.amount, 0);
    pendingCount.value = new Set(ledgerData.map(i => i.players?.last_name)).size;
    recentTransactions.value = ledgerData.slice(0, 5);

  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const openInvoiceWizard = () => {
  showInvoiceModal.value = true;
};

const handleInvoiceSent = () => {
  fetchClubFinances();
};

// New Function for the "Nudge" button
const sendNudge = async () => {
  const confirmed = await showConfirm(
    "Send Reminders?", 
    `This will send an email notification to ${pendingCount.value} families with outstanding contributions.`
  );
  if (confirmed) {
    showToast("Reminders Sent", "Families have been notified.", "success");
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-12">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-6 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
               {{ activeClubName }} Health
            </h1>
            <p class="text-sm text-slate-500">Tracking fair share contributions</p>
          </div>
          
          <button @click="openInvoiceWizard" 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <Plus class="w-4 h-4" />
            Request Fees
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Pending Contributions -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-500">
            <HandCoins class="w-16 h-16 text-indigo-600" />
          </div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Contributions</div>
          <div class="text-4xl font-extrabold text-slate-900">£{{ totalPending.toFixed(2) }}</div>
          <div class="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            Funds waiting to clear
          </div>
        </div>

        <!-- Families Pending -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Awaiting Action</div>
          <div class="text-4xl font-extrabold text-slate-900">{{ pendingCount }}</div>
          <div class="mt-4 text-xs text-slate-500">Families yet to contribute</div>
        </div>

        <!-- Support Rate -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fair Play Score</div>
          <div class="text-4xl font-extrabold text-emerald-600">84%</div>
          <div class="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full" style="width: 84%"></div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Feed -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- The Ledger Feed -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 class="font-bold text-slate-900">Live Feed</h3>
            <button class="text-indigo-600 text-xs font-bold hover:underline">View Ledger</button>
          </div>
          
          <div v-if="recentTransactions.length === 0" class="p-12 text-center text-slate-400 text-sm">
              No financial activity recorded yet.
          </div>

          <div v-else class="divide-y divide-slate-50">
            <div v-for="(item, i) in recentTransactions" :key="i" class="p-4 flex items-center justify-between hover:bg-slate-50 transition">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {{ item.players?.first_name[0] || '?' }}
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-900">
                    {{ item.players?.first_name }} {{ item.players?.last_name }}
                  </div>
                  <div class="text-xs text-slate-400">{{ item.description || 'Request Sent' }}</div>
                </div>
              </div>
              <span class="text-sm font-medium text-slate-400">£{{ item.amount }}</span>
            </div>
          </div>
        </div>

        <!-- Action Center -->
        <div class="space-y-6">
          <div class="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 opacity-20">
                <Heart class="w-32 h-32" />
            </div>
            
            <h3 class="font-bold text-lg mb-2 relative z-10">Community Pulse</h3>
            <p class="text-indigo-100 text-sm mb-6 relative z-10">
              The "Mens 2nd XI" has <strong>£420.00</strong> in pending support. A gentle nudge can help them get match-ready.
            </p>
            <button @click="sendNudge" class="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 transition relative z-10">
              Send Gentle Nudge <ArrowRight class="w-4 h-4" />
            </button>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
             <h3 class="font-bold text-slate-900 mb-4">Quick Actions</h3>
             <div class="grid grid-cols-2 gap-4">
               <button class="p-4 rounded-xl border border-slate-100 hover:border-indigo-500 hover:text-indigo-600 transition text-sm font-medium text-slate-600 text-center">
                 Add Expense
               </button>
               <button class="p-4 rounded-xl border border-slate-100 hover:border-indigo-500 hover:text-indigo-600 transition text-sm font-medium text-slate-600 text-center">
                 Export Report
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Modal Injection -->
    <InvoiceModal 
      v-if="showInvoiceModal" 
      @close="showInvoiceModal = false" 
      @sent="handleInvoiceSent" 
    />

  </div>
</template>
