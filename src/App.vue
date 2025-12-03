<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUser } from './composables/useUser';
import BrandLogo from './components/BrandLogo.vue';
import ToastManager from './components/ToastManager.vue';
import ConfirmationModal from './components/ConfirmationModal.vue';
import RoleSwitcher from './components/RoleSwitcher.vue'; 
import { 
  LayoutGrid, 
  Wallet, 
  HandCoins, 
  Settings, 
  LogOut, 
  Menu, 
  Gavel, 
  Users,
  Calendar 
} from 'lucide-vue-next';

const route = useRoute();
const isLandingPage = computed(() => route.path === '/' || route.path === '/onboarding');
const { permissions } = useUser(); 
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 flex relative">
    
    <ToastManager />
    <ConfirmationModal /> 

    <aside v-if="!isLandingPage" class="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 border-r border-slate-800 transition-all">
      <div class="p-6 flex items-center gap-3 cursor-pointer" @click="$router.push('/')">
        <div class="w-8 h-8">
          <BrandLogo />
        </div>
        <span class="text-xl font-bold text-white tracking-tight">Sport<span class="text-indigo-500">OS</span></span>
      </div>

      <nav class="flex-1 px-4 space-y-2 mt-4">
        
        <router-link v-if="permissions.canSelectTeam" to="/selection" class="nav-row" active-class="active">
          <LayoutGrid class="w-5 h-5" />
          <span>Team Selection</span>
        </router-link>

        <!-- Parent Links -->
        <router-link v-if="permissions.isParent" to="/hub" class="nav-row" active-class="active">
          <Calendar class="w-5 h-5" />
          <span>Match Day Hub</span>
        </router-link>

        <router-link to="/wallet" class="nav-row" active-class="active">
          <Wallet class="w-5 h-5" />
          <span>My Wallet</span>
        </router-link>
        <!-- End Parent Links -->

        <router-link v-if="permissions.canManageMoney" to="/treasurer" class="nav-row" active-class="active">
          <HandCoins class="w-5 h-5" />
          <span>Club Health</span>
        </router-link>

        <router-link v-if="permissions.canSelectTeam || permissions.canEditRules" to="/fixtures" class="nav-row" active-class="active">
          <Calendar class="w-5 h-5" />
          <span>Fixtures</span>
        </router-link>

        <router-link v-if="permissions.canEditRules" to="/rules" class="nav-row" active-class="active">
          <Gavel class="w-5 h-5" />
          <span>Compliance</span>
        </router-link>

        <router-link v-if="permissions.canEditRules" to="/admin" class="nav-row" active-class="active">
          <Users class="w-5 h-5" />
          <span>Club Admin</span>
        </router-link>

        <div class="nav-row opacity-50 cursor-not-allowed">
          <Settings class="w-5 h-5" />
          <span>Settings</span>
        </div>
      </nav>

      <div class="p-4 border-t border-slate-800 space-y-4">
        <RoleSwitcher theme="dark" direction="up" />
        <router-link to="/" class="flex items-center gap-3 text-sm font-medium hover:text-white transition px-2">
          <LogOut class="w-4 h-4" />
          Back to Home
        </router-link>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      
      <div v-if="!isLandingPage" class="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8">
            <BrandLogo />
          </div>
          <span class="font-bold text-lg text-slate-900">SportOS</span>
        </div>
        <div class="w-40">
           <RoleSwitcher theme="light" direction="down" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto" :class="!isLandingPage ? 'p-0 md:p-8' : ''">
        <div :class="!isLandingPage ? 'max-w-5xl mx-auto' : 'w-full'">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>

      <!-- MOBILE BOTTOM NAV -->
      <nav v-if="!isLandingPage" class="md:hidden bg-white border-t border-slate-200 flex justify-around items-center p-2 pb-safe z-30 sticky bottom-0">
        
        <router-link v-if="permissions.canSelectTeam" to="/selection" class="mobile-nav-item" active-class="active">
          <LayoutGrid class="w-6 h-6" />
          <span>Team</span>
        </router-link>

        <!-- Parent Link -->
        <router-link v-if="permissions.isParent" to="/hub" class="mobile-nav-item" active-class="active">
          <Calendar class="w-6 h-6" />
          <span>Match Day</span>
        </router-link>

        <router-link to="/wallet" class="mobile-nav-item" active-class="active">
          <Wallet class="w-6 h-6" />
          <span>Wallet</span>
        </router-link>

        <router-link v-if="permissions.canSelectTeam" to="/fixtures" class="mobile-nav-item" active-class="active">
          <Calendar class="w-6 h-6" />
          <span>Matches</span>
        </router-link>

        <router-link v-if="permissions.canManageMoney" to="/treasurer" class="mobile-nav-item" active-class="active">
          <HandCoins class="w-6 h-6" />
          <span>Money</span>
        </router-link>

        <router-link v-if="permissions.canEditRules" to="/admin" class="mobile-nav-item" active-class="active">
          <Users class="w-6 h-6" />
          <span>Admin</span>
        </router-link>
      </nav>

    </main>
  </div>
</template>

<style scoped>
.nav-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  color: #94a3b8;
}
.nav-row:hover { background-color: #1e293b; color: white; }
.nav-row.active { background-color: #4f46e5; color: white; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}
.mobile-nav-item.active { color: #4f46e5; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
</style>
