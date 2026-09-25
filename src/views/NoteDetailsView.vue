
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

interface Note {
  id: number
  userId: number
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()

const note = ref<Note | null>(null)

const loading = ref(true)
const error = ref('')
const deleting = ref(false)

const getNote = async () => {
  try {
    const id = route.params.id

    const response = await api.get<Note>(`/Notes/${id}`)

    note.value = response.data
  } catch (err) {
    console.error(err)

    error.value = 'Failed to load note.'
  } finally {
    loading.value = false
  }
}

const deleteNote = async () => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this note?'
  )

  if (!confirmed) {
    return
  }

  try {
    deleting.value = true
    error.value = ''

    const id = route.params.id

    await api.delete(`/Notes/${id}`)

    router.push('/notes')
  } catch (err) {
    console.error(err)

    error.value = 'Failed to delete note.'
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  getNote()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="mx-auto max-w-3xl px-4 py-8">

      <!-- Back button -->
      <button
        type="button"
        @click="router.push('/notes')"
        class="mb-6 text-blue-600 hover:underline"
      >
        ← Back to Notes
      </button>

      <!-- Loading -->
      <div
        v-if="loading"
        class="py-10 text-center text-gray-500"
      >
        Loading note...
      </div>

      <!-- Error -->
      <div
        v-else-if="error && !note"
        class="rounded-lg bg-red-100 p-4 text-red-700"
      >
        {{ error }}
      </div>

      <!-- Note -->
      <div
        v-else-if="note"
        class="rounded-xl bg-white p-8 shadow-sm"
      >

        <!-- Title -->
        <h1 class="text-3xl font-bold text-gray-900">
          {{ note.title }}
        </h1>

        <!-- Action buttons -->
        <div class="mt-6 flex flex-wrap gap-3">

          <!-- Edit -->
          <button
            type="button"
            @click="router.push(`/notes/${note.id}/edit`)"
            class="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Edit Note
          </button>

          <!-- Delete -->
          <button
            type="button"
            @click="deleteNote"
            :disabled="deleting"
            class="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete Note' }}
          </button>

        </div>

        <!-- Delete error -->
        <div
          v-if="error"
          class="mt-6 rounded-lg bg-red-100 p-4 text-red-700"
        >
          {{ error }}
        </div>

        <!-- Content -->
        <div class="mt-8">
          <p
            class="whitespace-pre-wrap text-gray-700"
          >
            {{ note.content || 'No content.' }}
          </p>
        </div>

        <!-- Dates -->
        <div
          class="mt-8 border-t pt-5 text-sm text-gray-400"
        >
          <p>
            Created:
            {{ note.createdAt }}
          </p>

          <p class="mt-1">
            Updated:
            {{ note.updatedAt }}
          </p>
        </div>

      </div>

    </div>
  </div>
</template>

