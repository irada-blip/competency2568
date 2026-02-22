<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const results = ref([])
const periods = ref([])
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
  } catch (e: any) {
    console.error('Load periods failed:', e)
  }
}

// Load results
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params: any = {
      evaluator_id: auth.user?.id,
      page: options.value.page,
      itemsPerPage: options.value.itemsPerPage
    }

    if (selectedPeriod.value) {
      params.period_id = selectedPeriod.value
    }

    const { data } = await $api.get('/api/results', { params })
    results.value = data.items || []
    total.value = data.total || 0
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
  await load()
})

watch([options, selectedPeriod], load, { deep: true })

// Group results by evaluatee
const groupedResults = computed(() => {
  const grouped: any = {}
  results.value.forEach(r => {
    const key = r.evaluatee_id
    if (!grouped[key]) {
      grouped[key] = {
        evaluatee_id: r.evaluatee_id,
        evaluatee_name: r.evaluatee_name,
        period_name: r.period_name,
        results: []
      }
    }
    grouped[key].results.push(r)
  })
  return Object.values(grouped)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Evaluation Results</h1>
      <NuxtLink to="/eval/tasks">
        <v-btn variant="tonal">
          <v-icon left>mdi-plus</v-icon>
          New Evaluation
        </v-btn>
      </NuxtLink>
    </div>

    <v-alert v-if="errorMsg" type="error" closable class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <!-- Filters -->
    <v-card class="mb-6">
      <v-card-text>
        <v-select
          v-model="selectedPeriod"
          label="Filter by Period"
          :items="periods"
          item-title="name_th"
          item-value="id"
          clearable
          outlined
          density="comfortable"
        />
      </v-card-text>
    </v-card>

    <!-- Results List -->
    <div v-if="loading" class="flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="groupedResults.length === 0" class="text-center py-12">
      <v-card>
        <v-card-text class="text-gray-500">
          No evaluation results found
        </v-card-text>
      </v-card>
    </div>

    <template v-else>
      <v-card v-for="group in groupedResults" :key="group.evaluatee_id" class="mb-6">
        <v-card-title class="bg-primary text-white">
          {{ group.evaluatee_name }}
          <v-spacer />
          <span class="text-sm">{{ group.period_name }}</span>
        </v-card-title>

        <v-data-table
          :headers="[
            { title: 'Topic', key: 'topic_name' },
            { title: 'Indicator', key: 'indicator_name' },
            { title: 'Score', key: 'score' },
            { title: 'Yes/No', key: 'value_yes_no' },
            { title: 'Status', key: 'status' },
            { title: 'Notes', key: 'notes' }
          ]"
          :items="group.results"
          hide-default-footer
          density="compact"
        >
          <template #item.value_yes_no="{ item }">
            <span v-if="item.value_yes_no !== null">
              {{ item.value_yes_no ? 'Yes' : 'No' }}
            </span>
            <span v-else>-</span>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="item.status === 'submitted' ? 'green' : 'orange'" size="small">
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.notes="{ item }">
            <span class="text-sm text-gray-600">{{ item.notes || '-' }}</span>
          </template>
        </v-data-table>
      </v-card>
    </template>
  </div>
</template>
