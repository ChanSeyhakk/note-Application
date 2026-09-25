<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const title = ref('')
const content = ref('')

const loading = ref(false)
const error = ref('')

const createNote = async () => {
  // Clear previous error
  error.value = ''

  // Validate title
  if (!title.value.trim()) {
    error.value = 'Title is required.'
    return
  }

  try {
    loading.value = true

    await api.post('/Notes', {
      title: title.value,
      content: content.value || null
    })

    // Go back to notes after successful creation
    router.push('/notes')
  } catch (err) {
    console.error(err)

    error.value = 'Failed to create note.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="mx-auto max-w-3xl px-4 py-8">

      <!-- Back -->
      <button
        type="button"
        @click="router.push('/notes')"
        class="mb-6 text-blue-600 hover:underline"
      >
        ← Back to Notes
      </button>

      <!-- Form Card -->
      <div class="rounded-xl bg-white p-8 shadow-sm">

        <h1 class="text-3xl font-bold text-gray-900">
          Create Note
        </h1>

        <p class="mt-2 text-gray-500">
          Create a new note.
        </p>

        <!-- Error -->
        <div
          v-if="error"
          class="mt-6 rounded-lg bg-red-100 p-4 text-red-700"
        >
          {{ error }}
        </div>

        <!-- Form -->
        <form
          @submit.prevent="createNote"
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
              placeholder="Enter note title"
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
              placeholder="Write your note..."
              class="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            ></textarea>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ loading ? 'Saving...' : 'Save Note' }}
          </button>

        </form>

      </div>

    </div>
  </div>
</template>