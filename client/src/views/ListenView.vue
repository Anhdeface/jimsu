<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AudioVisualizer from '@/components/AudioVisualizer.vue'

const route = useRoute()
const router = useRouter()

const song = ref(null)
const audioElement = ref(null)
const isPlaying = ref(false)
const errorMsg = ref('')

// Player states
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)

// New states: Replay & Sleep Timer
const isLooping = ref(false)
const sleepTimer = ref(0) // minutes
let sleepTimeout = null

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

function togglePlay() {
  if (!audioElement.value) return
  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}

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

function onTimeUpdate() {
  if (!audioElement.value) return
  currentTime.value = audioElement.value.currentTime
}

function onLoadedMetadata() {
  if (!audioElement.value) return
  duration.value = audioElement.value.duration
}

function onEnded() {
  if (!isLooping.value) {
    isPlaying.value = false
  }
}

function seek(e) {
  if (!audioElement.value) return
  const time = parseFloat(e.target.value)
  audioElement.value.currentTime = time
  currentTime.value = time
}

function changeVolume(e) {
  if (!audioElement.value) return
  const vol = parseFloat(e.target.value)
  audioElement.value.volume = vol
  volume.value = vol
}

function toggleLoop() {
  isLooping.value = !isLooping.value
  if (audioElement.value) {
    audioElement.value.loop = isLooping.value
  }
}

