<script setup>
import { ref, computed } from 'vue'; // FIXED: Added 'computed'
import { useRouter } from 'vue-router';
import BrandLogo from './BrandLogo.vue';
import { 
  ShieldAlert, Wallet, Gavel, ArrowRight, CheckCircle2, 
  XCircle, Zap, LayoutGrid, Calculator, Check, Minus, Menu
} from 'lucide-vue-next';

const router = useRouter();
const activeDemoTab = ref('selection'); 

// --- PRICING CALCULATOR LOGIC ---
const memberCount = ref(200);
const annualSpend = 250; 

const spondCost = computed(() => {
  const volume = memberCount.value * annualSpend;
  const percentage = volume * 0.025;
  const fixed = memberCount.value * 10 * 0.20;
  return Math.round(percentage + fixed);
});

const sportOsCost = computed(() => {
  return 1188; 
});

const savings = computed(() => spondCost.value - sportOsCost.value);

// Navigation Actions
const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const startOnboarding = () => {
  router.push('/onboarding');
};

const goToDemo = () => {
  router.push('/selection');
};

const competitors = [
  { feature: "Team App & Chat", pitchero: true, spond: true, sportos: true },
  { feature: "Club Website Builder", pitchero: true, spond: false, sportos: true },
  { feature: "Match Fee Collection", pitchero: true, spond: true, sportos: true },
  { feature: "League Eligibility Engine", pitchero: false, spond: false, sportos: true },
  { feature: "Family Wallet (Consolidated)", pitchero: false, spond: false, sportos: true },
  { feature: "Asset Management (Pitches)", pitchero: false, spond: false, sportos: true },
];
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden">
    
    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3 group cursor-pointer" @click="router.push('/')">
          <div class="w-10 h-10 transition-transform group-hover:scale-110 duration-300">
            <BrandLogo />
          </div>
          <span class="text-2xl font-bold tracking-tight text-slate-900">
            Sport<span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">OS</span>
          </span>
        </div>
        
        <div class="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#features" class="hover:text-indigo-600 transition">Features</a>
          <a href="#pricing" class="hover:text-indigo-600 transition">Pricing</a>
          <a href="#comparison" class="hover:text-indigo-600 transition">Comparison</a>
        </div>

        <div class="flex gap-4 items-center">
            <button @click="goToLogin" class="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">
                Log In
            </button>
            <button @click="goToRegister" class="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5">
                Get Started
            </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="container mx-auto px-6 pt-20 pb-32 text-center relative">
      
      <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[120px] -z-10 mix-blend-multiply animate-pulse-slow"></div>
      <div class="absolute top-20 right-1/4 w-[500px] h-[500px] bg-rose-300/30 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse-slow" style="animation-delay: 2s;"></div>
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-wide text-indigo-700 uppercase bg-white rounded-full border border-indigo-100 shadow-sm">
        <Zap class="w-3 h-3 fill-current text-rose-500" />
        The Operating System for Grassroots Sport
      </div>
      
      <h1 class="text-5xl md:text-7xl font-extrabold leading-tight mb-8 tracking-tight text-slate-900">
        The Pulse of<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">Your Entire Club.</span>
      </h1>
      
      <p class="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
        Stop managing twenty separate teams. Start managing <strong>one unified ecosystem</strong>. 
        Automate payments, prevent fines, and connect your community.
      </p>

      <div class="flex flex-col md:flex-row justify-center items-center gap-4">
          <button @click="goToRegister" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30 text-lg active:scale-95">
            Start Free Trial
            <ArrowRight class="w-5 h-5" />
          </button>
          <p class="text-sm text-slate-500">No credit card required</p>
      </div>
      
      <!-- Logos Placeholder -->
      <div class="mt-16 pt-8 border-t border-slate-200/60 max-w-2xl mx-auto opacity-60">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Designed for the Surrey Premier League</p>
        <div class="flex flex-wrap items-center justify-center gap-8 grayscale">
           <div class="h-8 w-24 bg-slate-300 rounded-md"></div>
           <div class="h-8 w-24 bg-slate-300 rounded-md"></div>
           <div class="h-8 w-24 bg-slate-300 rounded-md"></div>
        </div>
      </div>
    </header>

    <!-- Interactive Feature Section (Visual Only - No Routing) -->
    <section id="features" class="bg-white py-24 relative z-10 rounded-t-[3rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
      <div class="container mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          
          <!-- Feature Selection -->
          <div class="space-y-4">
            <h2 class="text-3xl font-bold mb-2 text-slate-900">Why Clubs Switch</h2>
            <p class="text-slate-500 mb-8 text-lg">Spond handles the chat. We handle the compliance and cash.</p>
            
            <button @click="activeDemoTab = 'selection'" 
                 class="w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 relative group"
                 :class="activeDemoTab === 'selection' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-slate-50'">
              <div class="flex items-start gap-4">
                <div class="p-3 rounded-xl shadow-sm" :class="activeDemoTab === 'selection' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'">
                  <ShieldAlert class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="text-lg font-bold mb-1" :class="activeDemoTab === 'selection' ? 'text-indigo-900' : 'text-slate-700'">The Eligibility Engine</h3>
                  <p class="text-sm text-slate-500 leading-relaxed">Stop accidental fines. The app alerts captains if a player is ineligible.</p>
                </div>
              </div>
            </button>

            <button @click="activeDemoTab = 'wallet'"
                 class="w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 relative group"
                 :class="activeDemoTab === 'wallet' ? 'border-emerald-500 bg-emerald-50/50 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-slate-50'">
              <div class="flex items-start gap-4">
                <div class="p-3 rounded-xl shadow-sm" :class="activeDemoTab === 'wallet' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'">
                  <Wallet class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="text-lg font-bold mb-1" :class="activeDemoTab === 'wallet' ? 'text-emerald-900' : 'text-slate-700'">The Family Wallet</h3>
                  <p class="text-sm text-slate-500 leading-relaxed">One invoice for the whole house. Parents pay for siblings and themselves in a single tap.</p>
                </div>
              </div>
            </button>

            <button @click="activeDemoTab = 'rules'"
                 class="w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 relative group"
                 :class="activeDemoTab === 'rules' ? 'border-rose-500 bg-rose-50/50 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-slate-50'">
              <div class="flex items-start gap-4">
                <div class="p-3 rounded-xl shadow-sm" :class="activeDemoTab === 'rules' ? 'bg-rose-500 text-white' : 'bg-white text-slate-400'">
                  <Gavel class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="text-lg font-bold mb-1" :class="activeDemoTab === 'rules' ? 'text-rose-900' : 'text-slate-700'">League Compliance</h3>
                  <p class="text-sm text-slate-500 leading-relaxed">Configure rules instantly. Update every captain's app in real-time.</p>
                </div>
              </div>
            </button>
          </div>

          <!-- Phone Mockup (Marketing Version - Static Data) -->
          <div class="relative mx-auto">
            <div class="relative border-slate-900 bg-slate-900 border-[12px] rounded-[2.5rem] h-[640px] w-[320px] shadow-2xl shadow-slate-900/20 overflow-hidden transform rotate-1 hover:rotate-0 transition duration-500">
              <div class="bg-slate-50 w-full h-full pt-12 pb-4 overflow-y-auto no-scrollbar">
                 
                 <!-- Eligibility View -->
                 <div v-if="activeDemoTab === 'selection'" class="px-4 pt-4">
                    <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                        <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">HK</div>
                             <div>
                                <div class="font-bold text-slate-900">Harry Kane</div>
                                <div class="text-xs text-rose-500 font-bold">Ineligible (8 Apps)</div>
                             </div>
                        </div>
                    </div>
                    <!-- Visual Filler -->
                    <div class="space-y-2 opacity-50">
                        <div class="h-12 bg-white rounded-xl border border-slate-100"></div>
                        <div class="h-12 bg-white rounded-xl border border-slate-100"></div>
                    </div>
                 </div>

                 <!-- Wallet View -->
                 <div v-else-if="activeDemoTab === 'wallet'" class="px-4 pt-4">
                    <div class="bg-slate-900 rounded-2xl p-6 text-white mb-6 shadow-xl">
                        <div class="text-3xl font-bold">£45.00</div>
                        <div class="text-xs text-slate-400">Total Outstanding</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-2 flex justify-between">
                        <span class="font-bold text-sm">Jack (U10)</span><span>£5.00</span>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between">
                        <span class="font-bold text-sm">Sarah (U12)</span><span>£30.00</span>
                    </div>
                 </div>

                 <!-- Rules View -->
                 <div v-else class="px-4 pt-4">
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
                        <h3 class="font-bold text-slate-900 mb-2">Higher Level Apps</h3>
                        <div class="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                             <span class="text-xs font-bold text-slate-400 pl-2">LIMIT</span>
                             <span class="text-xl font-bold text-slate-900">5</span>
                        </div>
                    </div>
                 </div>

              </div>
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20"></div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- NEW PRICING SECTION -->
    <section id="pricing" class="py-24 bg-slate-50 border-t border-slate-200">
      <div class="container mx-auto px-6">
        
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl font-extrabold text-slate-900 mb-4">Stop paying a "Success Tax"</h2>
          <p class="text-lg text-slate-500">
            Other apps charge you more as you grow. We charge a flat fee, so you keep more of your hard-earned match fees.
          </p>
        </div>

        <!-- The Calculator -->
        <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-4xl mx-auto mb-20 transform hover:-translate-y-1 transition duration-500">
           <div class="flex flex-col md:flex-row gap-12 items-center">
              <div class="flex-1 w-full">
                 <div class="flex items-center gap-2 mb-6">
                    <Calculator class="w-6 h-6 text-indigo-600" />
                    <h3 class="font-bold text-lg text-slate-900">Savings Calculator</h3>
                 </div>
                 
                 <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Number of Members</label>
                 <div class="flex items-center gap-4">
                    <input type="range" v-model="memberCount" min="50" max="1000" step="50" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
                    <div class="font-mono font-bold text-xl w-16">{{ memberCount }}</div>
                 </div>
                 <p class="text-xs text-slate-400 mt-4 italic">Based on avg annual spend of £250/member.</p>
              </div>

              <div class="flex-1 w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 flex justify-between items-center">
                 <div>
                    <p class="text-sm font-medium text-slate-500 mb-1">Competitor Fees</p>
                    <p class="text-2xl font-bold text-rose-500">£{{ spondCost.toLocaleString() }}</p>
                 </div>
                 <div class="text-right">
                    <p class="text-sm font-medium text-slate-500 mb-1">Your Savings</p>
                    <p class="text-3xl font-extrabold text-emerald-600">+£{{ Math.max(0, savings).toLocaleString() }}</p>
                    <p class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-100 px-2 py-1 rounded inline-block mt-1">Per Year</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          <!-- Starter -->
          <div class="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col">
            <h3 class="text-xl font-bold text-slate-900">Starter</h3>
            <div class="my-4"><span class="text-4xl font-extrabold">£0</span><span class="text-slate-500">/mo</span></div>
            <p class="text-sm text-slate-500 mb-6">For small clubs just getting started.</p>
            
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex gap-3 text-sm text-slate-600"><Check class="w-5 h-5 text-indigo-600 shrink-0" /> Up to 3 Teams</li>
              <li class="flex gap-3 text-sm text-slate-600"><Check class="w-5 h-5 text-indigo-600 shrink-0" /> Basic Availability</li>
              <li class="flex gap-3 text-sm text-slate-600"><Check class="w-5 h-5 text-indigo-600 shrink-0" /> 3.5% Transaction Fee</li>
            </ul>
            <button class="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition">Get Started</button>
          </div>

          <!-- Club (Popular) -->
          <div class="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col relative overflow-hidden transform scale-105 shadow-2xl">
            <div class="absolute top-0 right-0 bg-gradient-to-bl from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
            <h3 class="text-xl font-bold text-white">Club</h3>
            <div class="my-4"><span class="text-4xl font-extrabold text-white">£49</span><span class="text-slate-400">/mo</span></div>
            <p class="text-sm text-slate-400 mb-6">The complete operating system.</p>
            
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex gap-3 text-sm text-slate-300"><Check class="w-5 h-5 text-indigo-400 shrink-0" /> <strong>0% Platform Fees</strong></li>
              <li class="flex gap-3 text-sm text-slate-300"><Check class="w-5 h-5 text-indigo-400 shrink-0" /> Up to 20 Teams</li>
              <li class="flex gap-3 text-sm text-slate-300"><Check class="w-5 h-5 text-indigo-400 shrink-0" /> Family Wallet</li>
              <li class="flex gap-3 text-sm text-slate-300"><Check class="w-5 h-5 text-indigo-400 shrink-0" /> Treasurer Dashboard</li>
            </ul>
            <button class="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/50">Start Free Trial</button>
          </div>

          <!-- Elite -->
          <div class="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col">
            <h3 class="text-xl font-bold text-slate-900">Elite</h3>
            <div class="my-4"><span class="text-4xl font-extrabold">£99</span><span class="text-slate-500">/mo</span></div>
            <p class="text-sm text-slate-500 mb-6">For large clubs needing governance.</p>
            
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex gap-3 text-sm text-slate-600"><Check class="w-5 h-5 text-rose-500 shrink-0" /> <strong>League Compliance Engine</strong></li>
              <li class="flex gap-3 text-sm text-slate-600"><Check class="w-5 h-5 text-rose-500 shrink-0" /> Unlimited Teams</li>
              <li class="flex gap-3 text-sm text-slate-600"><Check class="w-5 h-5 text-rose-500 shrink-0" /> Asset Management</li>
              <li class="flex gap-3 text-sm text-slate-600"><Check class="w-5 h-5 text-rose-500 shrink-0" /> Priority Support</li>
            </ul>
            <button class="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition">Contact Sales</button>
          </div>

        </div>

      </div>
    </section>

    <!-- Comparison Table (Existing) -->
    <section id="comparison" class="py-24 bg-white">
      <div class="container mx-auto px-6 max-w-5xl">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-extrabold mb-4 text-slate-900">The "Club" Standard</h2>
          <p class="text-lg text-slate-500 max-w-2xl mx-auto">
            See why Treasurers are upgrading from chat apps.
          </p>
        </div>
        
        <div class="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-200/60 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/80">
                <th class="p-6 font-bold text-slate-400 text-xs uppercase tracking-wider w-1/3">Feature</th>
                <th class="p-6 font-bold text-center text-slate-500 text-xs uppercase tracking-wider w-1/5">Pitchero</th>
                <th class="p-6 font-bold text-center text-emerald-600 text-xs uppercase tracking-wider w-1/5">Spond</th>
                <th class="p-6 font-bold text-center text-indigo-600 text-xs uppercase tracking-wider w-1/5 bg-indigo-50/40">SportOS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in competitors" :key="item.feature" class="hover:bg-slate-50 transition group">
                <td class="p-5 font-medium text-slate-700 group-hover:text-indigo-900 transition">{{ item.feature }}</td>
                <td class="p-5 text-center border-l border-slate-50">
                  <CheckCircle2 v-if="item.pitchero" class="w-5 h-5 text-slate-400 mx-auto" />
                  <Minus v-else class="w-4 h-4 text-slate-200 mx-auto" />
                </td>
                <td class="p-5 text-center border-l border-slate-50">
                  <CheckCircle2 v-if="item.spond" class="w-5 h-5 text-emerald-500 mx-auto" />
                  <Minus v-else class="w-4 h-4 text-slate-200 mx-auto" />
                </td>
                <td class="p-5 text-center bg-indigo-50/20 group-hover:bg-indigo-50/40 transition border-l border-indigo-100/50">
                  <div class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm shadow-indigo-200">
                    <CheckCircle2 class="w-4 h-4" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Footer (Existing) -->
    <footer class="bg-slate-900 text-slate-400 py-16 text-center border-t border-slate-800 mt-12">
      <div class="container mx-auto px-6">
        <div class="flex items-center justify-center gap-3 mb-8 opacity-80 hover:opacity-100 transition duration-500">
           <div class="w-8 h-8">
            <BrandLogo />
          </div>
          <span class="text-2xl font-bold text-white tracking-tight">SportOS</span>
        </div>
        <p class="text-sm mb-8 max-w-sm mx-auto">© 2025 SportOS UK. Built for the love of the game.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
