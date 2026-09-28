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
      <!-- Login Card -->
      <div
        class="w-full max-w-md rounded-2xl border p-5 shadow-xl transition-colors duration-300 sm:p-7 md:p-8"
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
            Login
          </h1>

          <p
            class="mt-2 text-sm sm:text-base"
            :class="isDark ? 'text-slate-400' : 'text-slate-500'"
          >
            Sign in to continue to
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
          @submit.prevent="login"
          class="mt-7 space-y-5 sm:mt-8 sm:space-y-6"
        >
          <!-- Email -->
          <div>
            <label
              for="email"
              class="mb-2 block text-sm font-semibold"
              :class="isDark ? 'text-slate-200' : 'text-slate-700'"
            >
              Email
            </label>

            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="block w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition sm:py-4"
              :class="
                isDark
                  ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
              "
            />
          </div>

          <!-- Password -->
          <div>
            <label
              for="password"
              class="mb-2 block text-sm font-semibold"
              :class="isDark ? 'text-slate-200' : 'text-slate-700'"
            >
              Password
            </label>

            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                class="block w-full rounded-xl border px-4 py-3.5 pr-16 text-sm outline-none transition sm:py-4"
                :class="
                  isDark
                    ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
                "
              />

              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 px-1 text-xs font-medium transition sm:right-4 sm:text-sm"
                :class="
                  isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                "
              >
                {{ showPassword ? "Hide" : "Show" }}
              </button>
            </div>
          </div>

          <!-- Login -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
          >
            {{ loading ? "Signing in..." : "Login" }}
          </button>
        </form>

        <!-- Divider -->
        <div class="my-7 flex items-center gap-4 sm:my-8">
          <div
            class="h-px flex-1"
            :class="isDark ? 'bg-slate-800' : 'bg-slate-200'"
          ></div>

          <span
            class="text-xs"
            :class="isDark ? 'text-slate-500' : 'text-slate-400'"
          >
            OR
          </span>

          <div
            class="h-px flex-1"
            :class="isDark ? 'bg-slate-800' : 'bg-slate-200'"
          ></div>
        </div>

        <!-- Register -->
        <p
          class="text-center text-sm"
          :class="isDark ? 'text-slate-400' : 'text-slate-500'"
        >
          Don't have an account?

          <button
            type="button"
            @click="goRegister"
            class="ml-1 font-semibold text-blue-600 hover:text-blue-700"
          >
            Create an account
          </button>
        </p>
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

const email = ref("");
const password = ref("");

const showPassword = ref(false);
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
   Login
========================= */

const login = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!email.value.trim()) {
    errorMessage.value = "Please enter your email.";
    return;
  }

  if (!password.value) {
    errorMessage.value = "Please enter your password.";
    return;
  }

  loading.value = true;

  try {
    const response = await api.post("/Auth/login", {
      email: email.value.trim(),
      password: password.value,
    });

    localStorage.setItem(
      "token",
      response.data.token
    );

    if (response.data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );
    }

    successMessage.value =
      "Login successful.";

    setTimeout(() => {
      router.push("/notes");
    }, 400);
  } catch (error: any) {
    console.error(error);

    errorMessage.value =
      error?.response?.data?.message ||
      "Invalid email or password.";
  } finally {
    loading.value = false;
  }
};

/* =========================
   Register
========================= */

const goRegister = () => {
  router.push("/register");
};

/* =========================
   Start
========================= */

onMounted(() => {
  loadTheme();
});
</script>