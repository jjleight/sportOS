import { ref, watch } from 'vue';
import { supabase } from '../supabase';
import { useClub } from './useClub';

const { activeClubId } = useClub();

// Global State for the "Current Family" in the demo
const householdId = ref(null);
const householdName = ref('');
const loading = ref(true);

export function useHousehold() {
  
  const fetchHousehold = async () => {
    loading.value = true;
    try {
      // Find the first player in this club who belongs to a household
      // (Simulates "Logging in" as that parent)
      const { data, error } = await supabase
        .from('players')
        .select('household_id, households(name)')
        .eq('club_id', activeClubId.value)
        .not('household_id', 'is', null)
        .limit(1)
        .single();

      if (data) {
        householdId.value = data.household_id;
        householdName.value = data.households.name;
      } else {
        householdId.value = null;
        householdName.value = '';
      }
    } catch (err) {
      console.error("Error identifying household:", err);
    } finally {
      loading.value = false;
    }
  };

  // Watch for club changes to reset identity
  watch(activeClubId, () => {
    fetchHousehold();
  });

  return {
    householdId,
    householdName,
    loading,
    fetchHousehold
  };
}
