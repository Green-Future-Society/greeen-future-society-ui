import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Report, DashboardStats } from '@/types'
import { reportsService } from '@/services/reports.service'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useReportsStore = defineStore('reports', () => {
  // State
  const reports = ref<Report[]>([])
  const currentReport = ref<Report | null>(null)
  const loading = ref(false)
  const filters = ref({
    incidentType: '',
    search: ''
  })

  // Getters
  const filteredReports = computed(() => {
    let result = reports.value

    if (filters.value.incidentType) {
      result = result.filter(r => r.incidentType === filters.value.incidentType)
    }

    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      result = result.filter(r =>
        r.location?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.contact?.toLowerCase().includes(searchLower)
      )
    }

    return result
  })

  const incidentTypes = computed(() => {
    const types = new Set(reports.value.map(r => r.incidentType).filter(Boolean))
    return Array.from(types)
  })

  const dashboardStats = computed<DashboardStats>(() => {
    const total = reports.value.length
    const avgScore = total > 0
      ? reports.value.reduce((sum, r) => sum + (r.credibilityScore || 0), 0) / total
      : 0

    const thisMonth = reports.value.filter(r => {
      if (!r.createdOn) return false
      const created = new Date(r.createdOn)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length

    return {
      totalReports: total,
      totalUsers: 0, // Would come from user service
      activeIncidents: reports.value.filter(r => r.credibilityScore && r.credibilityScore >= 0.7).length,
      resolvedIncidents: reports.value.filter(r => r.credibilityScore && r.credibilityScore < 0.3).length,
      reportsThisMonth: thisMonth,
      avgCredibilityScore: Math.round(avgScore * 100) / 100
    }
  })

  // Actions
  async function fetchReports() {
    loading.value = true
    try {
      reports.value = await reportsService.getAll()
    } catch (error) {
      toast.error('Failed to fetch reports')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchReportById(id: number) {
    loading.value = true
    try {
      currentReport.value = await reportsService.getById(id)
      return currentReport.value
    } catch (error) {
      toast.error('Failed to fetch report')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createReport(report: Omit<Report, 'id' | 'createdOn' | 'updatedOn'>) {
    loading.value = true
    try {
      const newReport = await reportsService.create(report)
      reports.value.unshift(newReport)
      toast.success('Report created successfully')
      return newReport
    } catch (error) {
      toast.error('Failed to create report')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateReport(id: number, data: Partial<Report>) {
    loading.value = true
    try {
      const updated = await reportsService.update(id, data)
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reports.value[index] = updated
      }
      if (currentReport.value?.id === id) {
        currentReport.value = updated
      }
      toast.success('Report updated successfully')
      return updated
    } catch (error) {
      toast.error('Failed to update report')
      throw error
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = { incidentType: '', search: '' }
  }

  return {
    // State
    reports,
    currentReport,
    loading,
    filters,
    // Getters
    filteredReports,
    incidentTypes,
    dashboardStats,
    // Actions
    fetchReports,
    fetchReportById,
    createReport,
    updateReport,
    setFilters,
    clearFilters
  }
})
