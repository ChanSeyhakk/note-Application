<template>
  <div
    class="min-h-screen transition-colors duration-300"
    :class="isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'"
  >
    <!-- Header -->
    <header
      class="border-b transition-colors duration-300"
      :class="
        isDark
          ? 'border-slate-800 bg-slate-950'
          : 'border-slate-200 bg-white'
      "
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <!-- Logo -->
        <button
          @click="goBack"
          class="flex items-center gap-3"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-500/20"
          >
            N
          </div>

          <div class="text-left">
            <h1
              class="text-lg font-bold"
              :class="isDark ? 'text-white' : 'text-slate-900'"
            >
              NoteMe
            </h1>

            <p
              class="text-xs"
              :class="isDark ? 'text-slate-400' : 'text-slate-500'"
            >
              Your personal notes
            </p>
          </div>
        </button>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            @click="toggleTheme"
            class="rounded-lg border px-4 py-2 text-sm font-medium transition"
            :class="
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            "
          >
            {{ isDark ? "Light" : "Dark" }}
          </button>

          <button
            @click="logout"
            class="rounded-lg border px-4 py-2 text-sm font-medium transition"
            :class="
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            "
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="mx-auto max-w-4xl px-6 py-10">

      <!-- Back -->
      <button
        @click="goBack"
        class="mb-8 flex items-center gap-2 text-sm font-medium transition"
        :class="
          isDark
            ? 'text-slate-400 hover:text-white'
            : 'text-slate-500 hover:text-slate-900'
        "
      >
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>

        Back to Notes
      </button>

      <!-- Loading -->
      <div
        v-if="loading"
        class="rounded-2xl border p-8"
        :class="
          isDark
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-white'
        "
      >
        <div
          class="mb-6 h-4 w-24 animate-pulse rounded"
          :class="isDark ? 'bg-slate-800' : 'bg-slate-200'"
        ></div>

        <div
          class="mb-4 h-10 w-3/4 animate-pulse rounded"
          :class="isDark ? 'bg-slate-800' : 'bg-slate-200'"
        ></div>

        <div
          class="mb-8 h-4 w-1/2 animate-pulse rounded"
          :class="isDark ? 'bg-slate-800' : 'bg-slate-200'"
        ></div>

        <div class="space-y-3">
          <div
            v-for="i in 5"
            :key="i"
            class="h-4 animate-pulse rounded"
            :class="isDark ? 'bg-slate-800' : 'bg-slate-200'"
          ></div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="errorMessage"
        class="rounded-2xl border p-8 text-center"
        :class="
          isDark
            ? 'border-red-900 bg-red-950/30'
            : 'border-red-200 bg-red-50'
        "
      >
        <h2
          class="text-lg font-semibold"
          :class="isDark ? 'text-red-300' : 'text-red-700'"
        >
          Unable to load note
        </h2>

        <p
          class="mt-2 text-sm"
          :class="isDark ? 'text-red-400' : 'text-red-600'"
        >
          {{ errorMessage }}
        </p>

        <button
          @click="loadNote"
          class="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>

      <!-- Note -->
      <div v-else-if="note">

        <!-- Heading -->
        <div class="mb-8">
          <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Note
          </p>

          <h2
            class="break-words text-3xl font-bold tracking-tight sm:text-4xl"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            {{ note.title }}
          </h2>

          <!-- Dates -->
          <div
            class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
            :class="isDark ? 'text-slate-400' : 'text-slate-500'"
          >
            <span>
              Created {{ formatDate(note.createdAt) }}
            </span>

            <span
              v-if="note.updatedAt !== note.createdAt"
            >
              Updated {{ formatDate(note.updatedAt) }}
            </span>
          </div>
        </div>

        <!-- Note Card -->
        <article
          class="rounded-2xl border shadow-sm transition-colors duration-300"
          :class="
            isDark
              ? 'border-slate-800 bg-slate-900'
              : 'border-slate-200 bg-white'
          "
        >
          <!-- Content -->
          <div class="p-6 sm:p-8">

            <div
              v-if="note.content"
              class="whitespace-pre-wrap break-words text-base leading-8"
              :class="isDark ? 'text-slate-300' : 'text-slate-700'"
            >
              {{ note.content }}
            </div>

            <div
              v-else
              class="py-10 text-center"
            >
              <p
                class="text-sm"
                :class="isDark ? 'text-slate-500' : 'text-slate-400'"
              >
                This note doesn't have any content.
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="flex flex-col gap-3 border-t p-6 sm:flex-row sm:justify-end"
            :class="isDark ? 'border-slate-800' : 'border-slate-100'"
          >
            <button
              @click="goEdit"
              class="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
            >
              Edit Note
            </button>

            <button
              @click="deleteNote"
              :disabled="deleting"
              class="rounded-xl border px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
              :class="
                isDark
                  ? 'border-red-900 text-red-400 hover:bg-red-950/40'
                  : 'border-red-200 text-red-600 hover:bg-red-50'
              "
            >
              {{ deleting ? "Deleting..." : "Delete Note" }}
            </button>
          </div>
        </article>

        <!-- Updated information -->
        <div
          class="mt-6 rounded-xl border px-5 py-4 text-sm"
          :class="
            isDark
              ? 'border-slate-800 bg-slate-900 text-slate-400'
              : 'border-slate-200 bg-white text-slate-500'
          "
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <span>
              Created: {{ formatFullDate(note.createdAt) }}
            </span>

            <span>
              Last modified: {{ formatFullDate(note.updatedAt) }}
            </span>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

interface Note {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

const route = useRoute();
const router = useRouter();

const note = ref<Note | null>(null);

const loading = ref(true);
const deleting = ref(false);
const errorMessage = ref("");

const isDark = ref(false);

/* -------------------------
   Theme
------------------------- */

const loadTheme = () => {
  isDark.value = localStorage.getItem("theme") === "dark";
};

const toggleTheme = () => {
  isDark.value = !isDark.value;

  localStorage.setItem(
    "theme",
    isDark.value ? "dark" : "light"
  );
};

/* -------------------------
   Load Note
------------------------- */

const loadNote = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const id = Number(route.params.id);

    if (!id) {
      throw new Error("Invalid note ID.");
    }

    const response = await api.get(`/Notes/${id}`);

    note.value = response.data;

  } catch (error: any) {
    console.error(error);

    errorMessage.value =
      error?.response?.data?.message ||
      "Failed to load this note.";
  } finally {
    loading.value = false;
  }
};

/* -------------------------
   Edit
------------------------- */

const goEdit = () => {
  if (!note.value) return;

  router.push(`/notes/${note.value.id}/edit`);
};

/* -------------------------
   Delete
------------------------- */

const deleteNote = async () => {
  if (!note.value) return;

  const confirmed = window.confirm(
    "Are you sure you want to delete this note?"
  );

  if (!confirmed) return;

  deleting.value = true;

  try {
    await api.delete(`/Notes/${note.value.id}`);

    router.push("/notes");

  } catch (error: any) {
    console.error(error);

    alert(
      error?.response?.data?.message ||
      "Failed to delete note."
    );
  } finally {
    deleting.value = false;
  }
};

/* -------------------------
   Navigation
------------------------- */

const goBack = () => {
  router.push("/notes");
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  router.push("/login");
};

/* -------------------------
   Date Formatting
------------------------- */

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatFullDate = (date: string) => {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/* -------------------------
   Start
------------------------- */

onMounted(() => {
  loadTheme();
  loadNote();
});
</script>