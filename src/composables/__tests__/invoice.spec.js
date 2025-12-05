import { describe, it, expect } from 'vitest';
import { prepareTeamInvoices } from '../../utils/invoice';

describe('Invoice Generation Logic', () => {
  
  const mockDetails = { amount: 100, description: 'Sub', dueDate: '2025-12-01' };

  it('generates invoices for Youth Players (Linked to Parent)', () => {
    const mockData = [
      { players: { id: 'p1', first_name: 'Jack', household_id: 'h1' } } // h1 = The Smith Family
    ];
    const result = prepareTeamInvoices(mockData, mockDetails);
    expect(result.validEntries).toHaveLength(1);
    expect(result.validEntries[0].household_id).toBe('h1');
  });

  it('generates invoices for Adult Players (Linked to Self)', () => {
    const mockData = [
      { players: { id: 'p2', first_name: 'Harry', household_id: 'h2' } } // h2 = Harry Kane (Self)
    ];
    const result = prepareTeamInvoices(mockData, mockDetails);
    expect(result.validEntries).toHaveLength(1);
    expect(result.validEntries[0].household_id).toBe('h2');
  });

  it('skips players with NO billing link (Data Error)', () => {
    const mockData = [
      { players: { id: 'p3', first_name: 'Ghost', household_id: null } }
    ];
    const result = prepareTeamInvoices(mockData, mockDetails);
    expect(result.skippedCount).toBe(1);
  });
});
