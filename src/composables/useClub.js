import { ref } from 'vue';
import { supabase } from '../supabase';

// Global state
const activeClubId = ref(null); 
const activeClubName = ref('');

export function useClub() {
  
  const createClub = async (name, creatorUser) => {
    // 1. Generate Slug
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4);
    
    // 2. Insert Club
    const { data: club, error } = await supabase
      .from('clubs')
      .insert({ name, slug })
      .select()
      .single();

    if (error) throw error;

    // 3. CRITICAL: Make the Creator the Admin immediately
    if (creatorUser) {
        // A. Assign Role
        const { error: roleError } = await supabase.from('user_roles').insert({
            profile_id: creatorUser.id,
            club_id: club.id,
            role: 'admin' // The Creator is always the Admin
        });
        if (roleError) throw roleError;

        // B. Update Profile Context (So they log in to this club next time)
        await supabase.from('profiles').update({ 
            club_id: club.id,
            role: 'admin'
        }).eq('id', creatorUser.id);
    }

    // 4. Set as Active Session
    activeClubId.value = club.id;
    activeClubName.value = club.name;
    
    return club;
  };

  return {
    activeClubId,
    activeClubName,
    createClub
  };
}
