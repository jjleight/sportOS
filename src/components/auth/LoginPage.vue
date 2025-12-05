<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '../../composables/useUser';
import { useToast } from '../../composables/useToast';
import BrandLogo from '../BrandLogo.vue';

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const { login } = useUser();
const { showToast } = useToast();

const handleLogin = async () => {
  loading.value = true;
  try {
    await login(email.value, password.value);
    showToast('Welcome Back', 'Signed in successfully', 'success');
    router.push('/hub'); // Default landing
  } catch (error) {
    showToast('Login Failed', error.message, 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BrandLogo class="w-10 h-10" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Sign In to SportOS</h1>
        <p class="text-slate-500 text-sm mt-2">Manage your club, team, or family.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
          <input v-model="email" type="email" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition" required />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
          <input v-model="password" type="password" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition" required />
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center">
          <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-slate-400">New club? </span>
        <router-link to="/register" class="text-indigo-600 font-bold hover:underline">Create Account</router-link>
      </div>

    </div>
  </div>
</template>
