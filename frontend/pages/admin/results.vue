<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const items = ref([])
const periods = ref([])
const topics = ref([])
const total = ref(0)
const loading = ref(false)
const errorMsg = ref('')

// Filters
const filters = ref({
  period_id: '',
  topic_id: '',
  status: ''
})

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'id', order: 'desc' }]
})

// Load results
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params: any = {
      page: options.value.page,
      itemsPerPage: options.value.itemsPerPage
    }
    if (filters.value.period_id) params.period_id = filters.value.period_id
    if (filters.value.topic_id) params.topic_id = filters.value.topic_id
    if (filters.value.status) params.status = filters.value.status

    const { data } = await $api.get('/api/results', { params })
    items.value = data.items || []
    total.value = data.total || 0
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

// Load related data
async function loadRelatedData() {
  try {
    const [periodsRes, topicsRes] = await Promise.all([
      $api.get('/api/periods'),
      $api.get('/api/topics')
    ])
    periods.value = periodsRes.data.items || []
    topics.value = topicsRes.data.items || []
  } catch (e: any) {
    console.error('Load related data failed:', e)
  }
}

onMounted(async () => {
  if (!auth.isLogged || auth.userRole !== 'admin') {
    router.push('/login')
    return
  }
  await loadRelatedData()
  await load()
})

watch(options, load, { deep: true })
watch(filters, () => {
  options.value.page = 1
  load()
}, { deep: true })

// Export to CSV
function exportToCSV() {
  if (!items.value.length) {
    alert('No data to export')
    return
  }

  const headers = ['Period', 'Evaluator', 'Evaluatee', 'Topic', 'Indicator', 'Score', 'Yes/No', 'Status']
  const rows = items.value.map(item => [
    item.period_name,
    item.evaluator_name,
    item.evaluatee_name,
    item.topic_name,
    item.indicator_name,
    item.score || '',
    item.value_yes_no !== null ? (item.value_yes_no ? 'Yes' : 'No') : '',
    item.status
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `evaluation-results-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Evaluation Results</h1>
      <v-btn color="primary" @click="exportToCSV">
        <v-icon left>mdi-download</v-icon>
        Export CSV
      </v-btn>
    </div>

    <v-alert v-if="errorMsg" type="error" closable class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <!-- Filters -->
    <v-card class="mb-6">
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <v-select
            v-model="filters.period_id"
            label="Period"
            :items="periods"
            item-title="name_th"
            item-value="id"
            clearable
            outlined
            density="comfortable"
          />
          <v-select
            v-model="filters.topic_id"
            label="Topic"
            :items="topics"
            item-title="title_th"
            item-value="id"
            clearable
            outlined
            density="comfortable"
          />
          <v-select
            v-model="filters.status"
            label="Status"
            :items="['draft', 'submitted']"
            clearable
            outlined
            density="comfortable"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-data-table-server
      v-model:page="options.page"
      v-model:itemsPerPage="options.itemsPerPage"
      :headers="[
        { title: 'Period', key: 'period_name' },
        { title: 'Evaluator', key: 'evaluator_name' },
        { title: 'Evaluatee', key: 'evaluatee_name' },
        { title: 'Topic', key: 'topic_name' },
        { title: 'Indicator', key: 'indicator_name' },
        { title: 'Score', key: 'score' },
        { title: 'Yes/No', key: 'value_yes_no' },
        { title: 'Status', key: 'status' }
      ]"
      :items="items"
      :items-length="total"
      :loading="loading"
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
    </v-data-table-server>
  </div>
</template>
