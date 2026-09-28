<template>
  <div
    class="min-h-screen transition-colors duration-300"
    :class="isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'"
  >
    <!-- Header -->
    <header
      class="sticky top-0 z-40 border-b backdrop-blur transition-colors"
      :class="
        isDark
          ? 'border-slate-800 bg-slate-950/90'
          : 'border-slate-200 bg-white/90'
      "
    >
      <div
        class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6"
      >
        <!-- Logo -->
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 sm:h-11 sm:w-11"
          >
            N
          </div>

          <div class="min-w-0">
            <h1
              class="truncate text-base font-bold sm:text-lg"
              :class="isDark ? 'text-white' : 'text-slate-900'"
            >
              NoteMe
            </h1>

            <p
              class="hidden text-xs sm:block"
              :class="isDark ? 'text-slate-500' : 'text-slate-400'"
            >
              Your personal notes
            </p>
          </div>
        </div>

        <!-- Header actions -->
        <div class="flex shrink-0 items-center gap-2">
          <button
            @click="toggleTheme"
            class="rounded-lg border px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm"
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
            class="hidden rounded-lg border px-4 py-2 text-sm font-medium transition sm:block"
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
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">

      <!-- Heading -->
      <section
        class="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Dashboard
          </p>

          <h2
            class="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            My Notes
          </h2>

          <p
            class="mt-2 text-sm sm:text-base"
            :class="isDark ? 'text-slate-400' : 'text-slate-500'"
          >
            Create, organize and manage your notes.
          </p>
        </div>

        <button
          @click="createNote"
          class="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 sm:w-auto"
        >
          + New Note
        </button>
      </section>

      <!-- Search + Sort -->
      <section
        class="mb-6 rounded-2xl border p-4 shadow-sm sm:p-5"
        :class="
          isDark
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-white'
        "
      >
        <div class="flex flex-col gap-3 md:flex-row">
          <!-- Search -->
          <div class="relative min-w-0 flex-1">
            <svg
              class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
              :class="isDark ? 'text-slate-500' : 'text-slate-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
              />
            </svg>

            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search notes..."
              class="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition"
              :class="
                isDark
                  ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:border-blue-500'
                  : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500'
              "
            />
          </div>

          <!-- Sort -->
          <select
            v-model="sortOption"
            class="w-full rounded-xl border px-4 py-3 text-sm outline-none md:w-52"
            :class="
              isDark
                ? 'border-slate-700 bg-slate-950 text-white'
                : 'border-slate-200 bg-white text-slate-900'
            "
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </section>

      <!-- Loading -->
      <div
        v-if="loading"
        class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="h-56 animate-pulse rounded-2xl"
          :class="isDark ? 'bg-slate-900' : 'bg-white'"
        ></div>
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
        <h3
          class="font-semibold"
          :class="isDark ? 'text-red-300' : 'text-red-700'"
        >
          Failed to load notes
        </h3>

        <p
          class="mt-2 text-sm"
          :class="isDark ? 'text-red-400' : 'text-red-600'"
        >
          {{ errorMessage }}
        </p>

        <button
          @click="loadNotes"
          class="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="filteredNotes.length === 0"
        class="rounded-2xl border px-6 py-14 text-center sm:py-20"
        :class="
          isDark
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-white'
        "
      >
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
          :class="isDark ? 'bg-slate-800' : 'bg-slate-100'"
        >
          <svg
            class="h-7 w-7"
            :class="isDark ? 'text-slate-500' : 'text-slate-400'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 3h9l3 3v15H6V3Zm9 0v4h4M9 12h6M9 16h6"
            />
          </svg>
        </div>

        <h3 class="mt-5 text-lg font-semibold">
          {{ searchQuery ? "No notes found" : "No notes yet" }}
        </h3>

        <p
          class="mx-auto mt-2 max-w-md text-sm"
          :class="isDark ? 'text-slate-400' : 'text-slate-500'"
        >
          {{
            searchQuery
              ? "Try a different search term."
              : "Create your first note to get started."
          }}
        </p>

        <button
          v-if="!searchQuery"
          @click="createNote"
          class="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Create Note
        </button>
      </div>

      <!-- Notes -->
      <div
        v-else
        class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="note in filteredNotes"
          :key="note.id"
          class="group flex min-h-64 flex-col rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6"
          :class="
            isDark
              ? 'border-slate-800 bg-slate-900 hover:border-slate-700'
              : 'border-slate-200 bg-white hover:border-slate-300'
          "
        >
          <!-- Note icon -->
          <div class="mb-5 flex items-start justify-between">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 3h9l3 3v15H6V3Zm9 0v4h4M9 12h6M9 16h4"
                />
              </svg>
            </div>

            <span
              class="text-xs"
              :class="isDark ? 'text-slate-500' : 'text-slate-400'"
            >
              {{ formatDate(note.createdAt) }}
            </span>
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <h3
              class="line-clamp-2 break-words text-lg font-semibold"
              :class="isDark ? 'text-white' : 'text-slate-900'"
            >
              {{ note.title }}
            </h3>

            <p
              class="mt-3 line-clamp-4 break-words text-sm leading-6"
              :class="isDark ? 'text-slate-400' : 'text-slate-500'"
            >
              {{ note.content || "No content added." }}
            </p>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex gap-2">
            <button
              @click="viewNote(note.id)"
              class="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              View
            </button>

            <button
              @click="editNote(note.id)"
              class="rounded-lg border px-4 py-2.5 text-xs font-semibold transition"
              :class="
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              "
            >
              Edit
            </button>

            <button
              @click="deleteNote(note.id)"
              class="rounded-lg border px-3 py-2.5 text-xs font-semibold transition"
              :class="
                isDark
                  ? 'border-red-900 text-red-400 hover:bg-red-950/40'
                  : 'border-red-200 text-red-600 hover:bg-red-50'
              "
            >
              Delete
            </button>
          </div>
        </article>
      </div>
    </main>

    <!-- Mobile logout -->
    <div class="px-4 pb-6 sm:hidden">
      <button
        @click="logout"
        class="w-full rounded-xl border px-4 py-3 text-sm font-medium"
        :class="
          isDark
            ? 'border-slate-800 text-slate-400'
            : 'border-slate-200 text-slate-600'
        "
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

