import api from './api'
import type { LoginRequest, LoginResponse, RegistrationRequest, RESTResponse } from '@/types'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/token', credentials)
    return response.data
  },

  async register(data: RegistrationRequest): Promise<RESTResponse> {
    const response = await api.post<RESTResponse>('/registration', data)
    return response.data
  },

  async confirmEmail(token: string): Promise<RESTResponse> {
    const response = await api.get<RESTResponse>('/registration/confirm', {
      params: { token }
    })
    return response.data
  },

  async resetPassword(msisdn: string): Promise<RESTResponse> {
    const response = await api.get<RESTResponse>('/registration/reset', {
      params: { msisdn }
    })
    return response.data
  },

  async resendOTP(msisdn: string): Promise<RESTResponse> {
    const response = await api.get<RESTResponse>('/registration/resend', {
      params: { msisdn }
    })
    return response.data
  },

  async setNewPassword(token: string, password: string): Promise<RESTResponse> {
    const response = await api.get<RESTResponse>('/registration/forgot', {
      params: { token, password }
    })
    return response.data
  },

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}
