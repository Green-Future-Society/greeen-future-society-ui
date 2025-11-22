const BASE_URL = 'https://semiconically-proacquittal-wanda.ngrok-free.dev/api/v1'

export interface DashboardStats {
  summary: {
    total_reports: number
    verified_reports: number
  }
  hotspots: Record<string, number>
  crime_stats: Record<string, number>
  recent_reports: Array<{
    id: number
    incidentType: string
    location: string
    description: string
    createdOn: string
    credibilityScore: number
  }>
}

export interface MapDataPoint {
  lat: number
  lon: number
  desc: string
}

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${BASE_URL}/dashboard-stats`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats')
    }
    return response.json()
  },

  async getMapData(): Promise<MapDataPoint[]> {
    const response = await fetch(`${BASE_URL}/map-data`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch map data')
    }
    return response.json()
  }
}
