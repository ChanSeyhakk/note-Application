<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')

const loading = ref(false)
const error = ref('')
const success = ref('')

const register = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    const response = await api.post(
      '/Auth/register',
      {
        username: username.value,
        email: email.value,
        password: password.value
      }
    )

    console.log(
      'Register response:',
      response.data
    )

    success.value =
      'Registration successful!'

    // Clear form
    username.value = ''
    email.value = ''
    password.value = ''

    // Go to Login after 1 second
    setTimeout(() => {
      router.push('/login')
    }, 1000)

  } catch (err: any) {
    console.error(
      'Register error:',
      err
    )

    error.value =
      err.response?.data?.message ||
      'Registration failed. Please try again.'

  } finally {
    loading.value = false
  }
}

// Go to Login page
const goToLogin = () => {
  router.push('/login')
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
        Create Account
      </h1>

      <p
        class="text-center text-gray-500 mb-6"
      >
        Create your Notes account
      </p>

      <!-- Register Form -->
      <form
        @submit.prevent="register"
        class="space-y-5"
      >

        <!-- Username -->
        <div>
          <label
            class="block mb-2 font-medium"
          >
            Username
          </label>

          <input
            v-model="username"
            type="text"
            placeholder="Enter your username"
            class="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

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
            minlength="6"
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

        <!-- Success -->
        <p
          v-if="success"
          class="text-green-600 text-sm"
        >
          {{ success }}
        </p>

        <!-- Register Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{
            loading
              ? 'Creating account...'
              : 'Create Account'
          }}
        </button>

      </form>

      <!-- Login Link -->
      <div
        class="text-center mt-6"
      >
        <span class="text-gray-600">
          Already have an account?
        </span>

        <button
          type="button"
          @click="goToLogin"
          class="text-blue-600 hover:underline ml-1 font-medium"
        >
          Login
        </button>
      </div>

    </div>
  </div>
</template>