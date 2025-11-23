<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import Sidebar from '@/components/common/Sidebar.vue'
import NavBar from '@/components/common/NavBar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { analyticsService, type DashboardStats, type MapDataPoint } from '@/services/analytics.service'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
)

const sidebarOpen = ref(false)
const loading = ref(true)
const stats = ref<DashboardStats | null>(null)
const mapData = ref<MapDataPoint[]>([])

onMounted(async () => {
  try {
    const [statsData, mapDataResult] = await Promise.all([
      analyticsService.getDashboardStats(),
      analyticsService.getMapData()
    ])
    stats.value = statsData
    mapData.value = mapDataResult
  } catch (error) {
    console.error('Failed to fetch analytics data:', error)
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
      borderRadius: 6
    }]
  }
})

const credibilityChartData = computed(() => {
  if (!stats.value) return { labels: [], datasets: [] }

  const reports = stats.value.recent_reports
  const labels = reports.map(r => r.location.substring(0, 15))
  const data = reports.map(r => r.credibilityScore)

  return {
    labels,
    datasets: [{
      label: 'Credibility Score',
      data,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        boxWidth: 12,
        padding: 15,
        font: { size: 12 }
      }
    }
  }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 10
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex flex-col min-h-screen lg:ml-64">
      <NavBar title="Analytics" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6">
        <LoadingSpinner v-if="loading" text="Loading analytics..." />

        <template v-else-if="stats">
          <!-- Summary Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-lg p-4 border border-gray-100">
              <p class="text-sm text-gray-500">Total Reports</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.summary.total_reports }}</p>
            </div>
            <div class="bg-white rounded-lg p-4 border border-gray-100">
              <p class="text-sm text-gray-500">Verified</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.summary.verified_reports }}</p>
            </div>
            <div class="bg-white rounded-lg p-4 border border-gray-100">
              <p class="text-sm text-gray-500">Hotspots</p>
              <p class="text-2xl font-bold text-gray-900">{{ Object.keys(stats.hotspots).length }}</p>
            </div>
            <div class="bg-white rounded-lg p-4 border border-gray-100">
              <p class="text-sm text-gray-500">Crime Types</p>
              <p class="text-2xl font-bold text-gray-900">{{ Object.keys(stats.crime_stats).length }}</p>
            </div>
          </div>

          <!-- Main Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Crime Distribution -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Crime Type Distribution</h2>
              <div class="h-80">
                <Doughnut :data="crimeChartData" :options="doughnutOptions" />
              </div>
            </div>

            <!-- Hotspot Locations -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Reports by Location</h2>
              <div class="h-80">
                <Bar :data="hotspotChartData" :options="barOptions" />
              </div>
            </div>
          </div>

          <!-- Credibility Trend -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Credibility Scores by Report</h2>
            <div class="h-64">
              <Line :data="credibilityChartData" :options="lineOptions" />
            </div>
          </div>

          <!-- Detailed Tables -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Crime Stats Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Crime Statistics</h2>
              <div class="space-y-3">
                <div
                  v-for="(count, type) in stats.crime_stats"
                  :key="type"
                  class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span class="text-gray-700">{{ type }}</span>
                  <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {{ count }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Map Points Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Incident Coordinates</h2>
              <div class="space-y-3">
                <div
                  v-for="(point, index) in mapData"
                  :key="index"
                  class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ point.desc }}</p>
                    <p class="text-xs text-gray-500">{{ point.lat.toFixed(4) }}, {{ point.lon.toFixed(4) }}</p>
                  </div>
                  <a
                    :href="`https://www.google.com/maps?q=${point.lat},${point.lon}`"
                    target="_blank"
                    class="text-green-600 hover:text-green-700"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </a>
                </div>
                <div v-if="mapData.length === 0" class="text-center py-4 text-gray-500">
                  No map data available
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
