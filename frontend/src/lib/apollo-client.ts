import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
})

const authLink = setContext(async (_, { headers }) => {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser()
    
    // Get the current auth session with tokens
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  } catch (error) {
    console.log('🔐 Frontend - Auth error:', error)
    return { headers }
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache()
})