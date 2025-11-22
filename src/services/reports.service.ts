import api from './api'
import type { Report } from '@/types'

export const reportsService = {
  async getAll(): Promise<Report[]> {
    const response = await api.get<Report[]>('/reports')
    return response.data
  },

  async getById(id: number): Promise<Report> {
    const response = await api.get<Report>(`/reports/${id}`)
    return response.data
  },

  async create(report: Omit<Report, 'id' | 'createdOn' | 'updatedOn'>): Promise<Report> {
    const response = await api.post<Report>('/reports', report)
    return response.data
  },

  async update(id: number, report: Partial<Report>): Promise<Report> {
    const response = await api.put<Report>(`/reports/${id}`, report)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/reports/${id}`)
  }
}
