<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/common/Sidebar.vue'
import NavBar from '@/components/common/NavBar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useReportsStore } from '@/stores/reports.store'
import { weatherService } from '@/services/weather.service'
import { geocodingService } from '@/services/geocoding.service'

const route = useRoute()
const router = useRouter()
const reportsStore = useReportsStore()

const weatherData = ref<{
  temperature: any
  precipitation: any
} | null>(null)
const weatherLoading = ref(false)
const weatherError = ref('')

async function fetchWeatherData() {
  const report = reportsStore.currentReport
  if (!report) return

  let lat = report.latitude
  let lng = report.longitude

  // If no coordinates stored, try to geocode from location
  if (!lat || !lng) {
    if (report.location) {
      try {
        const coords = await geocodingService.getCoordinates(report.location)
        if (coords) {
          lat = coords.latitude
          lng = coords.longitude
        }
      } catch (error) {
        console.error('Geocoding failed:', error)
      }
    }
  }

  if (!lat || !lng) {
    weatherError.value = 'No location coordinates available'
    return
  }

  weatherLoading.value = true
  weatherError.value = ''

  try {
    const [tempData, precipData] = await Promise.all([
      weatherService.getTemperature(lat, lng, 5),
      weatherService.getPrecipitation(lat, lng, 5)
    ])
    weatherData.value = {
      temperature: tempData,
      precipitation: precipData
    }
  } catch (error) {
    weatherError.value = 'Failed to load weather data'
    console.error('Weather fetch error:', error)
  } finally {
    weatherLoading.value = false
  }
}

const sidebarOpen = ref(false)
const isEditing = ref(false)
const editForm = ref({
  location: '',
  description: '',
  incidentType: '',
  credibilityScore: 0,
  status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED'
})

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED'] as const

const showMessageModal = ref(false)
const modalTitle = ref('')
const modalContent = ref('')

function openMessageModal(title: string, content: string) {
  modalTitle.value = title
  modalContent.value = content
  showMessageModal.value = true
}

function closeMessageModal() {
  showMessageModal.value = false
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) {
    await reportsStore.fetchReportById(id)
    if (reportsStore.currentReport) {
      editForm.value = {
        location: reportsStore.currentReport.location || '',
        description: reportsStore.currentReport.description || '',
        incidentType: reportsStore.currentReport.incidentType || '',
        credibilityScore: reportsStore.currentReport.credibilityScore || 0,
        status: (reportsStore.currentReport.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED'
      }
      // Fetch weather data for this report's location
      fetchWeatherData()
    }
  }
})

async function saveChanges() {
  const id = Number(route.params.id)
  await reportsStore.updateReport(id, editForm.value)
  isEditing.value = false
}

