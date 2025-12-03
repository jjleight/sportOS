import { describe, it, expect } from 'vitest';
import { checkPermission } from '../../utils/permissions';

describe('RBAC Security Policy', () => {
  
  it('allows Admin to do everything', () => {
    const roles = [{ role: 'admin' }];
    expect(checkPermission(roles, 'manage_finance')).toBe(true);
    expect(checkPermission(roles, 'manage_club')).toBe(true);
    expect(checkPermission(roles, 'anything_else')).toBe(true);
  });

  it('allows Treasurer to manage money but NOT club settings', () => {
    const roles = [{ role: 'treasurer' }];
    expect(checkPermission(roles, 'manage_finance')).toBe(true);
    expect(checkPermission(roles, 'manage_club')).toBe(false);
  });

  it('prevents Parents from accessing Admin features', () => {
    const roles = [{ role: 'parent' }];
    expect(checkPermission(roles, 'manage_finance')).toBe(false);
    expect(checkPermission(roles, 'manage_team')).toBe(false);
    expect(checkPermission(roles, 'pay_wallet')).toBe(true);
  });

  it('handles users with multiple roles', () => {
    // A Coach who is also a Treasurer
    const roles = [{ role: 'coach' }, { role: 'treasurer' }];
    expect(checkPermission(roles, 'manage_team')).toBe(true);
    expect(checkPermission(roles, 'manage_finance')).toBe(true);
  });
  
  it('fails safely with no roles', () => {
    expect(checkPermission([], 'manage_finance')).toBe(false);
    expect(checkPermission(null, 'manage_finance')).toBe(false);
  });
});
