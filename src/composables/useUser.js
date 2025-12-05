import { ref, computed } from 'vue';
import { supabase } from '../supabase';
import { useClub } from './useClub';

// --- GLOBAL STATE (Shared across the entire app) ---
const user = ref(null);        // The Auth User
const profile = ref(null);     // The Database Profile
const overrideRole = ref(null); // For "View As" demo mode
const loading = ref(true);

// Computed: Determines the effective role (Demo override > Real DB Role > Guest)
const activeRole = computed(() => {
  return overrideRole.value || profile.value?.role || 'guest';
});

export function useUser() {
  const { activeClubId, activeClubName } = useClub();
  
  // 1. Initialize Auth (Run on App Load)
  const initAuth = async () => {
    loading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      user.value = session.user;
      await fetchProfile();
    }
    loading.value = false;
  };

  // 2. Fetch Profile & Context
  const fetchProfile = async () => {
    if (!user.value) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*, clubs(name)')
        .eq('id', user.value.id)
        .single();

      if (data) {
        profile.value = data;
        
        // Set Club Context
        if (data.club_id) {
          activeClubId.value = data.club_id;
          activeClubName.value = data.clubs?.name;
        }
      }
    } catch (e) {
      console.error("Profile fetch error", e);
    }
  };

  // 3. Permission Logic
  const can = (action) => {
    const role = activeRole.value; // Access the global computed

    // Admin Super-Power
    if (role === 'admin') return true;

    switch (action) {
      case 'manage_club': return role === 'secretary';
      case 'manage_finance': return role === 'treasurer';
      case 'manage_team': return role === 'coach';
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
    canViewSafeguarding: can('view_safeguarding'),
    isParent: can('pay_wallet'),
    isAuthenticated: !!user.value
  }));

  // 4. Auth Actions
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    user.value = data.user;
    await fetchProfile();
    return data.user;
  };

  const register = async (email, password, firstName, lastName) => {
    // A. Create Auth User
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
       const userId = data.user.id;

       // B. Create Profile
       const { error: profileError } = await supabase.from('profiles').insert({
         id: userId,
         first_name: firstName,
         last_name: lastName,
         email: email,
         role: 'parent' // Default role
       });
       if (profileError) throw profileError;

       // C. Auto-Link Logic (Check for existing invites)
       
       // Check Households
       const { data: household } = await supabase
         .from('households')
         .select('id')
         .ilike('primary_email', email)
         .single();
         
       if (household) {
         await supabase.from('households').update({ owner_profile_id: userId }).eq('id', household.id);
         // Upgrade to Parent Role
         await supabase.from('user_roles').insert({
             profile_id: userId,
             club_id: activeClubId.value || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
             role: 'parent'
         });
       }

       // Check Players (Adults)
       const { data: player } = await supabase
         .from('players')
         .select('id, club_id')
         .ilike('email', email)
         .single();

       if (player) {
         await supabase.from('players').update({ owner_profile_id: userId }).eq('id', player.id);
         // Upgrade to Player Role
         await supabase.from('user_roles').insert({
             profile_id: userId,
             club_id: player.club_id,
             role: 'player'
         });
       }
    }
    
    user.value = data.user;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    user.value = null;
    profile.value = null;
    overrideRole.value = null;
    activeClubId.value = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Reset to Demo
  };

  const setPersona = (roleKey) => {
    overrideRole.value = roleKey;
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
