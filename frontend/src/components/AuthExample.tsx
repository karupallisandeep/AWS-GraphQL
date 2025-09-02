'use client'

import { useState } from 'react'
import { 
  signUp, 
  signIn, 
  signOut, 
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession 
} from 'aws-amplify/auth'

export default function AuthExample() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [jwtToken, setJwtToken] = useState('')
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState<'signin' | 'signup' | 'confirm' | 'authenticated'>('signin')

  // 1. Sign Up - Creates user in Cognito
  const handleSignUp = async () => {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            given_name: firstName,
            family_name: lastName,
          }
        }
      })
      
      console.log('Sign up result:', result)
      setStep('confirm')
    } catch (error) {
      console.error('Sign up error:', error)
    }
  }

  // 2. Confirm Sign Up - Verifies email
  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode
      })
      
      console.log('Email confirmed successfully')
      setStep('signin')
    } catch (error) {
      console.error('Confirmation error:', error)
    }
  }

  // 3. Sign In - Gets JWT tokens
  const handleSignIn = async () => {
    try {
      const result = await signIn({
        username: email,
        password
      })
      
      console.log('Sign in result:', result)
      
      if (result.isSignedIn) {
        // Get user info and JWT token
        await getCurrentUserAndToken()
        setStep('authenticated')
      }
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  // 4. Get Current User and JWT Token
  const getCurrentUserAndToken = async () => {
    try {
      // Get user information
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      // Get JWT tokens
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()
      const accessToken = session.tokens?.accessToken?.toString()
      
      setJwtToken(idToken || '')
      
      console.log('Current User:', currentUser)
      console.log('ID Token:', idToken)
      console.log('Access Token:', accessToken)
      
      // Decode JWT to see contents (for debugging)
      if (idToken) {
        const tokenPayload = JSON.parse(atob(idToken.split('.')[1]))
        console.log('Token Payload:', tokenPayload)
      }
      
    } catch (error) {
      console.error('Error getting user/token:', error)
    }
  }

  // 5. Sign Out - Clears tokens
  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setJwtToken('')
      setStep('signin')
      console.log('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // 6. Test API Call with JWT Token
  const testAPICall = async () => {
    if (!jwtToken) {
      alert('No JWT token available')
      return
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                id
                email
                firstName
                lastName
                role
              }
            }
          `
        })
      })

      const result = await response.json()
      console.log('API Response:', result)
      alert('Check console for API response')
    } catch (error) {
      console.error('API call error:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Authentication Example</h2>
      
      {step === 'signup' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sign Up</h3>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleSignUp}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
          <button
            onClick={() => setStep('signin')}
            className="w-full text-blue-500 hover:underline"
          >
            Already have an account? Sign In
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Confirm Email</h3>
          <p className="text-sm text-gray-600">
            Check your email for a confirmation code
          </p>
          <input
            type="text"
            placeholder="Confirmation Code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleConfirmSignUp}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Confirm Email
          </button>
        </div>
      )}

      {step === 'signin' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sign In</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleSignIn}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
          <button
            onClick={() => setStep('signup')}
            className="w-full text-blue-500 hover:underline"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      )}

      {step === 'authenticated' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Authenticated!</h3>
          
          {user && (
            <div className="bg-gray-100 p-3 rounded">
              <p><strong>User ID:</strong> {user.userId}</p>
              <p><strong>Username:</strong> {user.username}</p>
            </div>
          )}

          {jwtToken && (
            <div className="bg-yellow-100 p-3 rounded">
              <p><strong>JWT Token:</strong></p>
              <p className="text-xs break-all font-mono">
                {jwtToken.substring(0, 50)}...
              </p>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={getCurrentUserAndToken}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Refresh Token
            </button>
            
            <button
              onClick={testAPICall}
              className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
            >
              Test API Call
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}