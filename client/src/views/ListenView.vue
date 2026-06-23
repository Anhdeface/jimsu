<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AudioVisualizer from '@/components/AudioVisualizer.vue'

const route = useRoute()
const router = useRouter()

const song = ref(null)
const audioElement = ref(null)
const isPlaying = ref(false)
const errorMsg = ref('')

async function fetchSong() {
  try {
    const slug = route.params.slug
    const res = await fetch(`/api/songs/${slug}`, { credentials: 'include' })
    if (res.ok) {
      song.value = await res.json()
    } else {
      errorMsg.value = 'Bài hát không tồn tại.'
    }
  } catch (err) {
    errorMsg.value = 'Lỗi kết nối.'
  }
}

let hasRecordedListen = false

function onPlay() {
  isPlaying.value = true
  if (!hasRecordedListen && song.value) {
    hasRecordedListen = true
    fetch(`/api/songs/${route.params.slug}/listen`, { 
      method: 'POST',
      credentials: 'include'
    }).catch(err => console.error('Failed to record history', err))
  }
}

function onPause() {
  isPlaying.value = false
}

function setupMediaSession() {
  if ('mediaSession' in navigator && song.value) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.value.name_song,
      artist: song.value.author,
      album: 'Jimsu',
      artwork: [
        { 
          src: song.value.path_img.startsWith('/') ? song.value.path_img : `/uploads/${song.value.path_img}`, 
          sizes: '512x512', 
          type: 'image/jpeg' 
        }
      ]
    })
  }
}

onMounted(async () => {
  await fetchSong()
  if (song.value) {
    setupMediaSession()
  }
})

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause()
  }
})
</script>

<template>
  <div class="page-wrapper listen-wrapper">
    <div class="container text-center" v-if="errorMsg">
      <h3 class="mt-5 text-danger">{{ errorMsg }}</h3>
      <button class="btn btn-primary mt-3" @click="router.push('/')">Quay lại trang chủ</button>
    </div>

    <div class="container" v-else-if="song">
      <div class="player-card card">
        <div class="cover-wrapper" :class="{ 'playing': isPlaying }">
          <img :src="song.path_img.startsWith('/') ? song.path_img : `/uploads/${song.path_img}`" alt="Cover" class="album-cover" />
        </div>
        
        <h2 class="song-title">{{ song.name_song }}</h2>
        <p class="song-author"><i class="bi bi-person-badge"></i> {{ song.author }}</p>
        <p class="song-poster small text-muted"><i class="bi bi-person-circle"></i> Người tải lên: {{ song.poster }}</p>

        <AudioVisualizer :audioElement="audioElement" :isPlaying="isPlaying" />

        <audio 
          ref="audioElement" 
          controls 
          class="audio-player" 
          :src="song.path_song.startsWith('/') ? song.path_song : `/uploads/${song.path_song}`"
          @play="onPlay" 
          @pause="onPause" 
          @ended="onPause"
        ></audio>
      </div>
    </div>
  </div>
</template>

<style scoped>
.listen-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
}

.player-card {
  max-width: 500px;
  margin: 0 auto;
  padding: 30px 20px;
  text-align: center;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.cover-wrapper {
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  animation: spin 10s linear infinite;
  animation-play-state: paused;
}

.cover-wrapper.playing {
  animation-play-state: running;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: #333;
}

.song-author {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 15px;
}

.audio-player {
  width: 100%;
  margin-top: 15px;
  outline: none;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.text-danger { color: #dc3545; }
.mt-3 { margin-top: 1rem; }
.mt-5 { margin-top: 3rem; }
.text-center { text-align: center; }
.text-muted { color: #6c757d; }
.small { font-size: 0.85rem; }
</style>
