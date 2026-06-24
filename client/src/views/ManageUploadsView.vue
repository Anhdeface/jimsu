<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const myUploads = ref([])
const isLoading = ref(true)

// Modal State
const showModal = ref(false)
const songToDelete = ref(null)
const pass2 = ref('')
const deleteError = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  if (!authStore.checked) {
    await authStore.fetchMe()
  }
  if (!authStore.user) {
    router.push('/login')
    return
  }
  await fetchMyUploads()
})

async function fetchMyUploads() {
  try {
    const res = await fetch('/api/songs/my-uploads', { credentials: 'include' })
    if (res.ok) {
      myUploads.value = await res.json()
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function promptDelete(song) {
  if (!authStore.user.hasPass2) {
    alert('Bạn cần thiết lập Mật khẩu cấp 2 trong phần Cài đặt trước khi có thể xoá bài hát.')
    router.push('/account/settings')
    return
  }
  songToDelete.value = song
  pass2.value = ''
  deleteError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  songToDelete.value = null
  pass2.value = ''
}

async function confirmDelete() {
  if (!pass2.value) {
    deleteError.value = 'Vui lòng nhập mật khẩu cấp 2'
    return
  }

  isDeleting.value = true
  deleteError.value = ''

  try {
    const res = await fetch(`/api/songs/${songToDelete.value.id_songs}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass2: pass2.value })
    })
    const data = await res.json()

    if (res.ok && data.success) {
      // Remove from list
      myUploads.value = myUploads.value.filter(s => s.id_songs !== songToDelete.value.id_songs)
      closeModal()
      // Tuỳ chọn: Hiện toast xoá thành công
    } else {
      deleteError.value = data.message || 'Xoá thất bại'
    }
  } catch (err) {
    deleteError.value = 'Lỗi kết nối máy chủ'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="manage-page container">
    <div class="header-nav">
      <router-link to="/account" class="back-btn"><i class="bi bi-arrow-left"></i> Quay lại</router-link>
      <h2 class="page-title">Quản lý nhạc của tôi</h2>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner-border text-primary" role="status"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="myUploads.length === 0" class="empty-state">
      <i class="bi bi-cloud-slash"></i>
      <p class="mb-5">Bạn chưa tải lên bài hát nào. Hãy bắt đầu chia sẻ âm nhạc của bạn!</p>
      <router-link to="/upload" class="btn btn-primary px-5 py-3 mt-4" style="border-radius: 14px;">Tải nhạc lên ngay</router-link>
    </div>

    <div v-else class="uploads-list">
      <div v-for="song in myUploads" :key="song.id_songs" class="upload-item">
        <div class="song-info-group">
          <img :src="song.path_img.startsWith('/') ? song.path_img : `/uploads/${song.path_img}`" class="song-cover" alt="Cover" />
          <div class="song-meta">
            <h4 class="song-title">{{ song.name_song }}</h4>
            <p class="song-author">{{ song.author }}</p>
          </div>
        </div>
        <div class="actions-group">
          <router-link :to="`/listen/${song.song_eng}`" class="btn btn-sm btn-outline-light"><i class="bi bi-play-fill"></i> Nghe</router-link>
          <button @click="promptDelete(song)" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i> Xoá</button>
        </div>
      </div>
    </div>

    <!-- Modal Delete -->
    <Teleport to="body">
      <Transition name="fade-scale">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">
            <button class="btn-close-modal" @click="closeModal"><i class="bi bi-x-lg"></i></button>
            <div class="modal-icon text-danger">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <h3>Xoá bài hát</h3>
            <p class="text-muted">Bạn có chắc muốn xoá bài hát <strong>{{ songToDelete?.name_song }}</strong> vĩnh viễn không? Tác vụ này xoá cả file trên máy chủ và không thể hoàn tác.</p>
            
            <div class="form-group mb-3 text-start">
              <label>Mật khẩu cấp 2</label>
              <input type="password" v-model="pass2" class="form-control mt-1" placeholder="Nhập mật khẩu cấp 2" @keyup.enter="confirmDelete">
              <small v-if="deleteError" class="text-danger mt-1 d-block">{{ deleteError }}</small>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" @click="closeModal" :disabled="isDeleting">Huỷ</button>
              <button class="btn btn-danger" @click="confirmDelete" :disabled="isDeleting">
                {{ isDeleting ? 'Đang xoá...' : 'Xác nhận Xoá' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.manage-page {
  padding-top: 100px;
  padding-bottom: 60px;
  max-width: 900px;
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

.loading-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
}
.empty-state i {
  font-size: 4rem;
  margin-bottom: 15px;
  display: block;
}
.empty-state p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.uploads-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upload-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: background 0.2s;
}
.upload-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.song-info-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.song-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.song-title {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.song-author {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.actions-group {
  display: flex;
  gap: 10px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.btn-close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}
.btn-close-modal:hover { color: white; }

.modal-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.form-control {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: white;
}
.form-control:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}
.modal-actions .btn {
  flex: 1;
}

@media (max-width: 500px) {
  .upload-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .actions-group {
    width: 100%;
    justify-content: flex-end;
  }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
