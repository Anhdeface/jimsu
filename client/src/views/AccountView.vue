<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SnowEffect from '@/components/SnowEffect.vue'

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
  <div class="page-wrapper account-wrapper">
    <SnowEffect />
    
    <div class="container account-container">
      <div class="user-info">
        <h2 class="welcome-text">Xin chào, {{ authStore.user?.username }}!</h2>
        <div class="actions">
          <router-link to="/upload" class="btn btn-primary">
            <i class="bi bi-cloud-upload"></i> Upload Nhạc
          </router-link>
          <button @click="handleLogout" class="btn btn-danger">
            <i class="bi bi-box-arrow-right"></i> Đăng xuất
          </button>
        </div>
      </div>

      <div class="history-section mt-5">
        <h4 class="mb-4"><i class="bi bi-clock-history"></i> Lịch sử nghe nhạc</h4>
        
        <div v-if="historySongs.length === 0" class="text-muted">
          Bạn chưa nghe bài hát nào.
        </div>
        
        <div v-else class="history-list">
          <router-link v-for="song in historySongs" :key="song.id_songs" :to="`/listen/${song.song_eng}`" class="history-item">
            <img :src="song.path_img.startsWith('/') ? song.path_img : `/uploads/${song.path_img}`" alt="Cover" class="history-img" />
            <div class="history-info">
              <h5>{{ song.name_song }}</h5>
              <div class="small text-muted">{{ song.author }}</div>
            </div>
            <i class="bi bi-play-circle-fill play-icon"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-wrapper {
  background: transparent;
}

.account-container {
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.welcome-text {
  margin: 0;
  color: #0d6efd;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}
.btn-danger:hover {
  background-color: #bb2d3b;
  border-color: #b02a37;
}

.mt-5 { margin-top: 3rem; }
.mb-4 { margin-bottom: 1.5rem; }
.text-muted { color: #6c757d; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eee;
}

.history-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.history-item:hover .play-icon {
  color: #0d6efd;
}

.history-img {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 15px;
}

.history-info h5 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #333;
}

.play-icon {
  margin-left: auto;
  font-size: 1.5rem;
  color: #ccc;
  transition: color 0.2s;
}
</style>
