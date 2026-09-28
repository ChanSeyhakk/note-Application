<template>
  <div
    class="min-h-screen w-full overflow-x-hidden transition-colors duration-300"
    :class="
      isDark
        ? 'bg-slate-950 text-white font-dark-mode'
        : 'bg-slate-50 text-slate-900 font-light-mode'
    "
  >
    <!-- Theme Button -->
    <div
      class="fixed right-3 top-3 z-50 sm:right-5 sm:top-5 lg:right-8 lg:top-6"
    >
      <button
        type="button"
        @click="toggleTheme"
        class="rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition sm:px-4 sm:py-2.5 sm:text-sm"
        :class="
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        "
      >
        {{ isDark ? "Light" : "Dark" }}
      </button>
    </div>

    <!-- Page -->
    <div
      class="flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-12"
    >
      <!-- Create Card -->
      <div
        class="w-full max-w-xl rounded-2xl border p-5 shadow-xl transition-colors duration-300 sm:p-7 md:p-8"
        :class="
          isDark
            ? 'border-slate-800 bg-slate-900 shadow-black/20'
            : 'border-slate-200 bg-white shadow-slate-200/70'
        "
      >
        <!-- Logo -->
        <div class="flex justify-center">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-500/25 sm:h-16 sm:w-16 sm:text-2xl"
          >
            N
          </div>
        </div>

        <!-- Heading -->
        <div class="mt-6 text-center">
          <h1
            class="text-2xl font-bold tracking-tight sm:text-3xl"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            Create Note
          </h1>

          <p
            class="mt-2 text-sm sm:text-base"
            :class="isDark ? 'text-slate-400' : 'text-slate-500'"
          >
            Create a new note in
            <span class="font-semibold text-blue-600">
              NoteMe
            </span>
          </p>
        </div>

        <!-- Error -->
        <div
          v-if="errorMessage"
          class="mt-6 rounded-xl border px-4 py-3 text-sm"
          :class="
            isDark
              ? 'border-red-900 bg-red-950/40 text-red-300'
              : 'border-red-200 bg-red-50 text-red-600'
          "
        >
          {{ errorMessage }}
        </div>

        <!-- Success -->
        <div
          v-if="successMessage"
          class="mt-6 rounded-xl border px-4 py-3 text-sm"
          :class="
            isDark
              ? 'border-green-900 bg-green-950/40 text-green-300'
              : 'border-green-200 bg-green-50 text-green-700'
          "
        >
          {{ successMessage }}
        </div>

        <!-- Form -->
        <form
          @submit.prevent="createNote"
          class="mt-7 space-y-5 sm:mt-8 sm:space-y-6"
        >
          <!-- Title -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <label
                for="title"
                class="text-sm font-semibold"
                :class="isDark ? 'text-slate-200' : 'text-slate-700'"
              >
                Title
              </label>

              <span
                class="text-xs"
                :class="isDark ? 'text-slate-500' : 'text-slate-400'"
              >
                Required
              </span>
            </div>

            <input
              id="title"
              v-model="title"
              type="text"
              maxlength="200"
              autocomplete="off"
              placeholder="Enter note title..."
              class="block w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition sm:py-4"
              :class="
                isDark
                  ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
              "
            />

            <div class="mt-2 flex justify-end">
              <span
                class="text-xs"
                :class="isDark ? 'text-slate-600' : 'text-slate-400'"
              >
                {{ title.length }}/200
              </span>
            </div>
          </div>

          <!-- Content -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <label
                for="content"
                class="text-sm font-semibold"
                :class="isDark ? 'text-slate-200' : 'text-slate-700'"
              >
                Content
              </label>

              <span
                class="text-xs"
                :class="isDark ? 'text-slate-500' : 'text-slate-400'"
              >
                Optional
              </span>
            </div>

            <textarea
              id="content"
              v-model="content"
              rows="8"
              maxlength="10000"
              placeholder="Write your note..."
              class="block w-full resize-none rounded-xl border px-4 py-3.5 text-sm leading-6 outline-none transition sm:py-4"
              :class="
                isDark
                  ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
              "
            ></textarea>

            <div class="mt-2 flex justify-end">
              <span
                class="text-xs"
                :class="isDark ? 'text-slate-600' : 'text-slate-400'"
              >
                {{ content.length }}/10000
              </span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
            <!-- Save -->
            <button
              type="submit"
              :disabled="loading || !title.trim()"
              class="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:py-4"
            >
              {{ loading ? "Saving..." : "Save Note" }}
            </button>

            <!-- Cancel -->
            <button
              type="button"
              @click="goBack"
              class="w-full rounded-xl border px-4 py-3.5 text-sm font-semibold transition sm:w-auto sm:px-6"
              :class="
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
            >
              Cancel
            </button>
          </div>
        </form>

        <!-- Back -->
        <div class="mt-6 text-center">
          <button
            type="button"
            @click="goBack"
            class="text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            ← Back to Notes
          </button>
        </div>
      </div>

      <!-- Footer -->
      <p
        class="mt-6 px-4 text-center text-xs"
        :class="isDark ? 'text-slate-600' : 'text-slate-400'"
      >
        © {{ new Date().getFullYear() }} NoteMe. Keep your ideas organized.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

const title = ref("");
const content = ref("");

const loading = ref(false);

const errorMessage = ref("");
const successMessage = ref("");

const isDark = ref(false);

/* =========================
   Theme
========================= */

const loadTheme = () => {
  isDark.value =
    localStorage.getItem("theme") === "dark";
};

const toggleTheme = () => {
  isDark.value = !isDark.value;

  localStorage.setItem(
    "theme",
    isDark.value ? "dark" : "light"
  );
};

/* =========================
   Create Note
========================= */

const createNote = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!title.value.trim()) {
    errorMessage.value =
      "Please enter a note title.";

    return;
  }

  loading.value = true;

  try {
    await api.post("/Notes", {
      title: title.value.trim(),
      content:
        content.value.trim() || null,
    });

    successMessage.value =
      "Note created successfully.";

    title.value = "";
    content.value = "";

    setTimeout(() => {
      router.push("/notes");
    }, 500);
  } catch (error: any) {
    console.error(error);

    errorMessage.value =
      error?.response?.data?.message ||
      "Failed to create note. Please try again.";
  } finally {
    loading.value = false;
  }
};

/* =========================
   Navigation
========================= */

const goBack = () => {
  router.push("/notes");
};

/* =========================
   Start
========================= */

onMounted(() => {
  loadTheme();
});
</script>