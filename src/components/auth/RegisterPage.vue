<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '../../composables/useUser';
import { useToast } from '../../composables/useToast';
import BrandLogo from '../BrandLogo.vue';

const router = useRouter();
const { register } = useUser();
const { showToast } = useToast();

const form = ref({ firstName: '', lastName: '', email: '', password: '' });
const loading = ref(false);

const handleRegister = async () => {
  loading.value = true;
  try {
    await register(form.value.email, form.value.password, form.value.firstName, form.value.lastName);
    showToast('Account Created', 'Let\'s set up your club.', 'success');
    router.push('/onboarding'); // Send them to Club Wizard
  } catch (error) {
    showToast('Error', error.message, 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
      
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <BrandLogo class="w-8 h-8" />
        </div>
        <h1 class="text-xl font-bold text-slate-900">Start your SportOS Journey</h1>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
           <div>
             <label class="label">First Name</label>
             <input v-model="form.firstName" type="text" class="input" required />
           </div>
           <div>
             <label class="label">Last Name</label>
             <input v-model="form.lastName" type="text" class="input" required />
           </div>
        </div>
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" class="input" required />
        </div>
        <div>
          <label class="label">Password</label>
          <input v-model="form.password" type="password" class="input" required minlength="6" />
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">
          {{ loading ? 'Creating...' : 'Create Account' }}
        </button>
      </form>
      
      <div class="mt-6 text-center text-sm">
        <span class="text-slate-400">Already have an account? </span>
        <router-link to="/login" class="text-indigo-600 font-bold hover:underline">Log in</router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
.label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748B;
  margin-bottom: 0.3rem;
}

.input {
  width: 100%;
  background-color: #F8FAFC; /* FIXED: Was 'bg-slate-50' */
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  outline: none;
  color: #0F172A;
  font-weight: 500;
}

.input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
