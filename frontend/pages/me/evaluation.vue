<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const results = ref([])
const periods = ref([])
const topics = ref([])
const total = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const selectedPeriod = ref('')

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'id', order: 'desc' }]
})

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
async function load() {
  if (!selectedPeriod.value) return

  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get('/api/results', {
      params: {
        evaluatee_id: auth.user?.id,
        period_id: selectedPeriod.value,
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage
      }
    })
    results.value = data.items || []
    total.value = data.total || 0
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
  await loadPeriods()
  await loadTopics()
  await load()
})

watch([options, selectedPeriod], load, { deep: true })

// Group results by topic
const groupedResults = computed(() => {
  const grouped: any = {}
  results.value.forEach(r => {
    const topicId = r.topic_id
    if (!grouped[topicId]) {
      grouped[topicId] = {
        topic_id: topicId,
        topic_name: r.topic_name,
        results: []
      }
    }
    grouped[topicId].results.push(r)
  })
  return Object.values(grouped)
})

// Calculate average score for topic
function getTopicAverage(topicId: number) {
  const topicResults = results.value.filter(r => r.topic_id === topicId)
  if (topicResults.length === 0) return 0

  const scores = topicResults
    .filter(r => r.score !== null)
    .map(r => parseFloat(r.score))

  if (scores.length === 0) return 0
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
}

// Get topic status
function getTopicStatus(topicId: number) {
  const topicResults = results.value.filter(r => r.topic_id === topicId)
  const submitted = topicResults.filter(r => r.status === 'submitted').length
  const total = topicResults.length

  if (total === 0) return 'pending'
  if (submitted === total) return 'complete'
  if (submitted > 0) return 'partial'
  return 'draft'
}

function getStatusColor(status: string) {
  switch (status) {
    case 'complete': return 'success'
    case 'partial': return 'warning'
    case 'draft': return 'info'
    default: return 'default'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">My Evaluation Results</h1>
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
        />
      </v-card-text>
    </v-card>

    <!-- Results by Topic -->
    <div v-if="loading" class="flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="groupedResults.length === 0" class="text-center">
      <v-card>
        <v-card-text class="py-12 text-gray-500">
          No evaluation results available for this period
        </v-card-text>
      </v-card>
    </div>

    <template v-else>
      <v-row>
        <v-col v-for="group in groupedResults" :key="group.topic_id" cols="12" md="6" lg="4">
          <v-card>
            <v-card-title>{{ group.topic_name }}</v-card-title>
            <v-card-text>
              <div class="space-y-4">
                <!-- Average Score -->
                <div class="bg-gray-50 p-4 rounded">
                  <div class="text-sm text-gray-600">Average Score</div>
                  <div class="text-3xl font-bold text-primary">
                    {{ getTopicAverage(group.topic_id) }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">out of 4.0</div>
                </div>

                <!-- Status Badge -->
                <div>
                  <v-chip
                    :color="getStatusColor(getTopicStatus(group.topic_id))"
                    class="w-full justify-center"
                  >
                    {{ getTopicStatus(group.topic_id).toUpperCase() }}
                  </v-chip>
                </div>

                <!-- Result Count -->
                <div class="text-sm text-gray-600">
                  {{ group.results.length }} Indicator{{ group.results.length !== 1 ? 's' : '' }}
                </div>

                <!-- Progress -->
                <v-progress-linear
                  :value="(group.results.filter(r => r.status === 'submitted').length / group.results.length) * 100"
                  color="success"
                  height="8"
                />
              </div>
            </v-card-text>

            <v-card-actions>
              <NuxtLink
                :to="`/me/indicators?topicId=${group.topic_id}&periodId=${selectedPeriod}`"
                class="w-full no-underline"
              >
                <v-btn variant="tonal" class="w-full">View Details</v-btn>
              </NuxtLink>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<style scoped>
.no-underline {
  text-decoration: none;
  color: inherit;
}
</style>
