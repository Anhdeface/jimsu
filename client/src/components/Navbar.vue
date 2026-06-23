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
  window.addEventListener('scroll', onScroll)
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
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.4s ease;
  padding: 1rem 0;
}

.navbar-hidden {
  transform: translateY(-100%);
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
}

.navbar-brand {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-brand i {
  color: #0d6efd;
}

.navbar-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.5rem;
}

.nav-link {
  color: #555;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}

.nav-link:hover, .nav-link.active {
  color: #0d6efd;
}

@media (max-width: 768px) {
  .nav-link span { display: none; }
  .navbar-nav { gap: 1rem; }
}
</style>
