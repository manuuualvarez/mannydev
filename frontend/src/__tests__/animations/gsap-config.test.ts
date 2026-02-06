import { describe, it, expect, vi } from 'vitest';

// Override the global gsap mock for this test
vi.mock('gsap', () => {
  const registerPlugin = vi.fn();
  return {
    default: {
      registerPlugin,
      to: vi.fn(),
      from: vi.fn(),
      fromTo: vi.fn(),
      set: vi.fn(),
      context: vi.fn(() => ({ revert: vi.fn() })),
      timeline: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
      })),
    },
    gsap: {
      registerPlugin,
      to: vi.fn(),
      from: vi.fn(),
      fromTo: vi.fn(),
      set: vi.fn(),
      context: vi.fn(() => ({ revert: vi.fn() })),
      timeline: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
      })),
    },
  };
});

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => []),
    kill: vi.fn(),
    refresh: vi.fn(),
  },
}));

describe('GSAP Config', () => {
  it('exports gsap and ScrollTrigger', async () => {
    const { gsap, ScrollTrigger } = await import('@/lib/gsap-config');
    expect(gsap).toBeDefined();
    expect(ScrollTrigger).toBeDefined();
  });
});
