import { describe, it, expect } from 'vitest';
import { calculateEligibility } from '../useTeamLogic';

describe('Eligibility Logic', () => {
  
  it('returns "eligible" when apps are below limit', () => {
    const status = calculateEligibility(2, 5);
    expect(status).toBe('eligible');
  });

  it('returns "risk" when apps equal the limit', () => {
    const status = calculateEligibility(5, 5);
    expect(status).toBe('risk');
  });

  it('returns "ineligible" when apps exceed limit', () => {
    const status = calculateEligibility(6, 5);
    expect(status).toBe('ineligible');
  });

});
