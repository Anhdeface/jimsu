<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const pass1 = ref('')
const pass2 = ref('')
const message = ref('')
const isError = ref(false)
const isLoading = ref(false)
const isFormVisible = ref(false)

onMounted(async () => {
  if (!authStore.checked) {
    await authStore.fetchMe()
  }
  if (!authStore.user) {
    router.push('/login')
  }
})

async function saveSettings() {
  if (pass2.value.length < 6) {
    message.value = 'Mật khẩu cấp 2 phải có ít nhất 6 ký tự.'
    isError.value = true
    return
  }

  isLoading.value = true
  message.value = ''
  
  try {
    const res = await fetch('/api/auth/pass2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass1: pass1.value, pass2: pass2.value })
    })
    const data = await res.json()
    
    if (res.ok && data.success) {
      message.value = data.message || 'Cập nhật thành công!'
      isError.value = false
      pass1.value = ''
      pass2.value = ''
      await authStore.fetchMe() // Update hasPass2 state
    } else {
      message.value = data.message || 'Có lỗi xảy ra'
      isError.value = true
    }
  } catch (err) {
    message.value = 'Lỗi kết nối đến máy chủ.'
    isError.value = true
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="settings-page container">
    <div class="header-nav">
      <router-link to="/account" class="back-btn"><i class="bi bi-arrow-left"></i> Quay lại</router-link>
      <h2 class="page-title">Cài đặt tài khoản</h2>
    </div>

    <div class="settings-content">
      <!-- Section: Security -->
      <div class="settings-section">
        <h3 class="section-title"><i class="bi bi-shield-lock"></i> Bảo mật</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4>Mật khẩu cấp 2</h4>
            <p v-if="authStore.user?.hasPass2" class="text-success">Đã thiết lập</p>
            <p v-else class="text-warning">Chưa thiết lập (Cần thiết để xoá bài hát)</p>
          </div>
          <div class="setting-action">
            <button class="btn btn-outline-light btn-sm px-3 py-2" @click="isFormVisible = !isFormVisible">
              {{ isFormVisible ? 'Đóng' : (authStore.user?.hasPass2 ? 'Đổi mật khẩu' : 'Thiết lập ngay') }}
            </button>
          </div>
        </div>
          
        <Transition name="slide-down">
          <form v-if="isFormVisible" @submit.prevent="saveSettings" class="setting-form mt-4">
            <div v-if="authStore.user?.hasPass2" class="mb-4">
              <label class="mb-2 text-muted">Mật khẩu đăng nhập (Cấp 1) <span class="text-danger">*</span></label>
              <input type="password" v-model="pass1" class="form-control form-control-lg custom-rounded" required placeholder="Nhập mật khẩu cấp 1 để xác minh">
            </div>
            
            <div class="mb-5">
              <label class="mb-2 text-muted">Mật khẩu cấp 2 mới <span class="text-danger">*</span></label>
              <input type="password" v-model="pass2" class="form-control form-control-lg custom-rounded" required placeholder="Nhập mật khẩu cấp 2 mới">
            </div>

            <div v-if="message" :class="['alert', 'custom-rounded', isError ? 'alert-danger' : 'alert-success']">
              {{ message }}
            </div>

            <button type="submit" class="btn btn-primary btn-lg px-5 py-3 mt-4 custom-rounded" :disabled="isLoading">
              {{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </form>
        </Transition>
      </div>

      <!-- Tương lai có thể thêm các section khác ở đây (Kéo cuộn dọc) -->
      
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  padding-top: 100px;
  padding-bottom: 60px;
  max-width: 800px;
}

.header-nav {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 40px;
}

.back-btn {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color 0.2s;
}
.back-btn:hover {
  color: var(--text-primary);
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--accent-light);
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-info h4 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}
.setting-info p {
  margin: 0;
  font-size: 0.9rem;
}

.setting-form {
  background: rgba(0, 0, 0, 0.2);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.form-control {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 15px 20px;
}
.custom-rounded {
  border-radius: 14px !important;
}
.form-control:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.alert {
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-bottom: 20px;
}
.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.alert-success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (min-width: 768px) {
  .setting-item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
