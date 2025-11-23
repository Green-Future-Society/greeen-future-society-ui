import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegistrationRequest } from '@/types'
import { authService } from '@/services/auth.service'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.userRole === 'ADMIN')
  const userFullName = computed(() => user.value?.name || 'User')

  // Initialize from localStorage
  function initialize() {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        logout()
      }
    }
  }

  // Actions
  async function login(credentials: LoginRequest) {
    loading.value = true
    try {
      const response = await authService.login(credentials)

      token.value = response.token
      user.value = response.user

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      toast.success(`Welcome back, ${response.user.name}!`)
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegistrationRequest) {
    loading.value = true
    try {
      const response = await authService.register(data)
      toast.success(response.message || 'Registration successful!')
      return response
    } catch (error: any) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(msisdn: string) {
    loading.value = true
    try {
      const response = await authService.resetPassword(msisdn)
      toast.success(response.message || 'Password reset email sent!')
      return response
    } catch (error: any) {
      throw error
    } finally {
      loading.value = false
    }
  }

  function logout() {
    // Clear all storage
    localStorage.clear()
    sessionStorage.clear()

    // Clear state
    user.value = null
    token.value = null

    // Redirect to login
    window.location.href = '/login'
  }

  return {
    // State
    user,
    token,
    loading,
    // Getters
    isAuthenticated,
    isAdmin,
    userFullName,
    // Actions
    initialize,
    login,
    register,
    resetPassword,
    logout
  }
})
