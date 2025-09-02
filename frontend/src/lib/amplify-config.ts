import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_6bj3fRU9k',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '5lt3n1m6qbeib9qv28sdi9p6qi',
    },
  },
} as const;

// Only configure if we're in the browser
if (typeof window !== 'undefined') {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;