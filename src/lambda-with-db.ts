import { ApolloServer } from 'apollo-server-lambda';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { createContext } from './context';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ event }: { event: any }) => {
    return await createContext(event);
  },
  introspection: true,
  formatError: (error: any) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.['code'],
      path: error.path || [],
    };
  },
});

export const handler = server.createHandler();