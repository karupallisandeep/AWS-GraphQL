'use client'

import { useQuery } from '@apollo/client'
import { GET_BUSINESSES, HEALTH_CHECK } from '@/graphql/queries'
import { Business } from '@/types'
import CreateBusiness from '@/components/CreateBusiness'

export default function Home() {
  const { data: healthData, loading: healthLoading } = useQuery(HEALTH_CHECK)
  const { data: businessesData, loading: businessesLoading, error } = useQuery(GET_BUSINESSES, {
    variables: { first: 10 }
  })

  if (healthLoading || businessesLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Business Directory</h1>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Business Directory</h1>
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </main>
    )
  }

  const businesses = businessesData?.businesses?.edges?.map((edge: any) => edge.node) || []

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="z-10 max-w-6xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">Business Directory</h1>
        
        {healthData && (
          <div className="mb-8 p-4 bg-green-100 rounded-lg">
            <p className="text-green-800">✅ {healthData.health}</p>
          </div>
        )}

        {/* Create Business Form */}
        <CreateBusiness />

        {/* Businesses List */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">All Businesses</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.length > 0 ? (
            businesses.map((business: Business) => (
              <div key={business.id} className="border rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-2">{business.name}</h2>
                {business.description && (
                  <p className="text-gray-600 mb-2">{business.description}</p>
                )}
                {business.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {business.category}
                  </span>
                )}
                {business.address && (
                  <p className="text-sm text-gray-500">
                    {business.address}
                    {business.city && `, ${business.city}`}
                    {business.state && `, ${business.state}`}
                    {business.zipCode && ` ${business.zipCode}`}
                  </p>
                )}
                {business.phone && (
                  <p className="text-sm text-gray-500">📞 {business.phone}</p>
                )}
                {business.email && (
                  <p className="text-sm text-gray-500">✉️ {business.email}</p>
                )}
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No businesses found. Be the first to add one!</p>
            </div>
          )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Total businesses: {businessesData?.businesses?.totalCount || 0}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}