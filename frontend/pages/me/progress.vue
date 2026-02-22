<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const periods = ref([])
const results = ref([])
const topics = ref([])
const selectedPeriod = ref('')
const loading = ref(false)
const errorMsg = ref('')

// Load periods
async function loadPeriods() {
  try {
    const { data } = await $api.get('/api/periods')
    periods.value = data.items || []
    if (periods.value.length > 0) {
      selectedPeriod.value = periods.value[0].id
    }
  } catch (e: any) {
    console.error('Load periods failed:', e)
  }
}

// Load topics
async function loadTopics() {
  try {
    const { data } = await $api.get('/api/topics')
    topics.value = data.items || []
  } catch (e: any) {
    console.error('Load topics failed:', e)
  }
}

// Load results
async function loadResults() {
  if (!selectedPeriod.value) return

  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get('/api/results', {
      params: {
        evaluatee_id: auth.user?.id,
        period_id: selectedPeriod.value
      }
    })
    results.value = data.items || []
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.isLogged || auth.userRole !== 'evaluatee') {
    router.push('/login')
    return
  }
  await loadTopics()
  await loadPeriods()
  await loadResults()
})

// Group results by topic
const progressByTopic = computed(() => {
  const grouped: any = {}
  results.value.forEach(r => {
    const topicId = r.topic_id
    if (!grouped[topicId]) {
      grouped[topicId] = {
        topic_id: topicId,
        topic_name: r.topic_name,
        total: 0,
        submitted: 0,
        draft: 0,
        results: []
      }
    }
    grouped[topicId].total++
    if (r.status === 'submitted') {
      grouped[topicId].submitted++
    } else {
      grouped[topicId].draft++
    }
    grouped[topicId].results.push(r)
  })
  return Object.values(grouped)
})

// Calculate overall statistics
const statistics = computed(() => {
  const total = results.value.length
  const submitted = results.value.filter(r => r.status === 'submitted').length
  const draft = results.value.filter(r => r.status === 'draft').length

  return {
    total,
    submitted,
    draft,
    progress: total > 0 ? Math.round((submitted / total) * 100) : 0
  }
})

// Get progress color
function getProgressColor(progress: number) {
  if (progress === 100) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

// Navigate to view details
function viewTopic(topicId: number) {
  router.push({
    path: '/me/indicators',
    query: {
      topicId,
      periodId: selectedPeriod.value
    }
  })
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6">My Evaluation Progress</h1>

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
          @update:modelValue="loadResults"
        />
      </v-card-text>
    </v-card>

    <!-- Overall Statistics -->
    <v-row v-if="!loading" class="mb-6">
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-gray-500 text-sm mb-2">Total Items</div>
            <div class="text-4xl font-bold text-primary">{{ statistics.total }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-gray-500 text-sm mb-2">Submitted</div>
            <div class="text-4xl font-bold text-green-600">{{ statistics.submitted }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-gray-500 text-sm mb-2">Draft</div>
            <div class="text-4xl font-bold text-orange-600">{{ statistics.draft }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-gray-500 text-sm mb-2">Overall Progress</div>
            <div class="text-4xl font-bold" :class="`text-${getProgressColor(statistics.progress)}-600`">
              {{ statistics.progress }}%
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Progress by Topic -->
    <div v-if="loading" class="flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="progressByTopic.length === 0" class="text-center">
      <v-card>
        <v-card-text class="py-12 text-gray-500">
          No evaluation data available for this period
        </v-card-text>
      </v-card>
    </div>

    <v-card v-else>
      <v-card-title>Progress by Evaluation Topic</v-card-title>
      <v-data-table
        :headers="[
          { title: 'Topic', key: 'topic_name' },
          { title: 'Total', key: 'total' },
          { title: 'Submitted', key: 'submitted' },
          { title: 'Draft', key: 'draft' },
          { title: 'Progress', key: 'progress' },
          { title: 'Actions', key: 'actions', sortable: false }
        ]"
        :items="progressByTopic"
        hide-default-footer
      >
        <template #item.progress="{ item }">
          <div class="flex items-center gap-3 min-w-xs">
            <v-progress-linear
              :value="(item.submitted / item.total) * 100"
              :color="item.submitted === item.total ? 'success' : 'warning'"
              height="8"
              class="flex-1"
            />
            <span class="text-sm font-semibold whitespace-nowrap">
              {{ item.submitted }}/{{ item.total }}
            </span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            size="small"
            variant="tonal"
            @click="viewTopic(item.topic_id)"
          >
            View
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Detail List -->
    <v-card v-if="!loading && progressByTopic.length > 0" class="mt-6">
      <v-card-title>Detailed Results</v-card-title>
      <v-card-text>
        <div class="space-y-6">
          <div v-for="topic in progressByTopic" :key="topic.topic_id">
            <h3 class="font-semibold mb-3">{{ topic.topic_name }}</h3>
            <div class="space-y-2">
              <div
                v-for="result in topic.results"
                :key="result.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <div class="font-semibold">{{ result.indicator_name }}</div>
                  <div class="text-sm text-gray-600">{{ result.indicator_code }}</div>
                </div>
                <div class="flex items-center gap-4">
                  <v-chip
                    :color="result.status === 'submitted' ? 'green' : 'orange'"
                    size="small"
                  >
                    {{ result.status }}
                  </v-chip>
                  <div class="text-right">
                    <div v-if="result.score" class="text-lg font-bold">{{ result.score }}/{{ result.max_score }}</div>
                    <div v-else-if="result.value_yes_no !== null" class="text-lg font-bold">
                      {{ result.value_yes_no ? '✅' : '❌' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>