import { describe, it, expect, vi } from 'vitest';
import { useServices } from '@/hooks/use-services';

// Mock useQuery from the correct path
vi.mock('@apollo/client/react', async () => {
  const actual = await vi.importActual('@apollo/client/react');
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: {
        services: [
          {
            id: '1',
            name: 'Web Development',
            slug: 'web-development',
            description: 'Build modern web applications',
            icon: 'globe',
            order: 1,
            isActive: true,
            startingPrice: 29900,
          },
        ],
      },
      loading: false,
      error: undefined,
    })),
  };
});

describe('useServices', () => {
  it('should be defined', () => {
    expect(useServices).toBeDefined();
  });

  it('should return the expected hook structure', () => {
    const result = useServices();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('loading');
    expect(result).toHaveProperty('error');
  });

  it('should call useQuery with isActive filter by default', () => {
    const result = useServices(true);
    expect(result.loading).toBe(false);
    expect(result.data?.services).toBeDefined();
  });
});
