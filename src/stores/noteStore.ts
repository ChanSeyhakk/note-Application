
import { defineStore } from 'pinia'
import api from '../services/api'

export interface Note {
  id: number
  userId: number
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
}

export const useNoteStore = defineStore('note', {
  state: () => ({
    notes: [] as Note[],
    loading: false,
    error: ''
  }),

  actions: {
    async getNotes() {
      try {
        this.loading = true
        this.error = ''

        const response = await api.get<Note[]>('/Notes')

        this.notes = response.data
      } catch (err) {
        console.error(err)

        this.error = 'Failed to load notes.'
      } finally {
        this.loading = false
      }
    }
  }
})

