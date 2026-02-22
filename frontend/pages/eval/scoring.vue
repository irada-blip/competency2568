<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const assignmentId = computed(() => route.query.assignmentId)
const evaluateeId = computed(() => route.query.evaluateeId)
const periodId = computed(() => route.query.periodId)

const topics = ref([])
const indicators = ref([])
const results = ref({})
const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Load data
async function loadData() {
  loading.value = true
  try {
    // Load topics
    const topicsRes = await $api.get('/api/topics')
    topics.value = topicsRes.data.items || []

    // Load indicators
    const indicatorsRes = await $api.get('/api/indicators')
    indicators.value = indicatorsRes.data.items || []

    // Load existing results
    const resultsRes = await $api.get('/api/results', {
      params: {
        period_id: periodId.value,
        evaluatee_id: evaluateeId.value,
        evaluator_id: auth.user?.id
      }
    })

    // Map results by indicator_id for easy lookup
    const resultsList = resultsRes.data.items || []
    resultsList.forEach(r => {
      results.value[r.indicator_id] = {
        id: r.id,
        score: r.score,
        value_yes_no: r.value_yes_no,
        notes: r.notes,
        status: r.status
      }
    })
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!auth.isLogged || auth.userRole !== 'evaluator') {
    router.push('/login')
    return
  }
  if (!assignmentId.value || !evaluateeId.value || !periodId.value) {
    errorMsg.value = 'Invalid assignment parameters'
    return
  }
  loadData()
})

// Get topic indicators
function getTopicIndicators(topicId: number) {
  return indicators.value.filter(ind => ind.topic_id === topicId)
}

// Get result for indicator
function getResult(indicatorId: number) {
  return results.value[indicatorId] || {
    score: null,
    value_yes_no: null,
    notes: ''
  }
}

// Initialize result if not exists
function ensureResult(indicatorId: number) {
  if (!results.value[indicatorId]) {
    results.value[indicatorId] = {
      score: null,
      value_yes_no: null,
      notes: '',
      status: 'draft'
    }
  }
}

// Save all results
async function saveResults() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // Save each result
    const savePromises = Object.entries(results.value).map(async ([indicatorId, resultData]: any) => {
      if (!resultData) return

      const payload = {
        period_id: parseInt(periodId.value as string),
        evaluatee_id: parseInt(evaluateeId.value as string),
        evaluator_id: auth.user?.id,
        topic_id: indicators.value.find(i => i.id === parseInt(indicatorId))?.topic_id,
        indicator_id: parseInt(indicatorId),
        score: resultData.score !== null ? parseFloat(resultData.score) : null,
        value_yes_no: resultData.value_yes_no,
        notes: resultData.notes || null,
        status: resultData.status || 'draft'
      }

      if (resultData.id) {
        // Update existing
        await $api.put(`/api/results/${resultData.id}`, payload)
      } else {
        // Create new
        await $api.post('/api/results', payload)
      }
    })

    await Promise.all(savePromises)
    successMsg.value = 'Evaluation saved successfully!'
    setTimeout(() => {
      router.push('/eval/tasks')
    }, 1500)
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

// Submit results
async function submitResults() {
  if (confirm('Submit evaluation? This cannot be easily reversed.')) {
    saving.value = true
    errorMsg.value = ''

    try {
      // Update all results to submitted status
      const updatePromises = Object.entries(results.value).map(async ([indicatorId, resultData]: any) => {
        if (resultData?.id) {
          await $api.put(`/api/results/${resultData.id}`, {
            status: 'submitted'
          })
        }
      })

      await Promise.all(updatePromises)
      successMsg.value = 'Evaluation submitted successfully!'
      setTimeout(() => {
        router.push('/eval/tasks')
      }, 1500)
    } catch (e: any) {
      errorMsg.value = e.response?.data?.message || e.message || 'Submit failed'
    } finally {
      saving.value = false
    }
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">Evaluation Scoring</h1>
        <p class="text-gray-600">Evaluatee ID: {{ evaluateeId }}</p>
      </div>
      <NuxtLink to="/eval/tasks">
        <v-btn variant="tonal">Back to Tasks</v-btn>
      </NuxtLink>
    </div>

    <v-alert v-if="errorMsg" type="error" closable class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <v-alert v-if="successMsg" type="success" closable class="mb-4">
      {{ successMsg }}
    </v-alert>

    <div v-if="loading" class="flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <!-- Scoring Grid by Topic -->
      <v-card v-for="topic in topics" :key="topic.id" class="mb-6">
        <v-card-title class="bg-primary text-white">
          {{ topic.title_th }}
        </v-card-title>

        <v-data-table
          :headers="[
            { title: 'Indicator', key: 'name_th' },
            { title: 'Type', key: 'type' },
            { title: 'Score/Value', key: 'score' },
            { title: 'Notes', key: 'notes' }
          ]"
          :items="getTopicIndicators(topic.id)"
          hide-default-footer
          class="elevation-0"
        >
          <template #item.name_th="{ item }">
            <div class="min-w-xs">
              <div class="font-semibold">{{ item.code }}</div>
              <div class="text-sm text-gray-600">{{ item.name_th }}</div>
            </div>
          </template>

          <template #item.type="{ item }">
            <v-chip size="small">{{ item.type }}</v-chip>
          </template>

          <template #item.score="{ item }">
            <div class="min-w-min">
              <template v-if="item.type === 'score_1_4'">
                <v-select
                  v-model="getResult(item.id).score"
                  :items="[1, 2, 3, 4]"
                  density="compact"
                  outlined
                  hide-details
                  class="w-20"
                  @update:modelValue="ensureResult(item.id)"
                />
              </template>
              <template v-else-if="item.type === 'yes_no'">
                <v-select
                  v-model="getResult(item.id).value_yes_no"
                  :items="[
                    { title: 'Yes', value: true },
                    { title: 'No', value: false }
                  ]"
                  density="compact"
                  outlined
                  hide-details
                  class="w-28"
                  @update:modelValue="ensureResult(item.id)"
                />
              </template>
              <template v-else>
                <span class="text-gray-500">N/A</span>
              </template>
            </div>
          </template>

          <template #item.notes="{ item }">
            <v-text-field
              v-model="getResult(item.id).notes"
              density="compact"
              outlined
              hide-details
              placeholder="Notes..."
              class="min-w-xs"
              @update:modelValue="ensureResult(item.id)"
            />
          </template>
        </v-data-table>
      </v-card>

      <!-- Action Buttons -->
      <div class="flex gap-4 mt-8">
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          :loading="saving"
          @click="saveResults"
        >
          <v-icon left>mdi-content-save</v-icon>
          Save as Draft
        </v-btn>
        <v-btn
          color="success"
          variant="elevated"
          size="large"
          :loading="saving"
          @click="submitResults"
        >
          <v-icon left>mdi-check-circle</v-icon>
          Submit Evaluation
        </v-btn>
        <NuxtLink to="/eval/tasks">
          <v-btn variant="tonal" size="large">Cancel</v-btn>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
