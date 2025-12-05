<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../supabase';
import { useHousehold } from '../composables/useHousehold'; // Import the shared logic
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import { 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  Receipt, 
  Building2 
} from 'lucide-vue-next';

// Use the Composable
const { householdId, householdName, fetchHousehold } = useHousehold();
const { showToast } = useToast();
const { showConfirm } = useConfirm();

const loading = ref(true);
const ledgerItems = ref([]);
const paymentMethod = ref('bank');

onMounted(async () => {
  // Ensure we have the right household loaded
  if (!householdId.value) await fetchHousehold();
  if (householdId.value) await fetchWallet();
});

// Watch for changes (e.g. User logs in, or Admin switches clubs)
watch(householdId, (newId) => {
  if (newId) fetchWallet();
});

async function fetchWallet() {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('ledger')
      .select(`
        id, amount, description, created_at,
        players ( first_name, last_name )
      `)
      .eq('household_id', householdId.value) // Use Global State ID
      .eq('status', 'pending');

    if (error) throw error;
    ledgerItems.value = data || [];
  } catch (error) {
    console.error('Error fetching wallet:', error);
  } finally {
    loading.value = false;
  }
}

const totalDue = computed(() => {
  return ledgerItems.value.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
});

const handlePayment = async () => {
  const methodText = paymentMethod.value === 'bank' ? 'Instant Bank Transfer (Open Banking)' : 'Card / Apple Pay';
  
  const isConfirmed = await showConfirm(
    `Pay £${totalDue.value}`, 
    `Proceed with ${methodText}?`
  );

  if (!isConfirmed) return;
  
  // In a real app: Trigger Stripe/GoCardless here
  // For demo: Optimistic clear
  ledgerItems.value = [];
  showToast('Payment Successful', 'Thank you for supporting the club!', 'success');
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    
    <!-- Header -->
    <div class="bg-indigo-600 text-white p-6 pt-12 shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div class="relative z-10">
        <div class="flex justify-between items-start">
            <div>
                <h2 class="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">
                    {{ householdName }}
                </h2>
                <h1 class="text-4xl font-extrabold">£{{ totalDue }}</h1>
            </div>
            <!-- Dynamic Badge -->
            <div v-if="householdId === 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11'" class="bg-indigo-800/50 p-2 rounded text-xs font-bold">
                Demo Mode
            </div>
        </div>
        
        <div class="text-xs text-indigo-200 font-medium flex gap-2 items-center mt-4">
          <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          Payments due by 1st of Month
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-6">
      
      <div v-if="loading" class="text-center text-slate-400 py-10">Loading Wallet...</div>
      
      <!-- Empty State -->
      <div v-else-if="ledgerItems.length === 0" class="text-center py-16">
          <div class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
             <CheckCircle2 class="w-10 h-10" />
          </div>
          <h3 class="text-slate-900 font-bold text-xl">All Paid Up!</h3>
          <p class="text-slate-500 text-sm mt-1">No outstanding requests.</p>
      </div>

      <!-- List of Debts -->
      <div v-else>
          <div class="flex justify-between items-end mb-4">
            <h3 class="font-bold text-slate-900 text-lg">Outstanding Items</h3>
          </div>

          <div class="space-y-3 mb-6">
            <div v-for="item in ledgerItems" :key="item.id" 
                class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                    {{ item.players?.first_name[0] || '?' }}
                </div>
                <div>
                    <div class="font-bold text-slate-800 text-sm">{{ item.description }}</div>
                    <div class="text-xs text-slate-400">{{ item.players?.first_name }}</div>
                </div>
                </div>
                <div class="font-bold text-slate-900">£{{ item.amount }}</div>
            </div>
          </div>

          <!-- Payment Method Selector -->
          <div class="bg-white p-1.5 rounded-xl flex gap-1 border border-slate-200 mb-4 shadow-sm">
            <button @click="paymentMethod = 'bank'" 
                    class="flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                    :class="paymentMethod === 'bank' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'">
                <Building2 class="w-4 h-4" />
                <div class="text-left">
                  <span class="block">Bank App</span>
                  <span class="text-[9px] font-normal opacity-80">No Fees</span>
                </div>
                <div v-if="paymentMethod === 'bank'" class="absolute top-0 right-0 bg-emerald-500 w-2 h-2 rounded-full -mr-0.5 -mt-0.5 animate-ping"></div>
            </button>
            
            <button @click="paymentMethod = 'card'" 
                    class="flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                    :class="paymentMethod === 'card' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'">
                <CreditCard class="w-4 h-4" />
                <div class="text-left">
                  <span class="block">Card / Apple Pay</span>
                  <span class="text-[9px] font-normal opacity-80">+ 20p fee</span>
                </div>
            </button>
          </div>

          <button @click="handlePayment" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 flex items-center justify-center gap-2">
             Pay £{{ totalDue }} Now
             <ChevronRight class="w-5 h-5" />
          </button>
          
          <p class="text-center text-[10px] text-slate-400 mt-3 flex justify-center items-center gap-1">
            <Receipt class="w-3 h-3" /> Secure Payment via SportOS
          </p>
      </div>
      
    </div>
  </div>
</template>
