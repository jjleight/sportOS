<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClub } from '../composables/useClub';
import { useUser } from '../composables/useUser'; // Import User State
import { useToast } from '../composables/useToast';
import BrandLogo from './BrandLogo.vue';
import { ArrowRight, Trophy, User, Mail, Calendar, Palette, CheckCircle2, Sparkles } from 'lucide-vue-next';

const router = useRouter();
const { createClub } = useClub();
const { user, fetchProfile } = useUser(); // Get User & Fetcher
const { showToast } = useToast();

const step = ref(1);
const loading = ref(false);

// Form Data
const form = ref({
  // Step 1: Club
  clubName: '',
  sport: 'Football',
  county: '',
  color: '#4F46E5', 
  
  // Step 2: The Creator (You)
  firstName: '',
  lastName: '',
  role: 'Treasurer', 
  dob: '',
  phone: '',
  
  // Step 3: The Others (Invites)
  secretaryEmail: '',
  chairmanEmail: ''
});

const progressWidth = computed(() => {
  if (step.value === 1) return '33%';
  if (step.value === 2) return '66%';
  return '100%';
});

const nextStep = () => {
  if (step.value === 1 && !form.value.clubName) return showToast('Required', 'Please enter a club name', 'error');
  if (step.value === 2 && (!form.value.firstName || !form.value.lastName)) return showToast('Required', 'Please enter your details', 'error');
  
  step.value++;
};

const handleFinalSubmit = async () => {
  loading.value = true;
  try {
    // 1. Create the Club AND Link User as Admin
    // We pass user.value so useClub knows who to promote
    await createClub(form.value.clubName, user.value);
    
    // 2. Refresh Profile so the App knows we are now an Admin
    await fetchProfile();
    
    // In a real backend, you would now send invite emails to Secretary/Chairman here
    
    showToast('Club Created', `Welcome to SportOS, ${form.value.firstName}!`, 'success');
    router.push('/admin');
  } catch (error) {
    console.error(error);
    showToast('Error', 'Could not create club. Try again.', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    
    <!-- Background Decor -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-[100px] -z-10"></div>

    <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
      
      <!-- Header -->
      <div class="bg-slate-900 p-8 text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-2xl opacity-20 -mr-10 -mt-10"></div>
        
        <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10 shadow-inner">
          <BrandLogo class="w-10 h-10" />
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">Setup Your Club</h1>
        <p class="text-indigo-200 text-sm">Step {{ step }} of 3</p>
        
        <!-- Progress Bar -->
        <div class="w-full h-1 bg-slate-800 mt-6 rounded-full overflow-hidden">
          <div class="h-full bg-indigo-500 transition-all duration-500" :style="{ width: progressWidth }"></div>
        </div>
      </div>

      <!-- STEP 1: THE CLUB -->
      <div v-if="step === 1" class="p-8 space-y-6 animate-fade-in">
        <h2 class="text-lg font-bold text-slate-900">Club Details</h2>
        
        <div>
          <label class="label">Club Name</label>
          <div class="input-group">
            <Trophy class="icon" />
            <input v-model="form.clubName" type="text" placeholder="e.g. Melchester Rovers" class="input" autofocus />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Sport</label>
            <select v-model="form.sport" class="input bg-white">
              <option>Football</option>
              <option>Cricket</option>
              <option>Rugby</option>
            </select>
          </div>
          <div>
            <label class="label">County / Area</label>
            <input v-model="form.county" type="text" placeholder="e.g. Surrey FA" class="input" />
          </div>
        </div>

        <div>
          <label class="label">Primary Club Color</label>
          <div class="flex gap-3 mt-2">
            <button v-for="c in ['#4F46E5', '#DC2626', '#059669', '#2563EB', '#F59E0B', '#000000']" 
                    :key="c"
                    @click="form.color = c"
                    class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                    :class="form.color === c ? 'border-slate-900 scale-110 ring-2 ring-slate-200' : 'border-transparent'"
                    :style="{ backgroundColor: c }">
            </button>
          </div>
        </div>

        <button @click="nextStep" class="btn-primary">Next: Your Profile <ArrowRight class="w-4 h-4" /></button>
      </div>

      <!-- STEP 2: THE USER (YOU) -->
      <div v-if="step === 2" class="p-8 space-y-6 animate-fade-in">
        <h2 class="text-lg font-bold text-slate-900">Your Profile</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">First Name</label>
            <input v-model="form.firstName" type="text" class="input" placeholder="John" />
          </div>
          <div>
            <label class="label">Surname</label>
            <input v-model="form.lastName" type="text" class="input" placeholder="Smith" />
          </div>
        </div>

        <div>
          <label class="label">Your Role</label>
          <select v-model="form.role" class="input bg-white">
            <option>Treasurer</option>
            <option>Secretary</option>
            <option>Chairman/Owner</option>
            <option>Welfare Officer</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Date of Birth</label>
            <div class="input-group">
              <Calendar class="icon" />
              <input v-model="form.dob" type="date" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Phone</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="07700..." />
          </div>
        </div>

        <button @click="nextStep" class="btn-primary">Next: Key Contacts <ArrowRight class="w-4 h-4" /></button>
      </div>

      <!-- STEP 3: THE OFFICERS (INVITES) -->
      <div v-if="step === 3" class="p-8 space-y-6 animate-fade-in">
        <h2 class="text-lg font-bold text-slate-900">Key Officials (Optional)</h2>
        <div class="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start border border-indigo-100 mb-4">
          <Sparkles class="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p class="text-xs text-indigo-800 leading-relaxed">
            <strong>Pro Tip:</strong> We will send them an invite to complete their own profile. If you hold these roles, leave blank.
          </p>
        </div>
        
        <div v-if="form.role !== 'Secretary'">
          <label class="label">Club Secretary Email</label>
          <div class="input-group">
            <Mail class="icon" />
            <input v-model="form.secretaryEmail" type="email" class="input" placeholder="secretary@club.com" />
          </div>
        </div>

        <div v-if="form.role !== 'Chairman/Owner'">
          <label class="label">Chairman/Owner Email</label>
          <div class="input-group">
            <Mail class="icon" />
            <input v-model="form.chairmanEmail" type="email" class="input" placeholder="chairman@club.com" />
          </div>
        </div>

        <button @click="handleFinalSubmit" :disabled="loading" class="btn-primary">
          <span v-if="loading">Building Club...</span>
          <span v-else>Launch SportOS</span>
          <CheckCircle2 v-if="!loading" class="w-4 h-4" />
        </button>
      </div>

    </div>
    
    <button v-if="step > 1" @click="step--" class="mt-8 text-slate-400 text-sm font-bold hover:text-slate-600 transition">
      Go Back
    </button>
    <button v-else @click="$router.push('/')" class="mt-8 text-slate-400 text-sm font-bold hover:text-slate-600 transition">
      Cancel
    </button>

  </div>
</template>

<style scoped>
.label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748B;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
}

.input-group {
  position: relative;
}

.input-group .icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #94A3B8;
}

.input {
  width: 100%;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #0F172A;
  outline: none;
  transition: all 0.2s;
}

.input-group .input {
  padding-left: 3rem;
}

.input:focus {
  background-color: #FFFFFF;
  border-color: #6366F1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.btn-primary {
  width: 100%;
  background-color: #4F46E5;
  color: white;
  font-weight: 700;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #4338CA;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
