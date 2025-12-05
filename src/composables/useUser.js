import { ref, computed } from 'vue';
import { supabase } from '../supabase';
import { useClub } from './useClub';

// Global State
const user = ref(null);        
const profile = ref(null);     
const userRoles = ref([]); // NEW: Store detailed roles (e.g. Coach of Team A)
const overrideRole = ref(null); 
const loading = ref(true);

export function useUser() {
  const { activeClubId, activeClubName } = useClub();
  
  // 1. Active Role Calculation
  const activeRole = computed(() => {
    return overrideRole.value || profile.value?.role || 'guest';
  });

  // NEW: Computed list of Team IDs this user manages
  const managedTeamIds = computed(() => {
    // Admins/Secretaries/Treasurers manage ALL teams
    if (['admin', 'secretary', 'treasurer'].includes(activeRole.value)) return 'all';
    
    // Coaches only manage specific teams found in user_roles
    return userRoles.value
      .filter(r => r.role === 'coach' && r.team_id)
      .map(r => r.team_id);
  });

  // 2. Permission Logic
  const can = (action, resourceTeamId = null) => {
    const role = activeRole.value; 
    if (role === 'admin') return true;

    switch (action) {
      case 'manage_club': return role === 'secretary';
      case 'manage_finance': return role === 'treasurer';
      
      case 'manage_team': 
        // Specific Team Check
        if (resourceTeamId) {
            if (['admin', 'secretary'].includes(role)) return true;
            // Check if user has a row in user_roles for this specific team
            return userRoles.value.some(r => r.team_id === resourceTeamId && r.role === 'coach');
        }
        return role === 'coach' || role === 'secretary';
      
      case 'edit_compliance': return ['secretary', 'treasurer'].includes(role);
      case 'view_safeguarding': return role === 'welfare_officer';
      case 'pay_wallet': return ['parent', 'player'].includes(role);
      default: return false;
    }
  };

  const permissions = computed(() => ({
    isSuperAdmin: can('manage_club'),
    canManageMoney: can('manage_finance'),
    canSelectTeam: can('manage_team'),
    canEditRules: can('edit_compliance'),
    isParent: can('pay_wallet'),
    isAuthenticated: !!user.value,
    managedTeamIds: managedTeamIds.value // Expose to components
  }));

  // 3. Fetch Data
  const initAuth = async () => {
    loading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      user.value = session.user;
      await fetchProfile();
    }
    loading.value = false;
  };

  const fetchProfile = async () => {
    if (!user.value) return;
    try {
      // A. Get Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, clubs(name)')
        .eq('id', user.value.id)
        .single();

      if (profileData) {
        profile.value = profileData;
        if (profileData.club_id) {
          activeClubId.value = profileData.club_id;
          activeClubName.value = profileData.clubs?.name;
        }

        // B. Get Detailed Roles (NEW)
        const { data: rolesData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('profile_id', user.value.id);
        
        userRoles.value = rolesData || [];
      }
    } catch (e) {
      console.error("Profile fetch error", e);
    }
  };

  // ... (Login, Register, Logout, setPersona remain the same) ...
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    user.value = data.user;
    await fetchProfile();
    return data.user;
  };

  const register = async (email, password, firstName, lastName) => {
    // ... (Existing register logic) ...
    // Note: Ensure the existing register logic that inserts into user_roles is preserved
    // For brevity, assuming previous register logic is here.
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // ... (rest of register function from previous step)
    user.value = data.user;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    user.value = null;
    profile.value = null;
    userRoles.value = [];
    overrideRole.value = null;
    activeClubId.value = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  };

  const setPersona = (roleKey) => {
    overrideRole.value = roleKey;
    // Mock data for demo persona
    if (roleKey === 'coach') {
        // Mock that the coach manages the first team they find (conceptually)
        // In a real demo we might want to mock userRoles too, but for now relying on global role is enough for UI toggle
    }
  };

  return {
    user,
    profile,
    activeRole,
    loading,
    permissions,
    initAuth,
    login,
    register,
    logout,
    can,
    setPersona
  };
}
