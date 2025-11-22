<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/common/Sidebar.vue'
import NavBar from '@/components/common/NavBar.vue'
import { useReportsStore } from '@/stores/reports.store'
import { useToast } from 'vue-toastification'
import { geocodingService, type GeocodingResult } from '@/services/geocoding.service'

const router = useRouter()
const reportsStore = useReportsStore()
const toast = useToast()

const form = ref({
  contact: '',
  location: '',
  latitude: 0,
  longitude: 0,
  description: '',
  originalMessage: '',
  incidentType: '',
  credibilityScore: 0.5,
  updatedBy: ''
})

const locationSuggestions = ref<GeocodingResult[]>([])
const showSuggestions = ref(false)
const isGeocoding = ref(false)

let debounceTimer: ReturnType<typeof setTimeout>

watch(() => form.value.location, (newValue) => {
  clearTimeout(debounceTimer)
  if (newValue.length >= 2) {
    debounceTimer = setTimeout(async () => {
      isGeocoding.value = true
      try {
        locationSuggestions.value = await geocodingService.searchLocation(newValue)
        showSuggestions.value = locationSuggestions.value.length > 0
      } catch (error) {
        console.error('Geocoding error:', error)
      } finally {
        isGeocoding.value = false
      }
    }, 300)
  } else {
    locationSuggestions.value = []
    showSuggestions.value = false
  }
})

function selectLocation(result: GeocodingResult) {
  form.value.location = result.admin1 ? `${result.name}, ${result.admin1}` : result.name
  form.value.latitude = result.latitude
  form.value.longitude = result.longitude
  showSuggestions.value = false
  toast.success(`Coordinates found: ${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`)
}

const incidentTypes = [
  'Illegal Logging',
  'Forest Fire',
  'Poaching',
  'Encroachment',
  'Pollution',
  'Deforestation',
  'Wildlife Trafficking',
  'Other'
]

const sidebarOpen = ref(false)

async function handleSubmit() {
  if (!form.value.contact || !form.value.description) {
    toast.error('Please fill in all required fields')
    return
  }

  try {
    await reportsStore.createReport(form.value)
    router.push('/reports')
  } catch (error) {
    // Error handled by store
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col lg:ml-0">
      <NavBar title="New Report" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6">
        <!-- Back Button -->
        <button
          @click="router.back()"
          class="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div class="max-w-3xl mx-auto">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Create New Report</h2>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Contact <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.contact"
                    type="text"
                    required
                    placeholder="Phone number or name"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div class="relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div class="relative">
                    <input
                      v-model="form.location"
                      type="text"
                      placeholder="e.g., Naivasha, Karura"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      @blur="() => window.setTimeout(() => showSuggestions = false, 200)"
                    />
                    <svg v-if="isGeocoding" class="absolute right-3 top-2.5 w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <!-- Location Suggestions -->
                  <div
                    v-if="showSuggestions"
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="suggestion in locationSuggestions"
                      :key="suggestion.id"
                      type="button"
                      @click="selectLocation(suggestion)"
                      class="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center justify-between"
                    >
                      <div>
                        <p class="font-medium text-gray-900">{{ suggestion.name }}</p>
                        <p class="text-xs text-gray-500">{{ suggestion.admin1 }}, {{ suggestion.country }}</p>
                      </div>
                      <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <p v-if="form.latitude && form.longitude" class="mt-1 text-xs text-green-600">
                    📍 {{ form.latitude.toFixed(4) }}, {{ form.longitude.toFixed(4) }}
                  </p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
                <select
                  v-model="form.incidentType"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select incident type</option>
                  <option v-for="type in incidentTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  required
                  placeholder="Describe the incident..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Original Message</label>
                <textarea
                  v-model="form.originalMessage"
                  rows="3"
                  placeholder="Original report message (if any)"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Credibility Score: {{ (form.credibilityScore * 10).toFixed(0) }}/10
                </label>
                <input
                  v-model.number="form.credibilityScore"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div class="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  @click="router.back()"
                  class="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="reportsStore.loading"
                  class="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <svg v-if="reportsStore.loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ reportsStore.loading ? 'Creating...' : 'Create Report' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
