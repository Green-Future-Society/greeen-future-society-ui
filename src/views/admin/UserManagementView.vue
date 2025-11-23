<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'
import NavBar from '@/components/common/NavBar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { User } from '@/types'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Mock data - would come from API
const users = ref<User[]>([])
const loading = ref(false)
const sidebarOpen = ref(false)
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')

// Mock fetch users
onMounted(async () => {
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    users.value = [
      {
        id: 1,
        name: 'John Doe',
        msisdn: '254712345678',
        emailAddress: 'john@example.com',
        username: 'johnd',
        userStatus: 'ACTIVE' as any,
        userRole: 'ADMIN' as any,
        locked: false,
        enabled: true
      },
      {
        id: 2,
        name: 'Jane Smith',
        msisdn: '254723456789',
        emailAddress: 'jane@example.com',
        username: 'janes',
        userStatus: 'ACTIVE' as any,
        userRole: 'USER' as any,
        locked: false,
        enabled: true
      }
    ]
    loading.value = false
  }, 1000)
})

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-700'
    case 'INACTIVE': return 'bg-gray-100 text-gray-700'
    case 'SUSPENDED': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'ADMIN': return 'bg-green-100 text-green-700'
    case 'USER': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function toggleUserStatus(user: User) {
  // Would call API
  toast.success(`User ${user.name} status updated`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 lg:flex">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0">
      <NavBar title="User Management" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-64">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search users..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              v-model="filterRole"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
            <select
              v-model="filterStatus"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <LoadingSpinner v-if="loading" text="Loading users..." />

          <table v-else class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900">{{ user.name }}</p>
                      <p class="text-sm text-gray-500">@{{ user.username }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="text-gray-900">{{ user.msisdn }}</p>
                  <p class="text-sm text-gray-500">{{ user.emailAddress }}</p>
                </td>
                <td class="px-6 py-4">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getRoleBadgeClass(user.userRole)]">
                    {{ user.userRole }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusBadgeClass(user.userStatus)]">
                    {{ user.userStatus }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="toggleUserStatus(user)"
                      class="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Suspend"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>
