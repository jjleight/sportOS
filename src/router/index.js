import { createRouter, createWebHistory } from 'vue-router'
import { useUser } from '../composables/useUser'; 

// Components
import LandingPage from '../components/LandingPage.vue'
import TeamSelection from '../components/TeamSelection.vue'
import FamilyWallet from '../components/FamilyWallet.vue'
import TreasurerDashboard from '../components/TreasurerDashboard.vue'
import LeagueRules from '../components/LeagueRules.vue'
import ClubAdmin from '../components/ClubAdmin.vue'
import ClubOnboarding from '../components/ClubOnboarding.vue'
import FixtureManager from '../components/FixtureManager.vue'
import MatchDayHub from '../components/parent/MatchDayHub.vue'
import LoginPage from '../components/auth/LoginPage.vue'
import RegisterPage from '../components/auth/RegisterPage.vue'

const routes = [
  { path: '/', component: LandingPage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/onboarding', component: ClubOnboarding, meta: { requiresAuth: true } },
  { path: '/selection', component: TeamSelection, meta: { requiresAuth: true } },
  { path: '/fixtures', component: FixtureManager, meta: { requiresAuth: true } },
  { path: '/treasurer', component: TreasurerDashboard, meta: { requiresAuth: true } },
  { path: '/rules', component: LeagueRules, meta: { requiresAuth: true } },
  { path: '/admin', component: ClubAdmin, meta: { requiresAuth: true } },
  { path: '/wallet', component: FamilyWallet },
  { path: '/hub', component: MatchDayHub, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// SAFE GUARD
router.beforeEach(async (to, from, next) => {
  try {
    const { user, initAuth } = useUser();
    
    // Only check auth if we haven't yet (prevents infinite loops)
    if (!user.value) {
        await initAuth();
    }
    
    const isAuthenticated = !!user.value;

    if (to.meta.requiresAuth && !isAuthenticated) {
      return next('/login');
    }
    
    next();
  } catch (error) {
    console.error("Router Guard Error:", error);
    // If auth fails, let them go to home/login rather than white screen
    if (to.path !== '/' && to.path !== '/login') next('/login');
    else next(); 
  }
});

export default router
