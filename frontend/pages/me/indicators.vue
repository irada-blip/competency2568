<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const topicId = computed(() => route.query.topicId)
const periodId = computed(() => route.query.periodId)

const topic = ref(null)
const indicators = ref([])
const results = ref([])
const attachments = ref([])
const loading = ref(false)
const errorMsg = ref('')
const selectedIndicator = ref(null)
const showDialog = ref(false)

// Load data
async function loadData() {
  loading.value = true
  errorMsg.value = ''
  try {
    // Load topic
    if (topicId.value) {
      const topicRes = await $api.get(`/api/topics/${topicId.value}`)
      topic.value = topicRes.data.data || topicRes.data
    }

    // Load indicators for this topic
    const indicatorsRes = await $api.get('/api/indicators', {
      params: { topic_id: topicId.value }
    })
    indicators.value = indicatorsRes.data.items || []

    // Load results for this evaluatee in this period
    const resultsRes = await $api.get('/api/results', {
      params: {
        evaluatee_id: auth.user?.id,
        period_id: periodId.value,
        topic_id: topicId.value
      }
    })
    results.value = resultsRes.data.items || []

    // Load attachments
    const attachmentsRes = await $api.get('/api/attachments', {
      params: {
        evaluatee_id: auth.user?.id,
        period_id: periodId.value
      }
    })
    attachments.value = attachmentsRes.data.items || []
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
  if (!topicId.value || !periodId.value) {
    errorMsg.value = 'Invalid parameters'
    return
  }
  await loadData()
})

// Get result for indicator
function getResult(indicatorId: number) {
  return results.value.find(r => r.indicator_id === indicatorId)
}

// Get attachments for indicator
function getIndicatorAttachments(indicatorId: number) {
  return attachments.value.filter(a => a.indicator_id === indicatorId)
}

// Open indicator detail
function openIndicator(indicator: any) {
  selectedIndicator.value = indicator
  showDialog.value = true
}

// Get score color
function getScoreColor(score: number) {
  if (score >= 3.5) return 'success'
  if (score >= 2.5) return 'warning'
  return 'error'
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">{{ topic?.title_th || 'Indicators' }}</h1>
        <p class="text-gray-600">Evaluation Period: #{{ periodId }}</p>
      </div>
      <NuxtLink to="/me/evaluation">
        <v-btn variant="tonal">Back to Results</v-btn>
      </NuxtLink>
    </div>

    <v-alert v-if="errorMsg" type="error" closable class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <div v-if="loading" class="flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <v-row>
        <v-col v-for="indicator in indicators" :key="indicator.id" cols="12" md="6" lg="4">
          <v-card
            class="h-full cursor-pointer hover:shadow-lg transition-shadow"
            @click="openIndicator(indicator)"
          >
            <v-card-title>
              <div class="text-lg">{{ indicator.code }}</div>
            </v-card-title>

            <v-card-text class="space-y-4">
              <h3 class="font-semibold text-base">{{ indicator.name_th }}</h3>

              <p class="text-sm text-gray-600">{{ indicator.description }}</p>

              <!-- Result Card -->
              <div v-if="getResult(indicator.id)" class="bg-blue-50 p-4 rounded">
                <div class="text-sm text-gray-600 mb-2">Evaluation Result</div>
                <div v-if="indicator.type === 'score_1_4'" class="flex items-center gap-4">
                  <div class="text-4xl font-bold" :class="getScoreColor(getResult(indicator.id).score)">
                    {{ getResult(indicator.id).score }}
                  </div>
                  <div class="text-xs text-gray-600">out of 4</div>
                </div>
                <div v-else-if="indicator.type === 'yes_no'" class="text-2xl font-bold">
                  {{ getResult(indicator.id).value_yes_no ? '✅ Yes' : '❌ No' }}
                </div>
              </div>

              <!-- Attachments -->
              <div v-if="getIndicatorAttachments(indicator.id).length > 0">
                <div class="text-sm font-semibold mb-2">Evidence Uploaded</div>
                <div class="space-y-2">
                  <div
                    v-for="att in getIndicatorAttachments(indicator.id)"
                    :key="att.id"
                    class="text-xs text-blue-600 flex items-center gap-2"
                  >
                    <v-icon size="16">mdi-file</v-icon>
                    <a :href="`${att.storage_path}`" target="_blank" class="hover:underline">
                      {{ att.file_name }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Type Badge -->
              <v-chip size="small" variant="tonal">{{ indicator.type }}</v-chip>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn icon="mdi-chevron-right" />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Indicator Detail Dialog -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card v-if="selectedIndicator">
        <v-card-title>{{ selectedIndicator.code }} - {{ selectedIndicator.name_th }}</v-card-title>
        <v-card-text class="py-6 space-y-4">
          <!-- Description -->
          <div>
            <h4 class="font-semibold mb-2">Description</h4>
            <p class="text-gray-600">{{ selectedIndicator.description }}</p>
          </div>

          <!-- Type -->
          <div>
            <h4 class="font-semibold mb-2">Type</h4>
            <v-chip>{{ selectedIndicator.type }}</v-chip>
          </div>

          <!-- Evaluation Result -->
          <div v-if="getResult(selectedIndicator.id)">
            <h4 class="font-semibold mb-2">Evaluation Result</h4>
            <v-card class="bg-gray-50">
              <v-card-text>
                <div v-if="selectedIndicator.type === 'score_1_4'" class="text-center">
                  <div class="text-5xl font-bold text-primary">
                    {{ getResult(selectedIndicator.id).score }}
                  </div>
                  <div class="text-gray-600">out of {{ selectedIndicator.max_score }}</div>
                </div>
                <div v-else-if="selectedIndicator.type === 'yes_no'" class="text-center">
                  <div class="text-3xl font-bold">
                    {{ getResult(selectedIndicator.id).value_yes_no ? '✅ YES' : '❌ NO' }}
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <div v-if="getResult(selectedIndicator.id).notes" class="mt-4">
              <h4 class="font-semibold mb-2">Notes</h4>
              <p class="text-gray-700 bg-gray-50 p-3 rounded">
                {{ getResult(selectedIndicator.id).notes }}
              </p>
            </div>
          </div>

          <!-- Evidence -->
          <div>
            <h4 class="font-semibold mb-2">Evidence Uploaded</h4>
            <div v-if="getIndicatorAttachments(selectedIndicator.id).length === 0" class="text-gray-500 text-sm">
              No evidence uploaded
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="att in getIndicatorAttachments(selectedIndicator.id)"
                :key="att.id"
                class="flex items-center gap-2 p-2 bg-gray-50 rounded"
              >
                <v-icon size="20" color="primary">mdi-file</v-icon>
                <div class="flex-1">
                  <a :href="`${att.storage_path}`" target="_blank" class="text-blue-600 hover:underline">
                    {{ att.file_name }}
                  </a>
                  <div class="text-xs text-gray-500">
                    {{ new Date(att.created_at).toLocaleDateString() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>