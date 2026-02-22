<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const periods = ref([])
const progressData = ref([])
const selectedPeriod = ref('')
const loading = ref(false)
const errorMsg = ref('')

// Load periods
async function loadPeriods() {
  try {
    const { data } = await $api.get('/api/periods', {
      params: { is_active: 1 }
    })
    periods.value = data.items || []
    if (periods.value.length > 0) {
      selectedPeriod.value = periods.value[0].id
    }
  } catch (e: any) {
    console.error('Load periods failed:', e)
  }
}

// Load progress data
async function loadProgress() {
  if (!selectedPeriod.value) return

  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get('/api/task5/reports/progress', {
      params: { period_id: selectedPeriod.value }
    })
    progressData.value = data.data || data || []
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.isLogged || auth.userRole !== 'admin') {
    router.push('/login')
    return
  }
  await loadPeriods()
  await loadProgress()
})

// Compute statistics
const statistics = computed(() => {
  if (!progressData.value.length) return null

  const total = progressData.value.reduce((sum, d) => sum + (d.total || 0), 0)
  const submitted = progressData.value.reduce((sum, d) => sum + (d.submitted || 0), 0)
  const avgProgress = total > 0 ? Math.round((submitted / total) * 100) : 0

  return {
    total,
    submitted,
    avgProgress,
    departments: progressData.value.length
  }
})

// Get progress color
function getProgressColor(progress: number) {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

// Get progress text
function getProgressText(progress: number) {
  if (progress >= 80) return 'On Track'
  if (progress >= 50) return 'In Progress'
  return 'Behind'
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6">Evaluation Progress Monitor</h1>

    <v-alert v-if="errorMsg" type="error" closable class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <!-- Period Selector -->
    <v-card class="mb-6">
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <v-select
            v-model="selectedPeriod"
            label="Select Period"
            :items="periods"
            item-title="name_th"
            item-value="id"
            outlined
            density="comfortable"
            @update:modelValue="loadProgress"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Statistics -->
    <v-row v-if="statistics" class="mb-6">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-gray-500">Total Items</div>
            <div class="text-4xl font-bold">{{ statistics.total }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-gray-500">Submitted</div>
            <div class="text-4xl font-bold text-green-600">{{ statistics.submitted }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-gray-500">Departments</div>
            <div class="text-4xl font-bold">{{ statistics.departments }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-gray-500">Overall Progress</div>
            <div class="text-4xl font-bold" :class="statistics.avgProgress >= 80 ? 'text-green-600' : statistics.avgProgress >= 50 ? 'text-orange-600' : 'text-red-600'">
              {{ statistics.avgProgress }}%
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Progress by Department -->
    <v-card v-if="!loading && progressData.length > 0">
      <v-card-title>Progress by Department</v-card-title>
      <v-card-text>
        <div class="space-y-6">
          <div v-for="dept in progressData" :key="dept.dept_id" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold">{{ dept.dept_name }}</span>
              <span class="text-sm text-gray-600">
                {{ dept.submitted }} / {{ dept.total }} submitted
              </span>
            </div>
            <v-progress-linear
              :value="dept.progress"
              :color="getProgressColor(dept.progress)"
              height="24"
              striped
            >
              <template #default="{ value }">
                <span class="text-xs font-bold text-white">
                  {{ Math.round(value) }}%
                </span>
              </template>
            </v-progress-linear>
            <div class="text-xs" :class="{
              'text-green-600': dept.progress >= 80,
              'text-orange-600': dept.progress >= 50 && dept.progress < 80,
              'text-red-600': dept.progress < 50
            }">
              {{ getProgressText(dept.progress) }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading or Empty State -->
    <v-card v-else-if="loading">
      <v-card-text class="text-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </v-card-text>
    </v-card>
    <v-card v-else>
      <v-card-text class="text-center py-12 text-gray-500">
        No data available for the selected period
      </v-card-text>
    </v-card>
  </div>
</template>
