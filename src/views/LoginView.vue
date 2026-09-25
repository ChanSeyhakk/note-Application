<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const email = ref('')
const password = ref('')

const loading = ref(false)
const error = ref('')

const login = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await api.post(
      '/Auth/login',
      {
        email: email.value,
        password: password.value
      }
    )

    console.log(
      'Login response:',
      response.data
    )

    // Get JWT token
    const token = response.data.token

    console.log(
      'Token received:',
      token ? 'YES' : 'NO'
    )

    // Save JWT token
    localStorage.setItem(
      'token',
      token
    )

    // Check token
    const savedToken =
      localStorage.getItem('token')

    console.log(
      'TOKEN SAVED:',
      savedToken ? 'YES' : 'NO'
    )

    // Save user information
    localStorage.setItem(
      'user',
      JSON.stringify(response.data.user)
    )

    console.log(
      'USER SAVED:',
      localStorage.getItem('user')
    )

    alert('Login successful!')

    // Go to Notes
    router.push('/notes')

  } catch (err: any) {
    console.error(
      'Login error:',
      err
    )

    error.value =
      err.response?.data?.message ||
      'Login failed. Please try again.'

  } finally {
    loading.value = false
  }
}

// Go to Register page
const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-100"
  >
    <div
      class="w-full max-w-md bg-white p-8 rounded-xl shadow"
    >

      <!-- Title -->
      <h1
        class="text-3xl font-bold text-center mb-2"
      >
        Login
      </h1>

      <p
        class="text-center text-gray-500 mb-6"
      >
        Welcome back
      </p>

      <!-- Login Form -->
      <form
        @submit.prevent="login"
        class="space-y-5"
      >

        <!-- Email -->
        <div>
          <label
            class="block mb-2 font-medium"
          >
            Email
          </label>

          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Password -->
        <div>
          <label
            class="block mb-2 font-medium"
          >
            Password
          </label>

          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Error -->
        <p
          v-if="error"
          class="text-red-500 text-sm"
        >
          {{ error }}
        </p>

        <!-- Login Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{
            loading
              ? 'Logging in...'
              : 'Login'
          }}
        </button>

      </form>

      <!-- Register Link -->
      <div
        class="text-center mt-6"
      >
        <span class="text-gray-600">
          Don't have an account?
        </span>

        <button
          type="button"
          @click="goToRegister"
          class="text-blue-600 hover:underline ml-1 font-medium"
        >
          Register
        </button>
      </div>

    </div>
  </div>
</template>