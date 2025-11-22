export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
}

export const geocodingService = {
  async searchLocation(query: string): Promise<GeocodingResult[]> {
    if (!query || query.length < 2) return []

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch location data')
    }

    const data = await response.json()
    return data.results || []
  },

  async getCoordinates(locationName: string): Promise<{ latitude: number; longitude: number } | null> {
    const results = await this.searchLocation(locationName)
    if (results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude
      }
    }
    return null
  }
}