function cancelEdit() {
  if (reportsStore.currentReport) {
    editForm.value = {
      location: reportsStore.currentReport.location || '',
      description: reportsStore.currentReport.description || '',
      incidentType: reportsStore.currentReport.incidentType || '',
      credibilityScore: reportsStore.currentReport.credibilityScore || 0,
      status: (reportsStore.currentReport.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED'
    }
  }
  isEditing.value = false
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCredibilityColor(score: number) {
  if (score >= 0.7) return 'text-red-600'
  if (score >= 0.4) return 'text-yellow-600'
  return 'text-green-600'
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-700'
    case 'REJECTED': return 'bg-red-100 text-red-700'
    default: return 'bg-yellow-100 text-yellow-700'
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col">
      <NavBar title="Report Details" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6">
        <!-- Back Button -->
        <button
          @click="router.back()"
          class="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Reports
        </button>

        <LoadingSpinner v-if="reportsStore.loading" text="Loading report..." />

        <template v-else-if="reportsStore.currentReport">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  Report #{{ reportsStore.currentReport.id }}
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusColor(reportsStore.currentReport.status || 'PENDING')]">
                    {{ reportsStore.currentReport.status || 'PENDING' }}
                  </span>
                </h2>
                <p class="text-sm text-gray-500">
                  Created: {{ formatDate(reportsStore.currentReport.createdOn || '') }}
                </p>
              </div>
              <button
                v-if="!isEditing"
                @click="isEditing = true"
                class="inline-flex items-center bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <div v-else class="flex space-x-2">
                <button
                  @click="cancelEdit"
                  class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="saveChanges"
                  class="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Left Column -->
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Location</label>
                    <input
                      v-if="isEditing"
                      v-model="editForm.location"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <p v-else class="text-gray-900">{{ reportsStore.currentReport.location || 'N/A' }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Incident Type</label>
                    <input
                      v-if="isEditing"
                      v-model="editForm.incidentType"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <p v-else class="text-gray-900">{{ reportsStore.currentReport.incidentType || 'N/A' }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Contact</label>
                    <p class="text-gray-900">{{ reportsStore.currentReport.contact }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Credibility Score</label>
                    <div v-if="isEditing" class="flex items-center space-x-4">
                      <input
                        v-model.number="editForm.credibilityScore"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        class="flex-1"
                      />
                      <span class="text-gray-900">{{ (editForm.credibilityScore * 10).toFixed(0) }}/10</span>
                    </div>
                    <p v-else :class="['text-2xl font-bold', getCredibilityColor(reportsStore.currentReport.credibilityScore || 0)]">
                      {{ ((reportsStore.currentReport.credibilityScore || 0) * 10).toFixed(0) }}/10
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <select
                      v-if="isEditing"
                      v-model="editForm.status"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option v-for="status in statusOptions" :key="status" :value="status">
                        {{ status }}
                      </option>
                    </select>
                    <span v-else :class="['px-3 py-1 text-sm font-medium rounded-full', getStatusColor(reportsStore.currentReport.status || 'PENDING')]">
                      {{ reportsStore.currentReport.status || 'PENDING' }}
                    </span>
                  </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Description</label>
                    <textarea
                      v-if="isEditing"
                      v-model="editForm.description"
                      rows="4"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    ></textarea>
                    <div v-else>
                      <p class="text-gray-900">
                        {{ reportsStore.currentReport.description && reportsStore.currentReport.description.length > 150
                          ? reportsStore.currentReport.description.substring(0, 150) + '...'
                          : reportsStore.currentReport.description || 'N/A' }}
                      </p>
                      <button
                        v-if="reportsStore.currentReport.description && reportsStore.currentReport.description.length > 150"
                        @click="openMessageModal('Description', reportsStore.currentReport.description)"
                        class="text-sm text-green-600 hover:text-green-700 mt-1"
                      >
                        Show more
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Original Message</label>
                    <div class="bg-gray-50 p-3 rounded-lg">
                      <p class="text-gray-900">
                        {{ reportsStore.currentReport.originalMessage && reportsStore.currentReport.originalMessage.length > 150
                          ? reportsStore.currentReport.originalMessage.substring(0, 150) + '...'
                          : reportsStore.currentReport.originalMessage || 'N/A' }}
                      </p>
                      <button
                        v-if="reportsStore.currentReport.originalMessage && reportsStore.currentReport.originalMessage.length > 150"
                        @click="openMessageModal('Original Message', reportsStore.currentReport.originalMessage)"
                        class="text-sm text-green-600 hover:text-green-700 mt-1"
                      >
                        Show more
                      </button>
                    </div>
                  </div>

                  <div v-if="reportsStore.currentReport.updatedOn">
                    <label class="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                    <p class="text-gray-900">
                      {{ formatDate(reportsStore.currentReport.updatedOn) }}
                      <span v-if="reportsStore.currentReport.updatedBy" class="text-gray-500">
                        by {{ reportsStore.currentReport.updatedBy }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weather Card -->
          <div class="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-green-50">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                Weather at Location
              </h2>
            </div>

            <div class="p-6">
              <!-- Loading -->
              <div v-if="weatherLoading" class="flex items-center justify-center py-8">
                <svg class="animate-spin h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-2 text-gray-500">Loading weather data...</span>
              </div>

              <!-- Error -->
              <div v-else-if="weatherError" class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{{ weatherError }}</p>
              </div>

              <!-- Weather Data -->
              <div v-else-if="weatherData" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Temperature -->
                <div class="bg-green-50 rounded-lg p-3">
                  <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg class="w-3 h-3 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                    Temperature
                  </h3>
                  <div class="text-xl font-bold text-gray-900 mb-2">
                    {{ weatherData.temperature?.annual_avg_temperature_celsius?.toFixed(1) || 'N/A' }}°C
                  </div>
                  <div class="grid grid-cols-2 gap-1.5 text-xs">
                    <div class="bg-white p-1.5 rounded">
                      <p class="text-gray-500">Max</p>
                      <p class="font-semibold text-gray-900">
                        {{ weatherData.temperature?.annual_max_temperature_celsius?.toFixed(1) || 'N/A' }}°C
                      </p>
                    </div>
                    <div class="bg-white p-1.5 rounded">
                      <p class="text-gray-500">Min</p>
                      <p class="font-semibold text-gray-900">
                        {{ weatherData.temperature?.annual_min_temperature_celsius?.toFixed(1) || 'N/A' }}°C
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Precipitation -->
                <div class="bg-green-50 rounded-lg p-3">
                  <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg class="w-3 h-3 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Precipitation
                  </h3>
                  <div class="text-xl font-bold text-gray-900 mb-2">
                    {{ weatherData.precipitation?.annual_precipitation_mm?.toFixed(0) || 'N/A' }} mm
                  </div>
                  <div class="grid grid-cols-2 gap-1.5 text-xs">
                    <div class="bg-white p-1.5 rounded">
                      <p class="text-gray-500">Rain Days</p>
                      <p class="font-semibold text-gray-900">
                        {{ weatherData.precipitation?.annual_rainy_days || 'N/A' }}
                      </p>
                    </div>
                    <div class="bg-white p-1.5 rounded">
                      <p class="text-gray-500">Max Daily</p>
                      <p class="font-semibold text-gray-900">
                        {{ weatherData.precipitation?.annual_max_daily_precipitation_mm?.toFixed(1) || 'N/A' }} mm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="text-center py-12">
          <p class="text-gray-500">Report not found</p>
          <router-link to="/reports" class="text-green-600 hover:text-green-700 mt-2 inline-block">
            Back to Reports
          </router-link>
        </div>
      </main>
    </div>

    <!-- Message Modal -->
    <div
      v-if="showMessageModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      @click.self="closeMessageModal"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ modalTitle }}</h3>
          <button
            @click="closeMessageModal"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <p class="text-gray-900 whitespace-pre-wrap">{{ modalContent }}</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-100">
          <button
            @click="closeMessageModal"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
