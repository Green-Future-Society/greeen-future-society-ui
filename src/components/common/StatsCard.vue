<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon?: string
  trend?: number
  color?: 'green' | 'blue' | 'yellow' | 'red'
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900 mt-1">{{ value }}</p>
        <div v-if="trend !== undefined" class="flex items-center mt-2">
          <span
            :class="[
              'text-sm font-medium',
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ trend >= 0 ? '+' : '' }}{{ trend }}%
          </span>
          <span class="text-gray-400 text-sm ml-1">vs last month</span>
        </div>
      </div>
      <div
        :class="[
          'w-12 h-12 rounded-lg flex items-center justify-center',
          color === 'green' ? 'bg-green-100' : '',
          color === 'blue' ? 'bg-blue-100' : '',
          color === 'yellow' ? 'bg-yellow-100' : '',
          color === 'red' ? 'bg-red-100' : '',
          !color ? 'bg-gray-100' : ''
        ]"
      >
        <!-- Report Icon -->
        <svg v-if="icon === 'report'" :class="['w-6 h-6', color === 'green' ? 'text-green-600' : 'text-gray-600']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <!-- Users Icon -->
        <svg v-if="icon === 'users'" :class="['w-6 h-6', color === 'blue' ? 'text-blue-600' : 'text-gray-600']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <!-- Alert Icon -->
        <svg v-if="icon === 'alert'" :class="['w-6 h-6', color === 'yellow' ? 'text-yellow-600' : 'text-gray-600']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <!-- Check Icon -->
        <svg v-if="icon === 'check'" :class="['w-6 h-6', color === 'green' ? 'text-green-600' : 'text-gray-600']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <!-- Chart Icon -->
        <svg v-if="icon === 'chart'" :class="['w-6 h-6', color === 'green' ? 'text-green-600' : 'text-gray-600']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
    </div>
  </div>
</template>
