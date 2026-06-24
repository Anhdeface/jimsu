<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const hidden = ref(false)
let lastScrollTop = 0

function onScroll() {
  const st = window.pageYOffset || document.documentElement.scrollTop
  if (st > lastScrollTop && st > 80) {
    hidden.value = true
  } else {
    hidden.value = false
  }
  lastScrollTop = Math.max(st, 0)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <nav class="navbar" :class="{ 'navbar-hidden': hidden }">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-music-note-beamed"></i> Jimsu
      </router-link>

      <ul class="navbar-nav">
        <li>
          <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }">
            <i class="bi bi-house-door"></i> Home
          </router-link>
        </li>
        <li>
          <router-link to="/account" class="nav-link" :class="{ active: route.path === '/account' }">
            <i class="bi bi-person-circle"></i> Tài khoản
          </router-link>
        </li>
        <li>
          <router-link to="/about" class="nav-link" :class="{ active: route.path === '/about' }">
            <i class="bi bi-info-circle"></i> Giới thiệu
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(15, 10, 30, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  padding: 0.85rem 0;
}

.navbar-hidden {
  transform: translateY(-100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.navbar-brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e2e8f0;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}

.navbar-brand i {
  color: #818cf8;
  font-size: 1.3rem;
}

.navbar-brand:hover {
  color: #fff;
}

.navbar-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
}

.nav-link {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  transition: color 0.2s cubic-bezier(0.25, 1, 0.5, 1),
              background 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.nav-link:hover {
  color: #c7d2fe;
  background: rgba(99, 102, 241, 0.1);
}

.nav-link.active {
  color: #fff;
  background: rgba(99, 102, 241, 0.2);
}

/* Performance mode: tắt blur */
:global(.performance-mode) .navbar,
:global(.tier-low) .navbar {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: rgba(15, 10, 30, 0.95);
}

@media (max-width: 768px) {
  .navbar-nav { gap: 0.25rem; }
  .nav-link { padding: 8px 10px; font-size: 0.82rem; }
}
</style>
