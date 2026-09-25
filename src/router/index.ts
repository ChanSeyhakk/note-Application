import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import NotesView from '../views/NotesView.vue'
import CreateNoteView from '../views/CreateNoteView.vue'
import EditNoteView from '../views/EditNoteView.vue'
import NoteDetailsView from '../views/NoteDetailsView.vue'

const router = createRouter({
  history: createWebHashHistory(
    import.meta.env.BASE_URL
  ),

  routes: [
    {
      path: '/',
      redirect: '/login'
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView
    },

    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },

    {
      path: '/notes',
      name: 'notes',
      component: NotesView,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/notes/create',
      name: 'create-note',
      component: CreateNoteView,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/notes/:id/edit',
      name: 'edit-note',
      component: EditNoteView,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/notes/:id',
      name: 'note-details',
      component: NoteDetailsView,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  const isAuthenticated = !!token

  if (
    to.meta.requiresAuth &&
    !isAuthenticated
  ) {
    return {
      name: 'login'
    }
  }

  if (
    (to.name === 'login' ||
      to.name === 'register') &&
    isAuthenticated
  ) {
    return {
      name: 'notes'
    }
  }

  return true
})

export default router