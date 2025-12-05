import { ref, watch } from 'vue';
import { supabase } from '../supabase';
import { useUser } from './useUser'; 

// Global State
const householdId = ref(null);
const householdName = ref('');
const loading = ref(true);

export function useHousehold() {
  const { user } = useUser(); 

  const fetchHousehold = async () => {
    loading.value = true;
    try {
      // 1. If Logged In: Find MY household
      if (user.value) {
        const { data, error } = await supabase
          .from('households')
          .select('id, name')
          .eq('owner_profile_id', user.value.id)
          .single();

        if (data) {
          householdId.value = data.id;
          householdName.value = data.name;
          loading.value = false;
          return; // Found it, stop here.
        }
      }

      // 2. Fallback (Demo Mode / No User): Use hardcoded Smith Family
      // This ensures the "Public Demo" still works for investors
      console.log("No user linked household found, defaulting to Demo Mode.");
      householdId.value = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11'; 
      householdName.value = 'The Smith Family (Demo)';

    } catch (err) {
      console.error("Error loading household:", err);
    } finally {
      loading.value = false;
    }
  };

  // React to login/logout changes
  watch(user, () => {
    fetchHousehold();
  });

  return {
    householdId,
    householdName,
    loading,
    fetchHousehold
  };
}
