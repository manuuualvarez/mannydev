import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import type { GraphQLFormattedError } from 'graphql';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});

const errorLink = onError((errorResponse) => {
  // Type assertion for Apollo Client v4
  const response = errorResponse as {
    graphQLErrors?: readonly GraphQLFormattedError[];
    networkError?: Error;
  };

  if (response.graphQLErrors) {
    response.graphQLErrors.forEach((err: GraphQLFormattedError) => {
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${JSON.stringify(err.locations)}, Path: ${err.path}`
      );
    });
  }
  if (response.networkError) {
    console.error(`[Network error]: ${response.networkError}`);
  }
});

// Auth link for Clerk token
const authLink = setContext(async (_, { headers }) => {
  // Get token from Clerk if available (client-side only)
  let token: string | null = null;

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      token = await clerk.session.getToken();
    }
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
