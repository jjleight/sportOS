import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../components/LandingPage.vue'
import TeamSelection from '../components/TeamSelection.vue'
import FamilyWallet from '../components/FamilyWallet.vue'
import TreasurerDashboard from '../components/TreasurerDashboard.vue'
import LeagueRules from '../components/LeagueRules.vue'
import ClubAdmin from '../components/ClubAdmin.vue'
import ClubOnboarding from '../components/ClubOnboarding.vue'
import FixtureManager from '../components/FixtureManager.vue'
import MatchDayHub from '../components/parent/MatchDayHub.vue' // Import Hub

const routes = [
  { path: '/', component: LandingPage },
  { path: '/onboarding', component: ClubOnboarding },
  { path: '/selection', component: TeamSelection, meta: { requires: 'manage_team' } },
  { path: '/fixtures', component: FixtureManager, meta: { requires: 'manage_team' } },
  { path: '/treasurer', component: TreasurerDashboard, meta: { requires: 'manage_finance' } },
  { path: '/rules', component: LeagueRules, meta: { requires: 'edit_compliance' } },
  { path: '/admin', component: ClubAdmin, meta: { requires: 'manage_club' } },
  { path: '/wallet', component: FamilyWallet }, // Parent
  { path: '/hub', component: MatchDayHub } // Parent
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

import { useUser } from '../composables/useUser';
router.beforeEach((to, from, next) => {
  const { can } = useUser();
  if (to.meta.requires && !can(to.meta.requires)) {
    return next('/'); 
  }
  next();
});

export default router
