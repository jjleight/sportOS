import { describe, it, expect } from 'vitest';
// IMPORT THE REAL CODE:
import { calculateTotalDebt } from '../../utils/finance';

describe('Financial Engine', () => {
  
  it('calculates sum of multiple debts correctly', () => {
    const mockLedger = [
      { amount: 10.00 },
      { amount: 5.50 },
      { amount: 100.00 }
    ];
    
    // This tests the actual code running in your app
    const result = calculateTotalDebt(mockLedger);
    expect(result).toBe('115.50');
  });

  it('handles empty ledgers safely', () => {
    const result = calculateTotalDebt([]);
    expect(result).toBe('0.00');
  });

  it('handles string inputs safely (API data often comes as strings)', () => {
    const mockLedger = [
      { amount: "10.00" }, 
      { amount: "20.50" }
    ];
    const result = calculateTotalDebt(mockLedger);
    expect(result).toBe('30.50');
  });

  it('ignores invalid data (corrupted rows)', () => {
    const mockLedger = [
      { amount: 10.00 },
      { amount: null }, // database error
      { amount: "invalid" }
    ];
    const result = calculateTotalDebt(mockLedger);
    expect(result).toBe('10.00');
  });

  it('handles credits (-50.00) when payments have been received', () => {
    const mockLedger = [
      { amount: 10.00 },
      { amount: -50.00 }, // database error
      { amount: 90.00 }
    ];
    const result = calculateTotalDebt(mockLedger);
    expect(result).toBe('50.00');
  });

});
