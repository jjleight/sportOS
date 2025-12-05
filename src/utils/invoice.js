/**
 * Prepares ledger entries from a list of raw team members.
 * Filters out players without households and reports them.
 * * @param {Array} teamMembers - Raw response from Supabase team_memberships joined with players
 * @param {Object} invoiceDetails - { amount, description, dueDate }
 * @returns {Object} - { validEntries: [], skippedCount: 0, skippedNames: [] }
 */
export function prepareTeamInvoices(teamMembers, invoiceDetails) {
  if (!teamMembers || teamMembers.length === 0) {
    return { validEntries: [], skippedCount: 0, skippedNames: [] };
  }

  const validEntries = [];
  const skippedNames = [];

  teamMembers.forEach(member => {
    const player = member.players;
    
    // Check if player exists and has a linked household
    if (player && player.household_id) {
      validEntries.push({
        player_id: player.id,
        household_id: player.household_id,
        amount: invoiceDetails.amount,
        description: invoiceDetails.description,
        due_date: invoiceDetails.dueDate,
        status: 'pending'
      });
    } else {
      // Track who was skipped
      if (player) {
        skippedNames.push(`${player.first_name} ${player.last_name}`);
      }
    }
  });

  return {
    validEntries,
    skippedCount: skippedNames.length,
    skippedNames
  };
}
