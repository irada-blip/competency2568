<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const items = ref([])
const users = ref([])
const periods = ref([])
const departments = ref([])
const total = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const showDialog = ref(false)
const isEditing = ref(false)
const selectedItem = ref(null)

// Form fields
const form = ref({
  period_id: '',
  evaluator_id: '',
  evaluatee_id: '',
  dept_id: ''
})

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'id', order: 'desc' }]
})

// Load assignments
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get('/api/assignments', {
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

// Load related data
async function loadRelatedData() {
  try {
    const [usersRes, periodsRes, deptRes] = await Promise.all([
      $api.get('/api/users'),
      $api.get('/api/periods'),
      $api.get('/api/departments')
    ])
    users.value = usersRes.data.items || []
    periods.value = periodsRes.data.items || []
    departments.value = deptRes.data.items || []
  } catch (e: any) {
    console.error('Load related data failed:', e)
  }
}

onMounted(async () => {
  if (!auth.isLogged || auth.userRole !== 'admin') {
    router.push('/login')
    return
  }
  await load()
  await loadRelatedData()
})

watch(options, load, { deep: true })

// Open dialog for create
function openCreate() {
  isEditing.value = false
  selectedItem.value = null
  form.value = {
    period_id: '',
    evaluator_id: '',
    evaluatee_id: '',
    dept_id: ''
  }
  showDialog.value = true
}

// Open dialog for edit
function openEdit(item: any) {
  isEditing.value = true
  selectedItem.value = item
  form.value = {
    period_id: item.period_id,
    evaluator_id: item.evaluator_id,
    evaluatee_id: item.evaluatee_id,
    dept_id: item.dept_id || ''
  }
  showDialog.value = true
}

// Save (create or update)
async function save() {
  try {
    if (isEditing.value && selectedItem.value) {
      await $api.put(`/api/assignments/${selectedItem.value.id}`, form.value)
    } else {
      await $api.post('/api/assignments', form.value)
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
  if (confirm(`Delete this assignment?`)) {
    try {
      await $api.delete(`/api/assignments/${item.id}`)
      await load()
    } catch (e: any) {
      errorMsg.value = e.response?.data?.message || e.message || 'Delete failed'
    }
  }
}

// Get user name
function getUserName(userId: number) {
  return users.value.find(u => u.id === userId)?.name_th || 'N/A'
}

// Get period name
function getPeriodName(periodId: number) {
  return periods.value.find(p => p.id === periodId)?.name_th || 'N/A'
}

// Get department name
function getDeptName(deptId: number) {
  return departments.value.find(d => d.id === deptId)?.name_th || 'N/A'
}

// Filter evaluators only
const evaluators = computed(() => users.value.filter(u => u.role === 'evaluator'))
const evaluatees = computed(() => users.value.filter(u => u.role === 'evaluatee'))
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Evaluation Assignments</h1>
      <v-btn color="primary" @click="openCreate">
        <v-icon left>mdi-plus</v-icon>
        New Assignment
      </v-btn>
    </div>

    <v-alert v-if="errorMsg" type="error" closable class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <v-data-table-server
      v-model:page="options.page"
      v-model:itemsPerPage="options.itemsPerPage"
      :headers="[
        { title: 'Period', key: 'period_id' },
        { title: 'Evaluator', key: 'evaluator_id' },
        { title: 'Evaluatee', key: 'evaluatee_id' },
        { title: 'Department', key: 'dept_id' },
        { title: 'Actions', key: 'actions', sortable: false }
      ]"
      :items="items"
      :items-length="total"
      :loading="loading"
    >
      <template #item.period_id="{ item }">
        {{ getPeriodName(item.period_id) }}
      </template>

      <template #item.evaluator_id="{ item }">
        {{ getUserName(item.evaluator_id) }}
      </template>

      <template #item.evaluatee_id="{ item }">
        {{ getUserName(item.evaluatee_id) }}
      </template>

      <template #item.dept_id="{ item }">
        {{ item.dept_id ? getDeptName(item.dept_id) : '-' }}
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
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Edit Assignment' : 'Create New Assignment' }}
        </v-card-title>
        <v-card-text>
          <div class="space-y-4 py-4">
            <v-select
              v-model="form.period_id"
              label="Period"
              :items="periods"
              item-title="name_th"
              item-value="id"
              required
              outlined
              density="comfortable"
            />
            <v-select
              v-model="form.evaluator_id"
              label="Evaluator"
              :items="evaluators"
              item-title="name_th"
              item-value="id"
              required
              outlined
              density="comfortable"
            />
            <v-select
              v-model="form.evaluatee_id"
              label="Evaluatee"
              :items="evaluatees"
              item-title="name_th"
              item-value="id"
              required
              outlined
              density="comfortable"
            />
            <v-select
              v-model="form.dept_id"
              label="Department"
              :items="departments"
              item-title="name_th"
              item-value="id"
              clearable
              outlined
              density="comfortable"
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
