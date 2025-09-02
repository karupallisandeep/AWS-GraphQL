'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import { HEALTH_CHECK, HEALTH_DB_CHECK } from '@/graphql/queries'
import AuthExample from '@/components/AuthExample'
import CreateBusiness from '@/components/CreateBusiness'

export default function TestPage() {
  const [user, setUser] = useState<any>(null)
  const [jwtToken, setJwtToken] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Health checks
  const { data: healthData, loading: healthLoading, error: healthError } = useQuery(HEALTH_CHECK)
  const { data: dbHealthData, loading: dbHealthLoading, error: dbHealthError } = useQuery(HEALTH_DB_CHECK)

  // Check authentication status on component mount
  useEffect(() => {
    // Add a small delay to ensure Amplify is configured
    const timer = setTimeout(() => {
      checkAuthStatus()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser()
      const session = await fetchAuthSession()
      const token = session.tokens?.idToken?.toString()
      
      setUser(currentUser)
      setJwtToken(token || '')
      setIsAuthenticated(true)
    } catch (error) {
      console.log('User not authenticated:', error)
      setUser(null)
      setJwtToken('')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = () => {
    setLoading(true)
    checkAuthStatus()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Business Directory - Complete Test Flow
        </h1>

        {/* System Health Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${healthError ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border`}>
            <h3 className="font-semibold mb-2">GraphQL API Status</h3>
            {healthLoading ? (
              <p>Checking...</p>
            ) : healthError ? (
              <p className="text-red-700">❌ API Error: {healthError.message}</p>
            ) : (
              <p className="text-green-700">✅ {healthData?.health}</p>
            )}
          </div>

          <div className={`p-4 rounded-lg ${dbHealthError ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border`}>
            <h3 className="font-semibold mb-2">Database Status</h3>
            {dbHealthLoading ? (
              <p>Checking...</p>
            ) : dbHealthError ? (
              <p className="text-red-700">❌ DB Error: {dbHealthError.message}</p>
            ) : (
              <p className="text-green-700">✅ {dbHealthData?.healthDb}</p>
            )}
          </div>
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Authentication Status</h2>
            <button
              onClick={refreshAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>

          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span className="font-medium">Authenticated</span>
              </div>
              
              {user && (
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>User ID:</strong> {user.userId}</p>
                  <p><strong>Username:</strong> {user.username}</p>
                </div>
              )}

              {jwtToken && (
                <div className="bg-yellow-50 p-3 rounded">
                  <p><strong>JWT Token:</strong></p>
                  <p className="text-xs font-mono break-all text-gray-600">
                    {jwtToken.substring(0, 100)}...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
              <span className="font-medium">Not Authenticated</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Authentication Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Authentication</h2>
            <AuthExample />
          </div>

          {/* Create Business Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Create Business</h2>
            {isAuthenticated ? (
              <CreateBusiness />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Please sign in first to create a business</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check that both API and Database health checks are green ✅</li>
            <li>Sign up for a new account or sign in with existing credentials</li>
            <li>Verify that you see "Authenticated" status with your JWT token</li>
            <li>Fill out the "Create Business" form and submit</li>
            <li>Check browser console for detailed logs</li>
            <li>Verify the business appears in the main businesses list</li>
          </ol>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Debug Information:</h3>
            <pre className="text-xs overflow-auto bg-white p-4 rounded border">
              {JSON.stringify({
                isAuthenticated,
                hasUser: !!user,
                hasToken: !!jwtToken,
                apiHealth: healthData?.health,
                dbHealth: dbHealthData?.healthDb,
                errors: {
                  health: healthError?.message,
                  db: dbHealthError?.message
                }
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}