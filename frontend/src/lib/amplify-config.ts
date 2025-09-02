import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_6bj3fRU9k',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '5lt3n1m6qbeib9qv28sdi9p6qi',
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
        given_name: {
          required: true,
        },
        family_name: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
};

// Only configure if we're in the browser
if (typeof window !== 'undefined') {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;