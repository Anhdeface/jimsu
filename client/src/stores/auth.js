import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    checked: false
  }),
  actions: {
    async fetchMe() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          this.user = await res.json()
        } else {
          this.user = null
        }
      } catch (err) {
        this.user = null
      } finally {
        this.checked = true
      }
    },
    async logout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        this.user = null
      } catch (err) {
        console.error('Logout error:', err)
      }
    }
  }
})
