<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const historySongs = ref([])

onMounted(async () => {
  try {
    const res = await fetch('/api/songs/history/me', { credentials: 'include' })
    if (res.ok) {
      historySongs.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching history:', err)
  }
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="account-wrapper">
    <!-- Hero Banner (Không cho phép đổi ảnh, lấy nền chung làm mờ) -->
    <div class="hero-header">
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <div class="user-profile">
          <div class="avatar-circle">
            {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div class="user-details">
            <h1 class="username">{{ authStore.user?.username }}</h1>
            <p class="user-status">Thành viên Jimsu</p>
          </div>
        </div>
        <div class="hero-actions">
          <router-link to="/account/manage" class="btn btn-outline">
            <i class="bi bi-music-note-list"></i> Quản lý nhạc
          </router-link>
          <router-link to="/account/settings" class="btn btn-outline">
            <i class="bi bi-gear"></i> Cài đặt
          </router-link>
          <router-link to="/upload" class="btn btn-upload">
            <i class="bi bi-cloud-upload"></i> Tải lên
          </router-link>
          <button @click="handleLogout" class="btn btn-logout" title="Đăng xuất">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- History List (Không dùng Card) -->
    <div class="container history-container">
      <h3 class="section-title"><i class="bi bi-clock-history"></i> Nghe gần đây</h3>
      
      <div v-if="historySongs.length === 0" class="empty-state">
        <i class="bi bi-music-note-list"></i>
        <p>Bạn chưa nghe bài hát nào. Hãy khám phá Jimsu ngay!</p>
      </div>
      
      <div v-else class="history-list">
        <router-link 
          v-for="song in historySongs" 
          :key="song.id_songs" 
          :to="`/listen/${song.song_eng}`" 
          class="history-row"
        >
          <div class="history-left">
            <img :src="song.path_img.startsWith('/') ? song.path_img : `/uploads/${song.path_img}`" alt="Cover" class="history-cover" />
            <div class="history-info">
              <h4 class="song-name">{{ song.name_song }}</h4>
              <p class="song-author">{{ song.author }}</p>
            </div>
          </div>
          <div class="history-right">
            <i class="bi bi-play-circle-fill play-icon"></i>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-wrapper {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 60px;
}

/* ================= HERO HEADER ================= */
.hero-header {
  position: relative;
  width: 100%;
  height: 250px;
  background: linear-gradient(135deg, #0f0a1e 0%, #1a1145 50%, #0c1222 100%);
  display: flex;
  align-items: flex-end;
  padding-bottom: 30px;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://www.transparenttextures.com/patterns/cubes.png');
  opacity: 0.05;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #c084fc);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
  border: 4px solid var(--bg-primary);
  transform: translateY(20px); /* Kéo avatar xệ xuống một chút */
}

.user-details {
  transform: translateY(10px);
}

.username {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.user-status {
  color: var(--text-muted);
  font-size: 1rem;
  margin: 5px 0 0;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.btn-upload {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-upload:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-logout {
  background: transparent;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 10px 15px;
}
.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* ================= HISTORY LIST ================= */
.history-container {
  max-width: 900px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Khoảng cách siêu nhỏ tạo cảm giác list liền mạch */
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-radius: 12px;
  text-decoration: none;
  background: transparent;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.history-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.history-row:hover .play-icon {
  opacity: 1;
  transform: scale(1);
}

.history-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.history-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.song-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.song-author {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.history-right {
  padding-right: 10px;
}

.play-icon {
  font-size: 1.8rem;
  color: var(--accent-light);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s var(--ease-spring);
}

@media (max-width: 640px) {
  .hero-header {
    height: auto;
    padding-top: 100px;
  }
  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .avatar-circle {
    transform: translateY(0);
    margin: 0 auto 15px;
  }
  .user-details {
    transform: translateY(0);
  }
  .history-row {
    padding: 10px;
  }
}
</style>
