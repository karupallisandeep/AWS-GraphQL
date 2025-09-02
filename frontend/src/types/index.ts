export interface User {
  id: string;
  email: string;
  cognitoId: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  businesses: Business[];
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  isClaimed: boolean;
  createdAt: string;
  updatedAt: string;
  owner: User;
  images: BusinessImage[];
}

export interface BusinessImage {
  id: string;
  url: string;
  key: string;
  alt?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessConnection {
  edges: BusinessEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface BusinessEdge {
  node: Business;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BusinessFilters {
  category?: string;
  search?: string;
  city?: string;
  state?: string;
}

export interface CreateBusinessInput {
  name: string;
  description?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive?: boolean;
}

export enum UserRole {
  PUBLIC = 'PUBLIC',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  ADMIN = 'ADMIN'
}