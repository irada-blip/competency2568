<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const items = ref([])
const total = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const showDialog = ref(false)
const isEditing = ref(false)
const selectedItem = ref(null)

// Form fields
const form = ref({
  code: '',
  name_th: '',
  buddhist_year: new Date().getFullYear() + 543,
  start_date: '',
  end_date: '',
  is_active: false
})

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'id', order: 'desc' }]
})

// Load periods
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get('/api/periods', {
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

onMounted(async () => {
  if (!auth.isLogged || auth.userRole !== 'admin') {
    router.push('/login')
    return
  }
  await load()
})

watch(options, load, { deep: true })

// Open dialog for create
function openCreate() {
  isEditing.value = false
  selectedItem.value = null
  form.value = {
    code: '',
    name_th: '',
    buddhist_year: new Date().getFullYear() + 543,
    start_date: '',
    end_date: '',
    is_active: false
  }
  showDialog.value = true
}

// Open dialog for edit
function openEdit(item: any) {
  isEditing.value = true
  selectedItem.value = item
  form.value = {
    code: item.code,
    name_th: item.name_th,
    buddhist_year: item.buddhist_year,
    start_date: item.start_date,
    end_date: item.end_date,
    is_active: item.is_active === 1
  }
  showDialog.value = true
}

// Save (create or update)
async function save() {
  try {
    if (isEditing.value && selectedItem.value) {
      await $api.put(`/api/periods/${selectedItem.value.id}`, form.value)
    } else {
      await $api.post('/api/periods', form.value)
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
  if (confirm(`Delete period "${item.name_th}"?`)) {
    try {
      await $api.delete(`/api/periods/${item.id}`)
      await load()
    } catch (e: any) {
      errorMsg.value = e.response?.data?.message || e.message || 'Delete failed'
    }
  }
}

// Toggle active status
async function toggleActive(item: any) {
  try {
    await $api.put(`/api/periods/${item.id}`, {
      ...item,
      is_active: item.is_active ? 0 : 1
    })
    await load()
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Update failed'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Evaluation Periods</h1>
      <v-btn color="primary" @click="openCreate">
        <v-icon left>mdi-plus</v-icon>
        New Period
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
        { title: 'Buddhist Year', key: 'buddhist_year' },
        { title: 'Start Date', key: 'start_date' },
        { title: 'End Date', key: 'end_date' },
        { title: 'Status', key: 'is_active' },
        { title: 'Actions', key: 'actions', sortable: false }
      ]"
      :items="items"
      :items-length="total"
      :loading="loading"
    >
      <template #item.is_active="{ item }">
        <v-chip
          :color="item.is_active ? 'green' : 'red'"
          size="small"
          @click="toggleActive(item)"
          class="cursor-pointer"
        >
          {{ item.is_active ? 'Active' : 'Inactive' }}
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
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Edit Period' : 'Create New Period' }}
        </v-card-title>
        <v-card-text>
          <div class="space-y-4 py-4">
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
            <v-text-field
              v-model.number="form.buddhist_year"
              label="Buddhist Year"
              type="number"
              outlined
              density="comfortable"
            />
            <v-text-field
              v-model="form.start_date"
              label="Start Date"
              type="date"
              outlined
              density="comfortable"
            />
            <v-text-field
              v-model="form.end_date"
              label="End Date"
              type="date"
              outlined
              density="comfortable"
            />
            <v-checkbox
              v-model="form.is_active"
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
