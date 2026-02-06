import { gql } from '@apollo/client';

export const GET_SERVICES = gql`
  query GetServices($where: ServiceWhereInput) {
    services(where: $where) {
      id
      name
      slug
      description
      icon
      order
      isActive
      startingPrice
      translations
    }
  }
`;

export const GET_SERVICE_BY_SLUG = gql`
  query GetServiceBySlug($slug: String!) {
    serviceBySlug(slug: $slug) {
      id
      name
      slug
      description
      icon
    }
  }
`;
