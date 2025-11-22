<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'
import NavBar from '@/components/common/NavBar.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const sidebarOpen = ref(false)

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.emailAddress || '',
  msisdn: authStore.user?.msisdn || ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationSettings = ref({
  emailNotifications: true,
  smsNotifications: false,
  reportAlerts: true,
  weeklyDigest: true
})

function saveProfile() {
  toast.success('Profile updated successfully')
}

function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Passwords do not match')
    return
  }
  toast.success('Password changed successfully')
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}

function saveNotifications() {
  toast.success('Notification preferences saved')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col">
      <NavBar title="Settings" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6 flex justify-center">
        <div class="max-w-3xl w-full space-y-6">
          <!-- Profile Settings -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
            <form @submit.prevent="saveProfile" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  v-model="profileForm.name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  v-model="profileForm.msisdn"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                type="submit"
                class="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>

          <!-- Change Password -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
            <form @submit.prevent="changePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                type="submit"
                class="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all"
              >
                Change Password
              </button>
            </form>
          </div>

          <!-- Notification Settings -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
            <div class="space-y-4">
              <label class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">Email Notifications</p>
                  <p class="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <input
                  v-model="notificationSettings.emailNotifications"
                  type="checkbox"
                  class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </label>
              <label class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">SMS Notifications</p>
                  <p class="text-sm text-gray-500">Receive updates via SMS</p>
                </div>
                <input
                  v-model="notificationSettings.smsNotifications"
                  type="checkbox"
                  class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </label>
              <label class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">Report Alerts</p>
                  <p class="text-sm text-gray-500">Get notified about new reports</p>
                </div>
                <input
                  v-model="notificationSettings.reportAlerts"
                  type="checkbox"
                  class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </label>
              <label class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">Weekly Digest</p>
                  <p class="text-sm text-gray-500">Receive weekly summary</p>
                </div>
                <input
                  v-model="notificationSettings.weeklyDigest"
                  type="checkbox"
                  class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </label>
              <button
                @click="saveNotifications"
                class="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
