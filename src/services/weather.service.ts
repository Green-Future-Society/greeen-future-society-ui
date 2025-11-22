import api from './api'

export const weatherService = {
  async getTemperature(lat: number, lng: number, years: number = 5): Promise<any> {
    const response = await api.get('/weather/temperature', {
      params: { lat, lng, years }
    })
    return response.data
  },

  async getPrecipitation(lat: number, lng: number, years: number = 10): Promise<any> {
    const response = await api.get('/weather/precipitation', {
      params: { lat, lng, years }
    })
    return response.data
  }
}
