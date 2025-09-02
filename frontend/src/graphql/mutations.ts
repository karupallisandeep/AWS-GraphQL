import { gql } from '@apollo/client';

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness($input: CreateBusinessInput!) {
    createBusiness(input: $input) {
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

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($id: ID!, $input: UpdateBusinessInput!) {
    updateBusiness(id: $id, input: $input) {
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

export const DELETE_BUSINESS = gql`
  mutation DeleteBusiness($id: ID!) {
    deleteBusiness(id: $id)
  }
`;

export const GENERATE_UPLOAD_URL = gql`
  mutation GenerateUploadUrl($businessId: ID!, $fileName: String!, $contentType: String!) {
    generateUploadUrl(businessId: $businessId, fileName: $fileName, contentType: $contentType) {
      uploadUrl
      key
    }
  }
`;

export const ADD_BUSINESS_IMAGE = gql`
  mutation AddBusinessImage($businessId: ID!, $key: String!, $alt: String, $isPrimary: Boolean) {
    addBusinessImage(businessId: $businessId, key: $key, alt: $alt, isPrimary: $isPrimary) {
      id
      url
      key
      alt
      isPrimary
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BUSINESS_IMAGE = gql`
  mutation DeleteBusinessImage($id: ID!) {
    deleteBusinessImage(id: $id)
  }
`;