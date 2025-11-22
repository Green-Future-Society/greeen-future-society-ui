<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import Sidebar from '@/components/common/Sidebar.vue'
import NavBar from '@/components/common/NavBar.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { analyticsService, type DashboardStats } from '@/services/analytics.service'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const sidebarOpen = ref(false)
const loading = ref(true)
const stats = ref<DashboardStats | null>(null)
const showReportModal = ref(false)
const selectedReport = ref<DashboardStats['recent_reports'][0] | null>(null)

function openReportModal(report: DashboardStats['recent_reports'][0]) {
  selectedReport.value = report
  showReportModal.value = true
}

function closeReportModal() {
  showReportModal.value = false
  selectedReport.value = null
}

onMounted(async () => {
  try {
    stats.value = await analyticsService.getDashboardStats()
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
  } finally {
    loading.value = false
  }
})

const crimeChartData = computed(() => {
  if (!stats.value) return { labels: [], datasets: [] }

  const labels = Object.keys(stats.value.crime_stats)
  const data = Object.values(stats.value.crime_stats)

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
      borderWidth: 0
    }]
  }
})

const hotspotChartData = computed(() => {
  if (!stats.value) return { labels: [], datasets: [] }

  const labels = Object.keys(stats.value.hotspots)
  const data = Object.values(stats.value.hotspots)

  return {
    labels,
    datasets: [{
      label: 'Reports',
      data,
      backgroundColor: '#10B981',
      borderRadius: 4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        padding: 15,
        font: { size: 11 }
      }
    }
  }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col">
      <NavBar title="Dashboard" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6">
        <LoadingSpinner v-if="loading" text="Loading dashboard data..." />

        <template v-else-if="stats">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Reports"
              :value="stats.summary.total_reports"
              icon="report"
              color="green"
            />
            <StatsCard
              title="Verified Reports"
              :value="stats.summary.verified_reports"
              icon="check"
              color="green"
            />
            <StatsCard
              title="Hotspots"
              :value="Object.keys(stats.hotspots).length"
              icon="alert"
              color="yellow"
            />
            <StatsCard
              title="Crime Types"
              :value="Object.keys(stats.crime_stats).length"
              icon="chart"
              color="green"
            />
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Crime Stats Doughnut -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">Crime Distribution</h2>
                <router-link to="/analytics" class="text-sm text-green-600 hover:text-green-700">
                  View more
                </router-link>
              </div>
              <div class="h-64">
                <Doughnut :data="crimeChartData" :options="chartOptions" />
              </div>
            </div>

            <!-- Hotspots Bar -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">Hotspot Locations</h2>
                <router-link to="/analytics" class="text-sm text-green-600 hover:text-green-700">
                  View more
                </router-link>
              </div>
              <div class="h-64">
                <Bar :data="hotspotChartData" :options="barOptions" />
              </div>
            </div>
          </div>

          <!-- Recent Reports -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Recent Reports</h2>
              <router-link
                to="/reports"
                class="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View all
              </router-link>
            </div>

            <div class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              <div
                v-for="report in stats.recent_reports.slice(0, 10)"
                :key="report.id"
                @click="openReportModal(report)"
                class="px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                        {{ report.incidentType }}
                      </span>
                      <span class="text-xs text-gray-500 truncate">{{ report.location }}</span>
                    </div>
                    <p class="text-sm text-gray-900 mt-1 truncate">
                      {{ report.description.length > 80 ? report.description.substring(0, 80) + '...' : report.description }}
                    </p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(report.createdOn) }}</p>
                  </div>
                  <div class="ml-3 shrink-0">
                    <span class="text-xs font-medium text-gray-600">
                      {{ report.credibilityScore.toFixed(1) }}/10
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="stats.recent_reports.length === 0" class="px-6 py-8 text-center text-gray-500">
                No reports yet
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <router-link
                to="/reports/new"
                class="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="text-green-700 font-medium">New Report</span>
              </router-link>
              <router-link
                to="/analytics"
                class="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span class="text-green-700 font-medium">Analytics</span>
              </router-link>
              <router-link
                to="/weather"
                class="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span class="text-green-700 font-medium">Weather</span>
              </router-link>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- Report Detail Modal -->
    <div
      v-if="showReportModal && selectedReport"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      @click.self="closeReportModal"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Report Details</h3>
          <button
            @click="closeReportModal"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
              {{ selectedReport.incidentType }}
            </span>
            <span class="text-sm font-medium text-gray-700">
              Score: {{ selectedReport.credibilityScore.toFixed(1) }}/10
            </span>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Location</label>
            <p class="text-gray-900">{{ selectedReport.location }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <p class="text-gray-900 whitespace-pre-wrap">{{ selectedReport.description }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <p class="text-gray-900">{{ formatDate(selectedReport.createdOn) }}</p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-100">
          <button
            @click="closeReportModal"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
