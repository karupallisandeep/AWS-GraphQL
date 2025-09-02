import { gql } from 'apollo-server-lambda';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    cognitoId: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    createdAt: String!
    updatedAt: String!
    businesses: [Business!]!
  }

  type Business {
    id: ID!
    name: String!
    description: String
    category: String
    address: String
    city: String
    state: String
    zipCode: String
    phone: String
    email: String
    website: String
    isActive: Boolean!
    isClaimed: Boolean!
    createdAt: String!
    updatedAt: String!
    owner: User!
    images: [BusinessImage!]!
  }

  type BusinessImage {
    id: ID!
    url: String!
    key: String!
    alt: String
    isPrimary: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type BusinessConnection {
    edges: [BusinessEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type BusinessEdge {
    node: Business!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type UploadUrlResponse {
    uploadUrl: String!
    key: String!
  }

  enum UserRole {
    PUBLIC
    BUSINESS_OWNER
    ADMIN
  }

  input BusinessFilters {
    category: String
    search: String
    city: String
    state: String
  }

  input CreateBusinessInput {
    name: String!
    description: String
    category: String
    address: String
    city: String
    state: String
    zipCode: String
    phone: String
    email: String
    website: String
  }

  input UpdateBusinessInput {
    name: String
    description: String
    category: String
    address: String
    city: String
    state: String
    zipCode: String
    phone: String
    email: String
    website: String
    isActive: Boolean
  }

  type Query {
    health: String!
    healthDb: String!
    me: User
    businesses(first: Int, filters: BusinessFilters): BusinessConnection!
    business(id: ID!): Business
  }

  type Mutation {
    createBusiness(input: CreateBusinessInput!): Business!
    updateBusiness(id: ID!, input: UpdateBusinessInput!): Business!
    deleteBusiness(id: ID!): Boolean!
    generateUploadUrl(businessId: ID!, fileName: String!, contentType: String!): UploadUrlResponse!
    addBusinessImage(businessId: ID!, key: String!, alt: String, isPrimary: Boolean): BusinessImage!
    deleteBusinessImage(id: ID!): Boolean!
  }
`;