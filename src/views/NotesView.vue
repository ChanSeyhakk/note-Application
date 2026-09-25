<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

// ==========================================
// NOTE TYPE
// ==========================================

interface Note {
  id: number
  userId: number
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
}


// ==========================================
// STATE
// ==========================================

const notes = ref<Note[]>([])

const loading = ref(false)
const error = ref('')

const search = ref('')

const sortBy = ref('newest')


// ==========================================
// GET NOTES
// ==========================================

const getNotes = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await api.get('/Notes')

    notes.value = response.data

    console.log('NOTES:', response.data)

  } catch (err: any) {

    console.error(
      'GET NOTES ERROR:',
      err
    )

    error.value =
      err.response?.data?.message ||
      'Failed to load notes.'

    // JWT expired / invalid
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      router.push('/login')
    }

  } finally {
    loading.value = false
  }
}


// ==========================================
// FILTER + SEARCH + SORT
// ==========================================

const filteredNotes = computed(() => {

  let result = [...notes.value]

  // SEARCH

  if (search.value.trim()) {

    const keyword =
      search.value.toLowerCase()

    result = result.filter(note =>
      note.title
        .toLowerCase()
        .includes(keyword)
      ||
      (note.content ?? '')
        .toLowerCase()
        .includes(keyword)
    )
  }


  // SORT

  if (sortBy.value === 'newest') {

    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )

  } else if (sortBy.value === 'oldest') {

    result.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    )

  } else if (sortBy.value === 'title') {

    result.sort(
      (a, b) =>
        a.title.localeCompare(b.title)
    )
  }

  return result
})


// ==========================================
// DELETE NOTE
// ==========================================

const deleteNote = async (id: number) => {

  const confirmed =
    confirm(
      'Are you sure you want to delete this note?'
    )

  if (!confirmed) {
    return
  }

  try {

    await api.delete(
      `/Notes/${id}`
    )

    // Remove from screen immediately

    notes.value =
      notes.value.filter(
        note => note.id !== id
      )

    console.log(
      'NOTE DELETED:',
      id
    )

  } catch (err: any) {

    console.error(
      'DELETE NOTE ERROR:',
      err
    )

    error.value =
      err.response?.data?.message ||
      'Failed to delete note.'

    if (err.response?.status === 401) {

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      router.push('/login')
    }
  }
}


// ==========================================
// LOGOUT
// ==========================================

const logout = () => {

  localStorage.removeItem('token')

  localStorage.removeItem('user')

  router.push('/login')
}


// ==========================================
// CREATE NOTE
// ==========================================

const goToCreateNote = () => {

  router.push('/notes/create')
}


// ==========================================
// VIEW NOTE
// ==========================================

const viewNote = (id: number) => {

  router.push(
    `/notes/${id}`
  )
}


// ==========================================
// EDIT NOTE
// ==========================================

const editNote = (id: number) => {

  router.push(
    `/notes/${id}/edit`
  )
}


// ==========================================
// LOAD NOTES WHEN PAGE OPENS
// ==========================================

onMounted(() => {
  getNotes()
})
</script>


<template>

  <div
    class="min-h-screen bg-gray-100"
  >

    <!-- ================================== -->
    <!-- HEADER -->
    <!-- ================================== -->

    <header
      class="bg-white border-b"
    >

      <div
        class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"
      >

        <h1
          class="text-2xl font-bold"
        >
       NoteMe
        </h1>


        <div class="flex gap-3">

          <button
            @click="goToCreateNote"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Create Note
          </button>


          <button
            @click="logout"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Logout
          </button>

        </div>

      </div>

    </header>


    <!-- ================================== -->
    <!-- MAIN -->
    <!-- ================================== -->

    <main
      class="max-w-6xl mx-auto px-6 py-8"
    >

      <!-- SEARCH + SORT -->

      <div
        class="bg-white rounded-xl shadow p-5 mb-6"
      >

        <div
          class="flex flex-col md:flex-row gap-4"
        >

          <!-- SEARCH -->

          <input
            v-model="search"
            type="text"
            placeholder="Search notes..."
            class="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />


          <!-- SORT -->

          <select
            v-model="sortBy"
            class="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

            <option value="title">
              Title
            </option>

          </select>

        </div>

      </div>


      <!-- ERROR -->

      <div
        v-if="error"
        class="bg-red-100 text-red-700 border border-red-200 rounded-lg p-4 mb-6"
      >
        {{ error }}
      </div>


      <!-- LOADING -->

      <div
        v-if="loading"
        class="text-center py-10 text-gray-500"
      >
        Loading notes...
      </div>


      <!-- ================================== -->
      <!-- NOTES -->
      <!-- ================================== -->

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >

        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
        >

          <!-- TITLE -->

          <h2
            class="text-xl font-bold mb-3"
          >
            {{ note.title }}
          </h2>


          <!-- CONTENT -->

          <p
            class="text-gray-600 mb-5 line-clamp-4"
          >
            {{ note.content }}
          </p>


          <!-- DATE -->

          <p
            class="text-sm text-gray-400 mb-4"
          >
            Created:
            {{ new Date(note.createdAt).toLocaleString() }}
          </p>


          <!-- ACTIONS -->

          <div
            class="flex gap-2"
          >

            <button
              @click="viewNote(note.id)"
              class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
            >
              View
            </button>


            <button
              @click="editNote(note.id)"
              class="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200"
            >
              Edit
            </button>


            <button
              @click="deleteNote(note.id)"
              class="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200"
            >
              Delete
            </button>

          </div>

        </div>

      </div>


      <!-- ================================== -->
      <!-- NO NOTES -->
      <!-- ================================== -->

      <div
        v-if="
          !loading &&
          filteredNotes.length === 0
        "
        class="bg-white rounded-xl shadow p-10 text-center"
      >

        <h2
          class="text-xl font-semibold mb-2"
        >
          No notes found
        </h2>

        <p
          class="text-gray-500 mb-5"
        >
          Create your first note.
        </p>

        <button
          @click="goToCreateNote"
          class="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          Create Note
        </button>

      </div>

    </main>

  </div>

</template>