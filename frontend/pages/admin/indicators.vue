<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const items = ref([])
const topics = ref([])
const evidenceTypes = ref([])
const total = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const showDialog = ref(false)
const isEditing = ref(false)
const selectedItem = ref(null)

// Form fields
const form = ref({
  topic_id: '',
  code: '',
  name_th: '',
  description: '',
  type: 'score_1_4',
  weight: 1.0,
  min_score: 1,
  max_score: 4,
  active: true,
  evidence_type_ids: []
})

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'id', order: 'desc' }]
})

// Load indicators
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get('/api/indicators', {
      params: {
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage
      }
    })
    items.value = data.items || []
    total.value = data.total || 0
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
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

// Load evidence types
async function loadEvidenceTypes() {
  try {
    const { data } = await $api.get('/api/indicators/evidence-types')
    evidenceTypes.value = data || []
  } catch (e: any) {
    console.error('Load evidence types failed:', e)
  }
}

onMounted(async () => {
  if (!auth.isLogged || auth.userRole !== 'admin') {
    router.push('/login')
    return
  }
  await load()
  await loadTopics()
  await loadEvidenceTypes()
})

watch(options, load, { deep: true })

// Open dialog for create
function openCreate() {
  isEditing.value = false
  selectedItem.value = null
  form.value = {
    topic_id: '',
    code: '',
    name_th: '',
    description: '',
    type: 'score_1_4',
    weight: 1.0,
    min_score: 1,
    max_score: 4,
    active: true,
    evidence_type_ids: []
  }
  showDialog.value = true
}

// Open dialog for edit
function openEdit(item: any) {
  isEditing.value = true
  selectedItem.value = item
  form.value = {
    topic_id: item.topic_id,
    code: item.code,
    name_th: item.name_th,
    description: item.description || '',
    type: item.type || 'score_1_4',
    weight: item.weight || 1.0,
    min_score: item.min_score || 1,
    max_score: item.max_score || 4,
    active: item.active === 1,
    evidence_type_ids: item.evidence_types?.map((e: any) => e.id) || []
  }
  showDialog.value = true
}

// Save (create or update)
async function save() {
  try {
    if (isEditing.value && selectedItem.value) {
      await $api.put(`/api/indicators/${selectedItem.value.id}`, form.value)
    } else {
      await $api.post('/api/indicators', form.value)
    }
    errorMsg.value = ''
    showDialog.value = false
    await load()
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Save failed'
  }
}

// Delete
async function deleteItem(item: any) {
  if (confirm(`Delete indicator "${item.name_th}"?`)) {
    try {
      await $api.delete(`/api/indicators/${item.id}`)
      await load()
    } catch (e: any) {
      errorMsg.value = e.response?.data?.message || e.message || 'Delete failed'
    }
  }
}

// Get topic name
function getTopicName(topicId: number) {
  return topics.value.find(t => t.id === topicId)?.title_th || 'N/A'
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Indicators</h1>
      <v-btn color="primary" @click="openCreate">
        <v-icon left>mdi-plus</v-icon>
        New Indicator
      </v-btn>
    </div>

    <v-alert v-if="errorMsg" type="error" closable class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <v-data-table-server
      v-model:page="options.page"
      v-model:itemsPerPage="options.itemsPerPage"
      :headers="[
        { title: 'Code', key: 'code' },
        { title: 'Name (TH)', key: 'name_th' },
        { title: 'Topic', key: 'topic_id' },
        { title: 'Type', key: 'type' },
        { title: 'Weight', key: 'weight' },
        { title: 'Active', key: 'active' },
        { title: 'Actions', key: 'actions', sortable: false }
      ]"
      :items="items"
      :items-length="total"
      :loading="loading"
    >
      <template #item.topic_id="{ item }">
        {{ getTopicName(item.topic_id) }}
      </template>

      <template #item.type="{ item }">
        <v-chip :color="item.type === 'score_1_4' ? 'primary' : 'info'" size="small">
          {{ item.type }}
        </v-chip>
      </template>

      <template #item.active="{ item }">
        <v-chip :color="item.active ? 'green' : 'red'" size="small">
          {{ item.active ? 'Active' : 'Inactive' }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <div class="flex gap-2">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="tonal"
            color="blue"
            @click="openEdit(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="tonal"
            color="red"
            @click="deleteItem(item)"
          />
        </div>
      </template>
    </v-data-table-server>

    <!-- Dialog for Create/Edit -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Edit Indicator' : 'Create New Indicator' }}
        </v-card-title>
        <v-card-text>
          <div class="space-y-4 py-4">
            <v-select
              v-model="form.topic_id"
              label="Topic"
              :items="topics"
              item-title="title_th"
              item-value="id"
              required
              outlined
              density="comfortable"
            />
            <v-text-field
              v-model="form.code"
              label="Code"
              required
              outlined
              density="comfortable"
            />
            <v-text-field
              v-model="form.name_th"
              label="Name (Thai)"
              required
              outlined
              density="comfortable"
            />
            <v-textarea
              v-model="form.description"
              label="Description"
              outlined
              rows="2"
              density="comfortable"
            />
            <v-select
              v-model="form.type"
              label="Type"
              :items="['score_1_4', 'yes_no', 'file_url']"
              outlined
              density="comfortable"
            />
            <div class="grid grid-cols-2 gap-4">
              <v-text-field
                v-model.number="form.weight"
                label="Weight"
                type="number"
                outlined
                density="comfortable"
              />
              <v-text-field
                v-model.number="form.min_score"
                label="Min Score"
                type="number"
                outlined
                density="comfortable"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <v-text-field
                v-model.number="form.max_score"
                label="Max Score"
                type="number"
                outlined
                density="comfortable"
              />
            </div>
            <v-checkbox
              v-model="form.active"
              label="Active"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
