<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isVisible = ref(false)
const dontShowToday = ref(false)

function checkPopup() {
  // Chờ authStore kiểm tra đăng nhập xong
  if (!authStore.checked) return
  
  // Nếu đã đăng nhập thì không hiện
  if (authStore.user) return

  // Kiểm tra localStorage
  const hideDate = localStorage.getItem('jimsu_popup_hidden')
  const today = new Date().toDateString()
  
  if (hideDate !== today) {
    // Delay một chút cho mượt mà
    setTimeout(() => {
      isVisible.value = true
    }, 1000)
  }
}

watch(() => authStore.checked, checkPopup)

onMounted(() => {
  checkPopup()
})

function closePopup() {
  if (dontShowToday.value) {
    const today = new Date().toDateString()
    localStorage.setItem('jimsu_popup_hidden', today)
  }
  isVisible.value = false
}

function goToLogin() {
  closePopup()
  router.push('/login')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="isVisible" class="popup-overlay" @click.self="closePopup">
        <div class="popup-box">
          <button class="btn-close-popup" @click="closePopup"><i class="bi bi-x-lg"></i></button>
          
          <div class="popup-icon">
            <i class="bi bi-music-player-fill"></i>
          </div>
          
          <h3 class="popup-title">Chào mừng đến với Jimsu!</h3>
          <p class="popup-text">Đăng nhập ngay để lưu lại lịch sử nghe nhạc và tải lên những bài hát bạn yêu thích.</p>
          
          <button class="btn btn-primary btn-login-now" @click="goToLogin">
            Đăng nhập ngay
          </button>
          
          <div class="form-check dont-show-check">
            <input type="checkbox" class="form-check-input" id="dontShowToday" v-model="dontShowToday">
            <label class="form-check-label" for="dontShowToday">Không hiện lại hôm nay</label>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 10, 30, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.popup-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 40px 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(99, 102, 241, 0.15);
}

.btn-close-popup {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}
.btn-close-popup:hover {
  color: var(--text-primary);
}

.popup-icon {
  font-size: 4rem;
  color: var(--accent);
  margin-bottom: 20px;
  background: linear-gradient(135deg, #6366f1, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.popup-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.popup-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 30px;
  line-height: 1.5;
}

.btn-login-now {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  margin-bottom: 20px;
  border-radius: 12px;
}

.dont-show-check {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.dont-show-check input {
  cursor: pointer;
}
.dont-show-check label {
  cursor: pointer;
  margin: 0;
}

/* Animations */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}
.fade-scale-enter-from .popup-box,
.fade-scale-leave-to .popup-box {
  transform: scale(0.9);
}
</style>
