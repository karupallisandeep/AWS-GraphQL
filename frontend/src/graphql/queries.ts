import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      cognitoId
      firstName
      lastName
      role
      createdAt
      updatedAt
      businesses {
        id
        name
        description
        category
        address
        city
        state
        zipCode
        phone
        email
        website
        isActive
        isClaimed
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_BUSINESSES = gql`
  query GetBusinesses($first: Int, $filters: BusinessFilters) {
    businesses(first: $first, filters: $filters) {
      edges {
        node {
          id
          name
          description
          category
          address
          city
          state
          zipCode
          phone
          email
          website
          isActive
          isClaimed
          createdAt
          updatedAt
          owner {
            id
            firstName
            lastName
            email
          }
          images {
            id
            url
            key
            alt
            isPrimary
            createdAt
            updatedAt
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const GET_BUSINESS = gql`
  query GetBusiness($id: ID!) {
    business(id: $id) {
      id
      name
      description
      category
      address
      city
      state
      zipCode
      phone
      email
      website
      isActive
      isClaimed
      createdAt
      updatedAt
      owner {
        id
        firstName
        lastName
        email
      }
      images {
        id
        url
        key
        alt
        isPrimary
        createdAt
        updatedAt
      }
    }
  }
`;

export const HEALTH_CHECK = gql`
  query HealthCheck {
    health
  }
`;

export const HEALTH_DB_CHECK = gql`
  query HealthDbCheck {
    healthDb
  }
`;