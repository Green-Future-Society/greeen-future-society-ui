// User Types
export interface User {
  id: number
  name: string
  msisdn: string
  emailAddress: string
  username: string
  userStatus: UserStatus
  userRole: UserRole
  locked: boolean
  enabled: boolean
}

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  ANONYMOUS: 'ANONYMOUS'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
} as const

export type UserStatus = typeof UserStatus[keyof typeof UserStatus]

// Auth Types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegistrationRequest {
  name: string
  msisdn: string
  email: string
  password: string
}

export interface RESTResponse {
  error: boolean
  message: string
}

// Report Types
export interface Report {
  id?: number
  contact: string
  location: string
  latitude?: number
  longitude?: number
  description: string
  originalMessage: string
  incidentType: string
  credibilityScore: number
  createdOn?: string
  updatedOn?: string
  updatedBy?: string
}

export interface ReportFilters {
  incidentType?: string
  startDate?: string
  endDate?: string
  minCredibility?: number
}

// Weather Types
export interface WeatherData {
  temperature?: number
  precipitation?: number
  data?: any[]
}

// Dashboard Stats
export interface DashboardStats {
  totalReports: number
  totalUsers: number
  activeIncidents: number
  resolvedIncidents: number
  reportsThisMonth: number
  avgCredibilityScore: number
}

// Pagination
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
