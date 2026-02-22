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
const searchQuery = ref('')
const showDialog = ref(false)
const isEditing = ref(false)
const selectedItem = ref(null)

// Form fields
const form = ref({
  code: '',
  title_th: '',
  description: '',
  weight: 0,
  active: true
})

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'id', order: 'desc' }]
})

// Load topics
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get('/api/topics', {
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
    title_th: '',
    description: '',
    weight: 0,
    active: true
  }
  showDialog.value = true
}

// Open dialog for edit
function openEdit(item: any) {
  isEditing.value = true
  selectedItem.value = item
  form.value = {
    code: item.code,
    title_th: item.title_th,
    description: item.description || '',
    weight: item.weight || 0,
    active: item.active === 1
  }
  showDialog.value = true
}

// Save (create or update)
async function save() {
  try {
    if (isEditing.value && selectedItem.value) {
      await $api.put(`/api/topics/${selectedItem.value.id}`, form.value)
      errorMsg.value = ''
    } else {
      await $api.post('/api/topics', form.value)
      errorMsg.value = ''
    }
    showDialog.value = false
    await load()
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || e.message || 'Save failed'
  }
}

// Delete
async function deleteItem(item: any) {
  if (confirm(`Delete topic "${item.title_th}"?`)) {
    try {
      await $api.delete(`/api/topics/${item.id}`)
      await load()
    } catch (e: any) {
      errorMsg.value = e.response?.data?.message || e.message || 'Delete failed'
    }
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Evaluation Topics</h1>
      <v-btn color="primary" @click="openCreate">
        <v-icon left>mdi-plus</v-icon>
        New Topic
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
        { title: 'Title (TH)', key: 'title_th' },
        { title: 'Weight', key: 'weight' },
        { title: 'Active', key: 'active' },
        { title: 'Actions', key: 'actions', sortable: false }
      ]"
      :items="items"
      :items-length="total"
      :loading="loading"
    >
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
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Edit Topic' : 'Create New Topic' }}
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
              v-model="form.title_th"
              label="Title (Thai)"
              required
              outlined
              density="comfortable"
            />
            <v-textarea
              v-model="form.description"
              label="Description"
              outlined
              rows="3"
              density="comfortable"
            />
            <v-text-field
              v-model.number="form.weight"
              label="Weight"
              type="number"
              outlined
              density="comfortable"
            />
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
