/*
  Device Store — Jimsu by QuocAnh
  Lưu trữ thông tin capabilities của thiết bị từ server-side detection
*/

import { defineStore } from 'pinia'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    tier: 'high',        // 'high' | 'medium' | 'low'
    score: 70,
    flags: {
      enable3D: true,
      enableBlur: true,
      enableAnimations: true,
      enablePhysics: true,
      prefersReducedMotion: false
    },
    loaded: false
  }),
  getters: {
    isHighEnd: (state) => state.tier === 'high',
    isLowEnd: (state) => state.tier === 'low'
  },
  actions: {
    async fetchCapabilities() {
      try {
        const res = await fetch('/api/system/capabilities')
        if (res.ok) {
          const data = await res.json()
          this.tier = data.tier
          this.score = data.score
          this.flags = data.flags

          // Gắn class vào body để CSS có thể phản ứng
          document.body.classList.remove('tier-high', 'tier-medium', 'tier-low')
          document.body.classList.add(`tier-${data.tier}`)

          if (!data.flags.enableAnimations) {
            document.body.classList.add('performance-mode')
          }
        }
      } catch (err) {
        console.warn('Device detection failed, using defaults:', err)
      } finally {
        this.loaded = true
      }
    }
  }
})