interface Note {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

const router = useRouter();

const notes = ref<Note[]>([]);
const loading = ref(true);
const errorMessage = ref("");

const searchQuery = ref("");
const sortOption = ref("newest");

const isDark = ref(false);

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

const loadNotes = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get("/Notes");

    notes.value = response.data;
  } catch (error: any) {
    console.error(error);

    errorMessage.value =
      error?.response?.data?.message ||
      "Unable to load notes.";
  } finally {
    loading.value = false;
  }
};

const filteredNotes = computed(() => {
  let result = [...notes.value];

  const search = searchQuery.value.trim().toLowerCase();

  if (search) {
    result = result.filter(
      (note) =>
        note.title.toLowerCase().includes(search) ||
        (note.content ?? "").toLowerCase().includes(search)
    );
  }

  if (sortOption.value === "newest") {
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }

  if (sortOption.value === "oldest") {
    result.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }

  if (sortOption.value === "title") {
    result.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  return result;
});

const createNote = () => {
  router.push("/notes/create");
};

const viewNote = (id: number) => {
  router.push(`/notes/${id}`);
};

const editNote = (id: number) => {
  router.push(`/notes/${id}/edit`);
};

const deleteNote = async (id: number) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this note?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/Notes/${id}`);

    notes.value = notes.value.filter(
      (note) => note.id !== id
    );
  } catch (error: any) {
    console.error(error);

    alert(
      error?.response?.data?.message ||
      "Failed to delete note."
    );
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  router.push("/login");
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

onMounted(() => {
  loadTheme();
  loadNotes();
});
</script>