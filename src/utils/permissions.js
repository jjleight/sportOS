/**
 * Determines if a user role has permission to perform a specific action.
 * @param {Array} userRoles - Array of role objects [{ role: 'admin', ... }]
 * @param {String} action - The action to perform (e.g., 'manage_money')
 * @returns {Boolean}
 */
export function checkPermission(userRoles, action) {
  if (!userRoles || userRoles.length === 0) return false;
  
  // Admin override
  if (userRoles.some(r => r.role === 'admin')) return true;

  switch (action) {
    case 'manage_club':
      return userRoles.some(r => r.role === 'secretary'); // Admin already caught above
    
    case 'manage_finance':
      return userRoles.some(r => r.role === 'treasurer');
    
    case 'manage_team':
      return userRoles.some(r => r.role === 'coach');
    
    case 'edit_compliance':
      return userRoles.some(r => ['secretary', 'treasurer'].includes(r.role));
      
    case 'view_safeguarding':
      return userRoles.some(r => r.role === 'welfare_officer');

    case 'pay_wallet':
      return userRoles.some(r => ['parent', 'player'].includes(r.role));
      
    default:
      return false;
  }
}