function cycleSleepTimer() {
  const options = [0, 15, 30, 60]
  const currentIndex = options.indexOf(sleepTimer.value)
  const nextIndex = (currentIndex + 1) % options.length
  sleepTimer.value = options[nextIndex]

  if (sleepTimeout) clearTimeout(sleepTimeout)
  if (sleepTimer.value > 0) {
    sleepTimeout = setTimeout(() => {
      if (audioElement.value) audioElement.value.pause()
      sleepTimer.value = 0
    }, sleepTimer.value * 60 * 1000)
  }
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec < 10 ? '0' : ''}${sec}`
}

function setupMediaSession() {
  if ('mediaSession' in navigator && song.value) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.value.name_song,
      artist: song.value.author,
      album: 'Jimsu',
      artwork: [
        { 
          src: coverUrl.value,
          sizes: '512x512', 
          type: 'image/jpeg' 
        }
      ]
    })
    navigator.mediaSession.setActionHandler('play', () => { audioElement.value?.play() })
    navigator.mediaSession.setActionHandler('pause', () => { audioElement.value?.pause() })
  }
}

const coverUrl = computed(() => {
  if (!song.value) return ''
  if (song.value.path_img.startsWith('/')) return song.value.path_img
  return `/uploads/${song.value.path_img}`
})

const audioUrl = computed(() => {
  if (!song.value) return ''
  if (song.value.path_file) {
    return song.value.path_file.startsWith('/') ? song.value.path_file : `/uploads/${song.value.path_file}`
  }
  if (song.value.path_song) {
    return song.value.path_song.startsWith('/') ? song.value.path_song : `/uploads/${song.value.path_song}`
  }
  return ''
})

onMounted(async () => {
  // Prevent scrolling on this specific view
  document.body.style.overflow = 'hidden'
  
  await fetchSong()
  if (song.value) {
    setupMediaSession()
  }
})

onUnmounted(() => {
  document.body.style.overflow = '' // Restore scrolling globally
  if (audioElement.value) {
    audioElement.value.pause()
  }
  if (sleepTimeout) clearTimeout(sleepTimeout)
})
</script>

<template>
  <div class="listen-wrapper">
    <div class="container text-center h-100 d-flex align-items-center justify-content-center" v-if="errorMsg">
      <div class="error-box">
        <i class="bi bi-exclamation-triangle"></i>
        <h3>{{ errorMsg }}</h3>
        <button class="btn btn-primary mt-3" @click="router.push('/')">Về trang chủ</button>
      </div>
    </div>

    <!-- Main Player UI -->
    <div class="player-container" v-else-if="song">
      
      <!-- Lớn, ở giữa: Hình ảnh (tự động co dãn cho vừa màn hình) -->
      <div class="cover-section">
        <div class="cover-wrapper" :class="{ 'playing': isPlaying }">
          <img :src="coverUrl" alt="Cover" class="album-cover" />
        </div>
      </div>

      <!-- Phía dưới: Thông tin bài hát -->
      <div class="info-section">
        <h1 class="song-title">{{ song.name_song }}</h1>
        <div class="song-meta">
          <span class="meta-left">Upload by <strong class="highlight-text">{{ song.poster }}</strong></span>
          <span class="meta-right">Tác giả: <strong class="highlight-text">{{ song.author }}</strong></span>
        </div>
      </div>

      <!-- Phần Cava & Progress Bar -->
      <div class="progress-section">
        <!-- Cava thu nhỏ, nằm đè lên trên thanh progress -->
        <div class="cava-wrapper">
          <AudioVisualizer 
            :audioElement="audioElement" 
            :isPlaying="isPlaying" 
            colorStart="rgba(129, 140, 248, 0.4)" 
            colorEnd="rgba(99, 102, 241, 0.1)" 
          />
        </div>
        
        <div class="progress-bar-row">
          <span class="time-text">{{ formatTime(currentTime) }}</span>
          <input 
            type="range" 
            class="progress-bar" 
            min="0" 
            :max="duration || 100" 
            step="0.1" 
            :value="currentTime"
            @input="seek"
          />
          <span class="time-text">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Controls Row: Volume, Play, Tools -->
      <div class="controls-section">
        <!-- Trái: Volume -->
        <div class="controls-left">
          <i class="bi" :class="volume === 0 ? 'bi-volume-mute-fill' : (volume < 0.5 ? 'bi-volume-down-fill' : 'bi-volume-up-fill')"></i>
          <input 
            type="range" 
            class="volume-slider" 
            min="0" 
            max="1" 
            step="0.01" 
            :value="volume"
            @input="changeVolume"
          />
        </div>

        <!-- Giữa: Play / Pause -->
        <div class="controls-center">
          <button class="btn-play-pause" @click="togglePlay">
            <i class="bi" :class="isPlaying ? 'bi-pause-fill' : 'bi-play-fill'"></i>
          </button>
        </div>

        <!-- Phải: Replay & Timer -->
        <div class="controls-right">
          <button 
            class="tool-btn" 
            :class="{ 'active': isLooping }" 
            @click="toggleLoop" 
            title="Lặp lại"
          >
            <i class="bi bi-repeat"></i>
          </button>
          
          <button 
            class="tool-btn timer-btn" 
            :class="{ 'active': sleepTimer > 0 }" 
            @click="cycleSleepTimer" 
            :title="sleepTimer > 0 ? `Tắt nhạc sau ${sleepTimer} phút` : 'Hẹn giờ tắt'"
          >
            <i class="bi bi-alarm"></i>
            <span class="timer-badge" v-if="sleepTimer > 0">{{ sleepTimer }}m</span>
          </button>
        </div>
      </div>

      <!-- Hidden Audio Element -->
      <audio 
        ref="audioElement" 
        :src="audioUrl"
        @play="onPlay" 
        @pause="onPause" 
        @ended="onEnded"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        crossorigin="anonymous"
      ></audio>
    </div>
  </div>
</template>

<style scoped>
/* Reset Wrapper để không bị cuộn */
.listen-wrapper {
  width: 100vw;
  height: 100vh;
  padding-top: 70px; /* Bù chỗ cho Navbar */
  box-sizing: border-box;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.player-container {
  width: 100%;
  max-width: 900px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 40px;
}

/* ================== COVER SECTION (Co dãn) ================== */
.cover-section {
  flex: 1; /* Chiếm tối đa không gian còn lại */
  min-height: 0; /* Cho phép cover thu nhỏ nếu màn hình thấp */
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 20px;
}

.cover-wrapper {
  aspect-ratio: 1/1; /* Luôn giữ hình vuông */
  height: 100%; /* Ưu tiên lấy chiều cao */
  max-height: 400px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(99, 102, 241, 0.1);
  transition: transform 0.4s var(--ease-spring), box-shadow 0.4s;
  border: 1px solid rgba(255,255,255,0.05);
}

.cover-wrapper.playing {
  transform: scale(1.03);
  box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 80px rgba(99, 102, 241, 0.25);
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ================== INFO SECTION ================== */
.info-section {
  flex-shrink: 0;
  text-align: center;
  margin-bottom: 20px;
}

.song-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 15px;
  letter-spacing: -0.5px;
}

.song-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: var(--text-muted);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 15px;
}

.meta-left { text-align: left; }
.meta-right { text-align: right; }

.highlight-text {
  color: var(--accent-light);
  font-weight: 600;
}

/* ================== PROGRESS & CAVA ================== */
.progress-section {
  flex-shrink: 0;
  width: 100%;
  position: relative;
  margin-bottom: 30px;
}

.cava-wrapper {
  position: absolute;
  bottom: 20px; /* Đặt chân sóng ngay trên progress bar */
  left: 0;
  width: 100%;
  height: 80px; /* Độ cao cột sóng nhỏ gọn */
  pointer-events: none; /* Không block sự kiện click */
  z-index: 1;
}
/* Ép height thực tế của AudioVisualizer bên trong */
.cava-wrapper :deep(.visualizer-container) {
  height: 100%;
  margin: 0;
}

.progress-bar-row {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 2; /* Nổi lên trên Cava */
}

.time-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 50px;
}

.progress-bar {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-light);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(129, 140, 248, 0.8);
  transition: transform 0.2s;
}

.progress-bar::-webkit-slider-thumb:hover {
  transform: scale(1.4);
}

/* ================== CONTROLS ================== */
.controls-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
}

.controls-left, .controls-right {
  display: flex;
  align-items: center;
  flex: 1;
}

.controls-left {
  gap: 12px;
  justify-content: flex-start;
}

.controls-right {
  gap: 20px;
  justify-content: flex-end;
}

.controls-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Volume */
.controls-left i {
  font-size: 1.5rem;
  color: var(--text-secondary);
}
.volume-slider {
  width: 100px;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
}
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text-primary);
  cursor: pointer;
}

/* Play Button */
.btn-play-pause {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
  width: 75px;
  height: 75px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s var(--ease-spring), box-shadow 0.2s;
  padding-left: 5px; /* Cân bằng icon play */
}
.btn-play-pause:hover {
  transform: scale(1.1);
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.6);
}
.btn-play-pause:active {
  transform: scale(0.95);
}

/* Tool Buttons (Loop, Timer) */
.tool-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  position: relative;
}
.tool-btn:hover {
  color: var(--text-primary);
  transform: scale(1.1);
}
.tool-btn.active {
  color: var(--accent-light);
}

.timer-btn {
  display: flex;
  align-items: center;
}
.timer-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background: var(--accent);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
}

/* ERROR STATE */
.error-box {
  padding: 40px;
}
.error-box i {
  font-size: 4rem;
  color: #ef4444;
}

@media (max-width: 640px) {
  .volume-slider { width: 70px; }
  .btn-play-pause { width: 65px; height: 65px; font-size: 2.2rem; }
  .controls-section { padding: 0; }
  .song-title { margin-bottom: 5px; }
}
</style>
