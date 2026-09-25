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

const title = ref('')
const content = ref('')

const loading = ref(true)
const saving = ref(false)
const error = ref('')

const getNote = async () => {
  try {
    const id = route.params.id

    const response = await api.get<Note>(`/Notes/${id}`)

    title.value = response.data.title
    content.value = response.data.content ?? ''
  } catch (err) {
    console.error(err)

    error.value = 'Failed to load note.'
  } finally {
    loading.value = false
  }
}

const updateNote = async () => {
  error.value = ''

  if (!title.value.trim()) {
    error.value = 'Title is required.'
    return
  }

  try {
    saving.value = true

    const id = route.params.id

    await api.put(`/Notes/${id}`, {
      title: title.value,
      content: content.value || null
    })

    router.push(`/notes/${id}`)
  } catch (err) {
    console.error(err)

    error.value = 'Failed to update note.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  getNote()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="mx-auto max-w-3xl px-4 py-8">

      <!-- Back -->
      <button
        type="button"
        @click="router.push(`/notes/${route.params.id}`)"
        class="mb-6 text-blue-600 hover:underline"
      >
        ← Back to Note
      </button>

      <!-- Loading -->
      <div
        v-if="loading"
        class="py-10 text-center text-gray-500"
      >
        Loading note...
      </div>

      <!-- Form -->
      <div
        v-else
        class="rounded-xl bg-white p-8 shadow-sm"
      >

        <h1 class="text-3xl font-bold text-gray-900">
          Edit Note
        </h1>

        <p class="mt-2 text-gray-500">
          Update your note.
        </p>

        <!-- Error -->
        <div
          v-if="error"
          class="mt-6 rounded-lg bg-red-100 p-4 text-red-700"
        >
          {{ error }}
        </div>

        <form
          @submit.prevent="updateNote"
          class="mt-8 space-y-6"
        >

          <!-- Title -->
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700"
            >
              Title
            </label>

            <input
              id="title"
              v-model="title"
              type="text"
              maxlength="200"
              class="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <!-- Content -->
          <div>
            <label
              for="content"
              class="block text-sm font-medium text-gray-700"
            >
              Content
            </label>

            <textarea
              id="content"
              v-model="content"
              rows="8"
              class="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            ></textarea>
          </div>

          <!-- Update -->
          <button
            type="submit"
            :disabled="saving"
            class="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ saving ? 'Updating...' : 'Update Note' }}
          </button>

        </form>

      </div>

    </div>
  </div>
</template>