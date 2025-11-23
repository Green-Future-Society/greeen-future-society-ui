<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '@/services/auth.service'

const route = useRoute()

const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'No confirmation token provided'
    loading.value = false
    return
  }

  try {
    await authService.confirmEmail(token)
    success.value = true
    error.value = ''

    // Redirect to login after 3 seconds
    setTimeout(() => {
      window.location.href = '/login'
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to confirm email. Please try again.'
    success.value = false
  } finally {
    loading.value = false
  }
})

function goToLogin() {
  window.location.href = '/login'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Email Confirmation</h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Confirming your email...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Email Confirmed!</h3>
        <p class="text-gray-600 mb-4">Your email has been successfully confirmed. Redirecting to login...</p>
        <button
          @click="goToLogin"
          class="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Go to Login
        </button>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmation Failed</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="goToLogin"
          class="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
</template>
