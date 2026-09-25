<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  id: number
  title: string
  content: string
  createdAt: string
}>()

const router = useRouter()

const openNote = (id: number) => {
  router.push(`/notes/${id}`)
}
</script>

<template>
  <div
    @click="openNote(id)"
    class="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
  >
    <h2 class="text-xl font-semibold text-gray-900">
      {{ title }}
    </h2>

    <p class="mt-3 text-gray-600">
      {{ content }}
    </p>

    <p class="mt-5 text-sm text-gray-400">
      Created: {{ createdAt }}
    </p>
  </div>
</template>