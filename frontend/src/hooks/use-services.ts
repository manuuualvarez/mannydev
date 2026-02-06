import { useQuery } from '@apollo/client/react';
import { GET_SERVICES } from '@/lib/graphql/queries/services';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  startingPrice: number | null;
  translations: Record<string, Record<string, string>> | null;
}

export interface ServicesData {
  services: Service[];
}

export interface ServicesVariables {
  where?: {
    isActive?: boolean;
  };
}

export function useServices(onlyActive = true) {
  return useQuery<ServicesData, ServicesVariables>(GET_SERVICES, {
    variables: {
      where: onlyActive ? { isActive: true } : undefined,
    },
  });
}
