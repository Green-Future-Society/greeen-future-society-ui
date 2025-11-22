<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { analyticsService } from '@/services/analytics.service'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const authStore = useAuthStore()
const showUserMenu = ref(false)
const showNotifications = ref(false)

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  type: 'alert' | 'info' | 'warning'
}

const notifications = ref<Notification[]>([])
const seenReportIds = ref<Set<number>>(new Set())
let pollInterval: ReturnType<typeof setInterval> | null = null

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

function getNotificationType(incidentType: string): 'alert' | 'info' | 'warning' {
  const alertTypes = ['Forest Fire', 'Poaching', 'Wildlife Trafficking']
  const warningTypes = ['Illegal Logging', 'Deforestation', 'Charcoal Burning']

  if (alertTypes.includes(incidentType)) return 'alert'
  if (warningTypes.includes(incidentType)) return 'warning'
  return 'info'
}

async function fetchNotifications() {
  try {
    const stats = await analyticsService.getDashboardStats()

    stats.recent_reports.forEach(report => {
      // Check if this is a new report we haven't seen
      const isNew = !seenReportIds.value.has(report.id)

      // Add to seen reports
      seenReportIds.value.add(report.id)

      // Check if notification already exists
      const exists = notifications.value.some(n => n.id === report.id)
      if (!exists) {
        notifications.value.unshift({
          id: report.id,
          title: `${report.incidentType} Report`,
          message: `${report.description.substring(0, 60)}${report.description.length > 60 ? '...' : ''} - ${report.location}`,
          time: getTimeAgo(report.createdOn),
          read: !isNew, // Mark as unread only if it's truly new
          type: getNotificationType(report.incidentType)
        })
      } else {
        // Update time for existing notifications
        const notification = notifications.value.find(n => n.id === report.id)
        if (notification) {
          notification.time = getTimeAgo(report.createdOn)
        }
      }
    })

    // Keep only latest 10 notifications
    if (notifications.value.length > 10) {
      notifications.value = notifications.value.slice(0, 10)
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
}

function markAsRead(id: number) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

function markAllAsRead() {
  notifications.value.forEach(n => n.read = true)
}

onMounted(() => {
  // Initial fetch
  fetchNotifications()

  // Poll every 5 minutes (300000ms)
  pollInterval = setInterval(fetchNotifications, 300000)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>

<template>
  <header class="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Mobile menu button & Page Title -->
      <div class="flex items-center">
        <button
          @click="emit('toggle-sidebar')"
          class="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ title || 'Dashboard' }}</h1>
      </div>

      <!-- Right Side -->
      <div class="flex items-center space-x-2 sm:space-x-4">
        <!-- Notifications -->
        <div class="relative">
          <button
            @click="showNotifications = !showNotifications"
            class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {{ unreadCount }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div
            v-if="showNotifications"
            class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">Notifications</h3>
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="text-xs text-green-600 hover:text-green-700"
              >
                Mark all read
              </button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                @click="markAsRead(notification.id)"
                :class="[
                  'px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer',
                  !notification.read ? 'bg-green-50' : ''
                ]"
              >
                <div class="flex items-start">
                  <div :class="[
                    'w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0',
                    notification.type === 'alert' ? 'bg-red-500' : '',
                    notification.type === 'info' ? 'bg-blue-500' : '',
                    notification.type === 'warning' ? 'bg-yellow-500' : ''
                  ]"></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ notification.message }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                  </div>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-gray-500 text-sm">
                No notifications
              </div>
            </div>
            <div class="px-4 py-2 border-t border-gray-100">
              <router-link
                to="/reports"
                class="block w-full text-center text-sm text-green-600 hover:text-green-700 py-1"
                @click="showNotifications = false"
              >
                View all reports
              </router-link>
            </div>
          </div>
        </div>

        <!-- User Menu -->
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {{ authStore.userFullName.charAt(0).toUpperCase() }}
            </div>
            <span class="text-gray-700 font-medium hidden sm:block">{{ authStore.userFullName }}</span>
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            <router-link
              to="/settings"
              class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              @click="showUserMenu = false"
            >
              Settings
            </router-link>
            <hr class="my-1" />
            <button
              @click="authStore.logout(); showUserMenu = false"
              class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
