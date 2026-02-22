<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const adminModules = [
  {
    title: 'Evaluation Topics',
    description: 'Manage evaluation topics and their configurations',
    icon: 'mdi-bookmark-multiple',
    color: 'primary',
    to: '/admin/topics'
  },
  {
    title: 'Indicators',
    description: 'Manage evaluation indicators and evidence types',
    icon: 'mdi-chart-box-outline',
    color: 'info',
    to: '/admin/indicators'
  },
  {
    title: 'Evaluation Periods',
    description: 'Manage evaluation periods and their status',
    icon: 'mdi-calendar-multiple',
    color: 'success',
    to: '/admin/periods'
  },
  {
    title: 'Assignments',
    description: 'Assign evaluators to evaluatees',
    icon: 'mdi-account-multiple',
    color: 'warning',
    to: '/admin/assignments'
  },
  {
    title: 'Evaluation Results',
    description: 'View and analyze evaluation results',
    icon: 'mdi-chart-line',
    color: 'error',
    to: '/admin/results'
  },
  {
    title: 'Progress Monitor',
    description: 'Monitor evaluation progress by department',
    icon: 'mdi-progress-check',
    color: 'secondary',
    to: '/admin/monitor'
  }
]

onMounted(() => {
  if (!auth.isLogged || auth.userRole !== 'admin') {
    router.push('/login')
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-4xl font-bold mb-2">Administration Dashboard</h1>
    <p class="text-gray-600 mb-8">Manage system configuration and monitoring</p>

    <v-row>
      <v-col v-for="module in adminModules" :key="module.to" cols="12" md="6" lg="4">
        <v-card
          class="h-full hover:shadow-lg transition-shadow cursor-pointer"
          @click="$router.push(module.to)"
        >
          <v-card-text class="text-center py-8">
            <v-icon :color="module.color" size="48" class="mb-4">
              {{ module.icon }}
            </v-icon>
            <h3 class="text-xl font-bold mb-2">{{ module.title }}</h3>
            <p class="text-gray-600 text-sm">{{ module.description }}</p>
          </v-card-text>
          <v-card-actions class="justify-center pb-4">
            <v-btn :color="module.color" variant="tonal">
              Open
              <v-icon right>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
