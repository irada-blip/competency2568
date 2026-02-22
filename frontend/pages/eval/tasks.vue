<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const assignments = ref([])
const periods = ref([])
const loading = ref(false)
const errorMsg = ref('')
const selectedPeriod = ref('')

// Load periods
async function loadPeriods() {
  try {
    const { data } = await $api.get('/api/periods', {
      params: { is_active: 1 }
    })
    periods.value = data.items || []
    if (periods.value.length > 0) {
      selectedPeriod.value = periods.value[0].id
      await loadAssignments()
    }
  } catch (e: any) {
    console.error('Load periods failed:', e)
  }
}

// Load assignments for this evaluator
async function loadAssignments() {
  if (!selectedPeriod.value) return

  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get('/api/assignments', {
      params: {
        period_id: selectedPeriod.value,
        evaluator_id: auth.user?.id
      }
    })
    assignments.value = data.items || []
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.isLogged || auth.userRole !== 'evaluator') {
    router.push('/login')
    return
  }
  await loadPeriods()
})

// Navigate to scoring page
function startScoring(assignment: any) {
  router.push({
    path: '/eval/scoring',
    query: {
      assignmentId: assignment.id,
      evaluateeId: assignment.evaluatee_id,
      periodId: assignment.period_id
    }
  })
}

// Get status summary
function getStatusSummary(assignment: any) {
  return `Evaluating ${assignment.evaluatee_name}`
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Assigned Evaluation Tasks</h1>
    </div>

    <v-alert v-if="errorMsg" type="error" closable class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <!-- Period Selector -->
    <v-card class="mb-6">
      <v-card-text>
        <v-select
          v-model="selectedPeriod"
          label="Select Evaluation Period"
          :items="periods"
          item-title="name_th"
          item-value="id"
          outlined
          density="comfortable"
          @update:modelValue="loadAssignments"
        />
      </v-card-text>
    </v-card>

    <!-- Assignments List -->
    <v-row>
      <v-col v-if="loading" cols="12">
        <div class="flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </v-col>

      <v-col v-else-if="assignments.length === 0" cols="12">
        <v-card>
          <v-card-text class="text-center py-12 text-gray-500">
            No assignments found for this period
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-for="assignment in assignments" :key="assignment.id" cols="12" md="6" lg="4">
        <v-card class="h-full flex flex-col">
          <v-card-text class="flex-grow">
            <div class="mb-4">
              <h3 class="text-xl font-bold">{{ assignment.evaluatee_name }}</h3>
              <p class="text-sm text-gray-600">{{ assignment.evaluatee_email }}</p>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Department:</span>
                <span class="font-semibold">{{ assignment.dept_name || 'N/A' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Period:</span>
                <span class="font-semibold">{{ assignment.period_name }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Assigned:</span>
                <span class="font-semibold">{{ new Date(assignment.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              variant="elevated"
              @click="startScoring(assignment)"
            >
              Start Evaluation
              <v-icon right>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
