<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'
import NavBar from '@/components/common/NavBar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useReportsStore } from '@/stores/reports.store'

const reportsStore = useReportsStore()
const sidebarOpen = ref(false)
const displayCount = ref(5)
const showTypeDropdown = ref(false)

function selectType(type: string) {
  reportsStore.setFilters({ incidentType: type })
  showTypeDropdown.value = false
}

onMounted(() => {
  reportsStore.fetchReports()
})

const visibleReports = computed(() => {
  return reportsStore.filteredReports.slice(0, displayCount.value)
})

const hasMoreReports = computed(() => {
  return displayCount.value < reportsStore.filteredReports.length
})

const hasActiveFilters = computed(() => {
  return reportsStore.filters.search || reportsStore.filters.incidentType
})

function loadMore() {
  displayCount.value += 5
}

function getCredibilityColor(score: number) {
  if (score >= 0.7) return 'bg-red-100 text-red-700'
  if (score >= 0.4) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-700'
    case 'REJECTED': return 'bg-red-100 text-red-700'
    default: return 'bg-yellow-100 text-yellow-700'
  }
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 lg:flex overflow-x-hidden">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0 overflow-x-hidden">
      <NavBar title="Reports" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6 overflow-x-hidden">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 class="text-lg text-gray-600">{{ reportsStore.filteredReports.length }} reports found</h2>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="reportsStore.fetchReports()"
              :disabled="reportsStore.loading"
              class="inline-flex items-center justify-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh"
            >
              <svg :class="['w-5 h-5', reportsStore.loading && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <router-link
              to="/reports/new"
              class="inline-flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Report
            </router-link>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div class="flex flex-col gap-3">
            <input
              :value="reportsStore.filters.search"
              @input="reportsStore.setFilters({ search: ($event.target as HTMLInputElement).value })"
              type="text"
              placeholder="Search reports..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <!-- Custom Dropdown -->
            <div class="relative">
              <button
                type="button"
                @click="showTypeDropdown = !showTypeDropdown"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between"
              >
                <span :class="reportsStore.filters.incidentType ? 'text-gray-900' : 'text-gray-500'">
                  {{ reportsStore.filters.incidentType || 'All Types' }}
                </span>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <!-- Dropdown menu - opens downward -->
              <div
                v-if="showTypeDropdown"
                class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
              >
                <button
                  type="button"
                  @click="selectType('')"
                  :class="['w-full px-4 py-2 text-left text-sm hover:bg-green-50', !reportsStore.filters.incidentType && 'bg-green-100 text-green-700']"
                >
                  All Types
                </button>
                <button
                  v-for="type in reportsStore.incidentTypes"
                  :key="type"
                  type="button"
                  @click="selectType(type)"
                  :class="['w-full px-4 py-2 text-left text-sm hover:bg-green-50', reportsStore.filters.incidentType === type && 'bg-green-100 text-green-700']"
                >
                  {{ type }}
                </button>
              </div>
              <!-- Backdrop to close dropdown -->
              <div
                v-if="showTypeDropdown"
                class="fixed inset-0 z-40"
                @click="showTypeDropdown = false"
              ></div>
            </div>
            <!-- Clear button - only shows when filters are active -->
            <button
              v-if="hasActiveFilters"
              @click="reportsStore.clearFilters()"
              class="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Reports List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <LoadingSpinner v-if="reportsStore.loading" text="Loading reports..." />

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="report in visibleReports"
              :key="report.id"
              class="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', getCredibilityColor(report.credibilityScore || 0)]">
                      {{ report.incidentType || 'Unknown' }}
                    </span>
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusColor(report.status || 'PENDING')]">
                      {{ report.status || 'PENDING' }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(report.createdOn || '') }}
                    </span>
                  </div>

                  <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-1 truncate">
                    {{ report.location || 'Unknown Location' }}
                  </h3>

                  <p class="text-gray-600 line-clamp-2 mb-2 text-sm sm:text-base">
                    {{ report.description }}
                  </p>

                  <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span class="truncate">{{ report.contact }}</span>
                    </span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {{ ((report.credibilityScore || 0) * 10).toFixed(0) }}/10
                    </span>
                  </div>
                </div>

                <router-link
                  :to="`/reports/${report.id}`"
                  class="flex-shrink-0 p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </router-link>
              </div>
            </div>

            <div v-if="reportsStore.filteredReports.length === 0" class="p-8 text-center text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No reports found</p>
              <router-link to="/reports/new" class="text-green-600 hover:text-green-700 mt-2 inline-block">
                Create your first report
              </router-link>
            </div>

            <!-- Load More Button -->
            <div v-if="hasMoreReports" class="p-4 text-center border-t border-gray-100">
              <button
                @click="loadMore"
                class="w-full sm:w-auto px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Load More ({{ reportsStore.filteredReports.length - displayCount }} remaining)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
