import { ref, computed } from 'vue';
import { supabase } from '../supabase';
import { useClub } from './useClub';

// --- GLOBAL STATE ---
const user = ref(null);        
const profile = ref(null);     
const userRoles = ref([]);     
const overrideRole = ref(null); 
const loading = ref(true);

export function useUser() {
  const { activeClubId, activeClubName } = useClub();
  
  // 1. COMPUTED: Active Roles
  const activeRoles = computed(() => {
    if (overrideRole.value) return [{ role: overrideRole.value, team_id: null }];
    if (userRoles.value.length > 0) return userRoles.value;
    if (profile.value?.role) return [{ role: profile.value.role, team_id: null }];
    return [];
  });

  // 2. COMPUTED: Managed Team IDs
  const managedTeamIds = computed(() => {
    const roles = activeRoles.value;
    if (roles.some(r => ['admin', 'secretary', 'treasurer'].includes(r.role))) return 'all';
    
    const teamIds = roles.filter(r => r.role === 'coach' && r.team_id).map(r => r.team_id);
    return teamIds.length > 0 ? teamIds : [];
  });

  // 3. LOGIC: Permissions
  const can = (action, resourceTeamId = null) => {
    const currentRoles = activeRoles.value;
    if (currentRoles.some(r => r.role === 'admin')) return true;

    switch (action) {
      case 'manage_club': return currentRoles.some(r => r.role === 'secretary');
      case 'manage_finance': return currentRoles.some(r => r.role === 'treasurer');
      case 'manage_team': 
        return currentRoles.some(r => {
            if (['secretary', 'admin'].includes(r.role)) return true;
            if (r.role !== 'coach') return false;
            if (resourceTeamId && r.team_id && r.team_id !== resourceTeamId) return false;
            return true;
        });
      case 'edit_compliance': return currentRoles.some(r => ['secretary', 'treasurer'].includes(r.role));
      case 'view_safeguarding': return currentRoles.some(r => r.role === 'welfare_officer');
      case 'pay_wallet': return currentRoles.some(r => ['parent', 'player'].includes(r.role));
      default: return false;
    }
  };

  // 4. Permissions Object
  const permissions = computed(() => ({
    isSuperAdmin: can('manage_club'),
    canManageMoney: can('manage_finance'),
    canSelectTeam: can('manage_team'),
    canEditRules: can('edit_compliance'),
    canViewSafeguarding: can('view_safeguarding'),
    isParent: can('pay_wallet'),
    isAuthenticated: !!user.value,
    managedTeamIds: managedTeamIds.value,
    currentLabel: overrideRole.value 
        ? overrideRole.value 
        : (userRoles.value.length > 1 ? 'Hybrid (All)' : (userRoles.value[0]?.role || 'Guest'))
  }));

  // 5. AUTH ACTIONS
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
      // A. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, clubs(name)')
        .eq('id', user.value.id)
        .single();

      if (profileData) {
        profile.value = profileData;
        
        // Context Switch
        if (profileData.club_id) {
           activeClubId.value = profileData.club_id;
           activeClubName.value = profileData.clubs?.name;
        }

        // B. OPPORTUNISTIC SYNC (Self-Healing)
        // Check if any new invites have appeared since last login
        const myEmail = profileData.email;
        
        // Check Staff Invites
        const { data: newStaff } = await supabase.from('team_staff')
          .select('id, team_id, teams(club_id)')
          .ilike('email', myEmail)
          .is('owner_profile_id', null);

        if (newStaff && newStaff.length > 0) {
            for (const s of newStaff) {
                await supabase.from('team_staff').update({ owner_profile_id: user.value.id }).eq('id', s.id);
                await supabase.from('user_roles').insert({
                     profile_id: user.value.id,
                     club_id: s.teams.club_id,
                     team_id: s.team_id,
                     role: 'coach'
                });
            }
        }

        // Check Officials Invites
        const { data: newOfficials } = await supabase.from('club_officials')
          .select('id, club_id, role')
          .ilike('email', myEmail)
          .is('owner_profile_id', null);
          
        if (newOfficials && newOfficials.length > 0) {
            for (const off of newOfficials) {
                await supabase.from('club_officials').update({ owner_profile_id: user.value.id }).eq('id', off.id);
                await supabase.from('user_roles').insert({
                     profile_id: user.value.id,
                     club_id: off.club_id,
                     role: off.role
                });
            }
        }

        // C. Fetch Roles (Post-Sync)
        const { data: rolesData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('profile_id', user.value.id);
        
        userRoles.value = rolesData || [];
        
        // Fallback Context if Profile didn't have it
        if (!activeClubId.value && userRoles.value.length > 0) {
             activeClubId.value = userRoles.value[0].club_id;
             // Fetch name lazily if needed
        }
      }
    } catch (e) {
      console.error("Profile fetch error", e);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    user.value = data.user;
    await fetchProfile();
    return data.user;
  };

  const register = async (email, password, firstName, lastName) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
       const userId = data.user.id;
       
       // 1. Create Profile
       const { error: profileError } = await supabase.from('profiles').insert({
         id: userId,
         first_name: firstName,
         last_name: lastName,
         email: email,
         role: 'guest' 
       });
       if (profileError) throw profileError;

       // 2. AUTO-CLAIM LOGIC
       
       // A. Households
       const { data: household } = await supabase.from('households').select('id').ilike('primary_email', email).single();
       if (household) {
         const { data: kid } = await supabase.from('players').select('club_id').eq('household_id', household.id).limit(1).single();
         const targetClub = kid?.club_id;
         await supabase.from('households').update({ owner_profile_id: userId }).eq('id', household.id);
         if (targetClub) await supabase.from('user_roles').insert({ profile_id: userId, club_id: targetClub, role: 'parent' });
       }

       // B. Players (Adults)
       const { data: player } = await supabase.from('players').select('id, club_id').ilike('email', email).single();
       if (player) {
         await supabase.from('players').update({ owner_profile_id: userId }).eq('id', player.id);
         await supabase.from('user_roles').insert({ profile_id: userId, club_id: player.club_id, role: 'player' });
       }

       // C. Coaches
       const { data: staffList } = await supabase.from('team_staff').select('id, team_id, teams(club_id)').ilike('email', email);
       if (staffList && staffList.length > 0) {
         for (const staff of staffList) {
             await supabase.from('team_staff').update({ owner_profile_id: userId }).eq('id', staff.id);
             await supabase.from('user_roles').insert({
                 profile_id: userId,
                 club_id: staff.teams.club_id,
                 team_id: staff.team_id,
                 role: 'coach'
             });
         }
       }

       // D. Club Officials
       const { data: officials } = await supabase.from('club_officials').select('id, club_id, role').ilike('email', email);
       if (officials && officials.length > 0) {
         for (const off of officials) {
             await supabase.from('club_officials').update({ owner_profile_id: userId }).eq('id', off.id);
             await supabase.from('user_roles').insert({
                 profile_id: userId,
                 club_id: off.club_id,
                 role: off.role
             });
         }
       }
       
       // Sync everything
       user.value = data.user;
       await fetchProfile();
    }
    
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
    overrideRole.value = roleKey === 'default' ? null : roleKey;
  };

  return {
    user,
    profile,
    activeRole: computed(() => activeRoles.value[0]?.role || 'guest'),
    activeRoles,
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
