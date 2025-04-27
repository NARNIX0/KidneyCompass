import { describe, it, expect } from 'vitest';

describe('Backend Example Test', () => {
  it('should pass a trivial test', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should handle array operations', () => {
    expect([1, 2, 3].map(n => n * 2)).toEqual([2, 4, 6]);
  });
}); 