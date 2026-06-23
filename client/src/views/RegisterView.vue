<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

const isFormValid = computed(() => {
  return username.value.trim().length > 0 && password.value.trim().length > 0
})

function sanitizeUsername() {
  username.value = username.value.replace(/[^\w]/g, '')
}

async function register() {
  const user = username.value.trim()
  const pass = password.value.trim()

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    })

    const data = await res.json()

    if (res.ok && data.success) {
      const audio = new Audio('https://cdn.pixabay.com/audio/2022/10/16/audio_12b6fae5b3.mp3')
      audio.play().catch(e => console.log('Autoplay prevented:', e))

      await authStore.fetchMe()

      Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: 'top-end'
      }).then(() => {
        router.push('/')
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Đăng ký thất bại!',
        text: data.message || 'Có lỗi xảy ra.',
        showConfirmButton: true
      })
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi kết nối!',
      text: 'Không thể kết nối tới máy chủ.',
      showConfirmButton: true
    })
  }
}
</script>

<template>
  <div class="page-wrapper login-wrapper">
    <div class="login-card card">
      <div class="text-center mb-2">
        <i class="bi bi-music-note-beamed music-icon"></i>
      </div>
      <h3 class="text-center">Đăng ký</h3>
      <div class="text-center mb-4">
        <router-link to="/login" class="text-secondary" style="text-decoration: none;">Đăng nhập</router-link>
      </div>
      
      <form @submit.prevent="register" autocomplete="off">
        <div class="mb-3">
          <label for="username">Tài khoản</label>
          <input type="text" v-model="username" @input="sanitizeUsername" id="username" class="form-control" maxlength="20" required placeholder="Nhập tài khoản" />
        </div>
        <div class="mb-4">
          <label for="password">Mật khẩu</label>
          <input type="password" v-model="password" id="password" class="form-control" maxlength="35" required placeholder="Nhập mật khẩu" />
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="!isFormValid">Register</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  margin: 0 15px;
}

.music-icon {
  font-size: 3rem;
  color: #0d6efd;
  display: inline-block;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.text-center { text-align: center; }
.text-secondary { color: #6c757d; }
.w-100 { width: 100%; }

label {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style>
