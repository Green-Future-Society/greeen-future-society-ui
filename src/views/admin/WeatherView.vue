<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'
import NavBar from '@/components/common/NavBar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { weatherService } from '@/services/weather.service'
import { useToast } from 'vue-toastification'

const toast = useToast()

const sidebarOpen = ref(false)
const loading = ref(false)
const temperatureData = ref<any>(null)
const precipitationData = ref<any>(null)

const location = ref({
  lat: -1.2921,
  lng: 36.8219,
  years: 5
})

async function fetchWeatherData() {
  loading.value = true
  try {
    const [temp, precip] = await Promise.all([
      weatherService.getTemperature(location.value.lat, location.value.lng, location.value.years),
      weatherService.getPrecipitation(location.value.lat, location.value.lng, location.value.years)
    ])
    temperatureData.value = temp
    precipitationData.value = precip
    toast.success('Weather data loaded successfully')
  } catch (error) {
    toast.error('Failed to load weather data')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 lg:flex">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0">
      <NavBar title="Weather Data" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6">
        <!-- Location Input -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Location Settings</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                v-model.number="location.lat"
                type="number"
                step="0.0001"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                v-model.number="location.lng"
                type="number"
                step="0.0001"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Years of Data</label>
              <input
                v-model.number="location.years"
                type="number"
                min="1"
                max="20"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="flex items-end">
              <button
                @click="fetchWeatherData"
                :disabled="loading"
                class="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50"
              >
                {{ loading ? 'Loading...' : 'Fetch Data' }}
              </button>
            </div>
          </div>
        </div>

        <LoadingSpinner v-if="loading" text="Loading weather data..." />

        <template v-else>
          <!-- Weather Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Temperature -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">Temperature Data</h2>
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              <div v-if="temperatureData" class="space-y-3">
                <div class="text-3xl font-bold text-gray-900">
                  {{ temperatureData.annual_avg_temperature_celsius?.toFixed(1) || 'N/A' }}°C
                </div>
                <p class="text-sm text-gray-500">Annual average temperature</p>
                <div class="grid grid-cols-2 gap-2 mt-3">
                  <div class="bg-red-50 p-2 rounded">
                    <p class="text-xs text-gray-500">Max</p>
                    <p class="font-semibold text-red-600">{{ temperatureData.annual_max_temperature_celsius?.toFixed(1) }}°C</p>
                  </div>
                  <div class="bg-blue-50 p-2 rounded">
                    <p class="text-xs text-gray-500">Min</p>
                    <p class="font-semibold text-blue-600">{{ temperatureData.annual_min_temperature_celsius?.toFixed(1) }}°C</p>
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-2">{{ temperatureData.year_range_used }}</p>
                <div v-if="temperatureData.values" class="mt-4 pt-4 border-t border-gray-100">
                  <p class="text-sm font-medium text-gray-700 mb-2">Yearly Data</p>
                  <div class="space-y-2 max-h-40 overflow-auto">
                    <div v-for="item in temperatureData.values" :key="item.year" class="flex justify-between text-sm">
                      <span class="text-gray-600">{{ item.year }}</span>
                      <span class="font-medium">{{ item.annual_avg_temperature_celsius?.toFixed(1) }}°C</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 text-center py-8">
                Click "Fetch Data" to load temperature information
              </div>
            </div>

            <!-- Precipitation -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">Precipitation Data</h2>
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
              </div>

              <div v-if="precipitationData" class="space-y-3">
                <div class="text-3xl font-bold text-gray-900">
                  {{ precipitationData.annual_precipitation_mm?.toFixed(1) || 'N/A' }} mm
                </div>
                <p class="text-sm text-gray-500">Annual precipitation</p>
                <div class="bg-blue-50 p-2 rounded mt-3">
                  <p class="text-xs text-gray-500">Daily Average</p>
                  <p class="font-semibold text-blue-600">{{ precipitationData.daily_avg_precipitation_mm?.toFixed(1) }} mm</p>
                </div>
                <p class="text-xs text-gray-400 mt-2">{{ precipitationData.year_range_used }}</p>
                <div v-if="precipitationData.values" class="mt-4 pt-4 border-t border-gray-100">
                  <p class="text-sm font-medium text-gray-700 mb-2">Yearly Data</p>
                  <div class="space-y-2 max-h-40 overflow-auto">
                    <div v-for="item in precipitationData.values" :key="item.year" class="flex justify-between text-sm">
                      <span class="text-gray-600">{{ item.year }}</span>
                      <span class="font-medium">{{ item.annual_precipitation_mm?.toFixed(1) }} mm</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 text-center py-8">
                Click "Fetch Data" to load precipitation information
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
