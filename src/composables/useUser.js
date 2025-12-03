import { ref, computed } from 'vue';
import { checkPermission } from '../utils/permissions';

// STATE: Simulating a logged-in user with specific context
// In a real app, this would be populated by Supabase Auth + Fetching 'user_roles' table
const currentUser = ref({
  id: 'user_123',
  name: 'Demo User',
  roles: [
    { role: 'admin', context: 'club' } // Default to Super User for demo start
  ]
});

export function useUser() {
  
  // 1. The Permission Logic (The Brain)
  const can = (action, resourceTeamId = null) => {
    const roles = currentUser.value.roles;
    
    return checkPermission(currentUser.value.roles, action);
  };

  // 2. Computed Permissions Object (For easy v-if bindings in templates)
  const permissions = computed(() => ({
    isSuperAdmin: can('manage_club'),
    canManageMoney: can('manage_finance'),
    canSelectTeam: can('manage_team'),
    canEditRules: can('edit_compliance'),
    canViewSafeguarding: can('view_safeguarding'),
    isParent: can('pay_wallet')
  }));

  // 3. Demo Persona Switcher (Updates the mock roles instantly)
  const setPersona = (personaKey) => {
    switch (personaKey) {
      case 'admin':
        currentUser.value.roles = [{ role: 'admin' }];
        break;
      case 'treasurer':
        currentUser.value.roles = [{ role: 'treasurer' }];
        break;
      case 'secretary':
        currentUser.value.roles = [{ role: 'secretary' }];
        break;
      case 'coach':
        currentUser.value.roles = [{ role: 'coach' }];
        break;
      case 'welfare':
        currentUser.value.roles = [{ role: 'welfare_officer' }];
        break;
      case 'parent':
        currentUser.value.roles = [{ role: 'parent' }];
        break;
    }
  };

  return {
    currentUser,
    permissions,
    can,
    setPersona
  };
}
