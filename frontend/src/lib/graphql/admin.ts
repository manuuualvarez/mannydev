import { gql } from '@apollo/client';

// ============================================
// Services Admin Queries and Mutations
// ============================================

export const GET_ADMIN_SERVICES = gql`
  query GetAdminServices {
    services {
      id
      name
      slug
      description
      icon
      order
      isActive
      translations
      createdAt
      updatedAt
    }
  }
`;

export const GET_SERVICE = gql`
  query GetService($id: ID!) {
    service(id: $id) {
      id
      name
      slug
      description
      icon
      order
      isActive
      startingPrice
      translations
    }
  }
`;

export const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      name
      slug
    }
  }
`;

export const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id) {
      id
    }
  }
`;

// ============================================
// Blog Posts Admin Queries and Mutations
// ============================================

export const GET_ADMIN_BLOG_POSTS = gql`
  query GetAdminBlogPosts($pagination: BlogPaginationInput) {
    adminBlogPosts(pagination: $pagination) {
      id
      slug
      title
      excerpt
      isPublished
      publishedAt
      createdAt
    }
  }
`;

export const GET_BLOG_POST = gql`
  query GetBlogPost($id: ID!) {
    adminBlogPost(id: $id) {
      id
      slug
      title
      excerpt
      content
      coverImage
      seoMetadata
      isPublished
      publishedAt
      translations
    }
  }
`;

export const CREATE_BLOG_POST = gql`
  mutation CreateBlogPost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) {
      id
      slug
      title
    }
  }
`;

export const UPDATE_BLOG_POST = gql`
  mutation UpdateBlogPost($id: ID!, $input: UpdateBlogPostInput!) {
    updateBlogPost(id: $id, input: $input) {
      id
      slug
      title
    }
  }
`;

export const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id) {
      id
    }
  }
`;

// ============================================
// Leads Admin Queries and Mutations
// ============================================

export const GET_ADMIN_LEADS = gql`
  query GetAdminLeads($where: LeadWhereInput, $pagination: LeadPaginationInput) {
    leads(where: $where, pagination: $pagination) {
      id
      name
      email
      company
      message
      status
      notes
      createdAt
    }
    leadsCount
  }
`;

export const GET_LEAD = gql`
  query GetLead($id: ID!) {
    lead(id: $id) {
      id
      name
      email
      company
      message
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LEAD = gql`
  mutation UpdateLead($id: ID!, $input: UpdateLeadInput!) {
    updateLead(id: $id, input: $input) {
      id
      status
      notes
    }
  }
`;

export const DELETE_LEAD = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id) {
      id
    }
  }
`;

// ============================================
// Auth - Current User
// ============================================

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      imageUrl
      role
    }
  }
`;

// ============================================
// Users Admin Queries and Mutations
// ============================================

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      clerkUserId
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS_COUNT = gql`
  query GetUsersCount {
    usersCount
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $input: UpdateUserRoleInput!) {
    updateUserRole(id: $id, input: $input) {
      id
      clerkUserId
      role
      updatedAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

// ============================================
// Dashboard Stats
// ============================================

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalServices
      activeServices
      totalBlogPosts
      publishedBlogPosts
      draftBlogPosts
      totalLeads
      newLeads
      contactedLeads
      qualifiedLeads
      leadsThisMonth
      leadsLastMonth
      totalUsers
    }
  }
`;
