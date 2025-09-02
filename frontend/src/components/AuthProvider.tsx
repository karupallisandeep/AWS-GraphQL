'use client'

import { useEffect } from 'react'
import { Amplify } from 'aws-amplify'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure Amplify on the client side
    const amplifyConfig = {
      Auth: {
        Cognito: {
          userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
          userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
          region: process.env.NEXT_PUBLIC_AWS_REGION!,
        },
      },
    } as const

    Amplify.configure(amplifyConfig)
  }, [])

  return <>{children}</>
}