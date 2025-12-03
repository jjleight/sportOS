<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import BrandLogo from './BrandLogo.vue';
import { 
  ShieldAlert, Wallet, Gavel, ArrowRight, CheckCircle2, 
  XCircle, Zap, Check, Star, Calculator
} from 'lucide-vue-next';

const router = useRouter();
const activeDemoTab = ref('selection'); 

// --- PRICING CALCULATOR LOGIC ---
const memberCount = ref(200);
const annualSpend = 250; // Avg spend per member

const spondCost = computed(() => {
  // Spond approx 2.5% + 20p. Assume 10 transactions per year per member.
  const volume = memberCount.value * annualSpend;
  const percentage = volume * 0.025;
  const fixed = memberCount.value * 10 * 0.20;
  return Math.round(percentage + fixed);
});

const sportOsCost = computed(() => {
  // SportOS Elite: £99/mo * 12 = £1188. 
  // Plus Stripe Direct (1.4% + 20p) - Optional to show, but for comparison we compare "Platform Cost"
  return 1188; 
});

const savings = computed(() => spondCost.value - sportOsCost.value);

const goToDemo = () => { router.push('/selection'); };
const startOnboarding = () => { router.push('/onboarding'); };
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden">
    
    <!-- Navbar (Existing) -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
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
        </div>
        <div class="flex gap-4 items-center">
            <button @click="startOnboarding" class="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">Create Club</button>
            <button @click="goToDemo" class="hidden md:flex bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5">Launch Demo</button>
        </div>
      </div>
    </nav>

    <!-- Hero Section (Existing) -->
    <header class="container mx-auto px-6 pt-20 pb-32 text-center relative">
      <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>
      <div class="absolute top-20 right-1/4 w-[500px] h-[500px] bg-rose-300/30 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-wide text-indigo-700 uppercase bg-white rounded-full border border-indigo-100 shadow-sm">
        <Zap class="w-3 h-3 fill-current text-rose-500" />
        The Operating System for Grassroots Sport
      </div>
      <h1 class="text-5xl md:text-7xl font-extrabold leading-tight mb-8 tracking-tight text-slate-900">
        The Pulse of<br /><span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">Your Entire Club.</span>
      </h1>
      <p class="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
        Stop managing twenty separate teams. Start managing <strong>one unified ecosystem</strong>. 
        Automate payments, prevent fines, and connect your community.
      </p>
      <div class="flex flex-col md:flex-row justify-center items-center gap-4">
          <button @click="goToDemo" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30 text-lg active:scale-95">
            Try the Interactive Demo <ArrowRight class="w-5 h-5" />
          </button>
      </div>
    </header>

    <!-- Features (Existing) -->
    <section id="features" class="bg-white py-24 relative z-10 rounded-t-[3rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
       <!-- (Existing Feature Content would go here - omitted for brevity in this snippet) -->
       <div class="container mx-auto px-6 text-center mb-16">
          <h2 class="text-3xl font-bold mb-4">Built for Operations.</h2>
          <p class="text-slate-500">See the difference between a chat app and an operating system.</p>
       </div>
       <!-- Keeping it short for this update example -->
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
