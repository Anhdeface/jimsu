<script setup>
/*
  HomeView — Jimsu by QuocAnh
  Trang chủ mới với Hero Banner + 3D Visualizer + Dark Theme
*/

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDeviceStore } from '@/stores/device'
import SongCard from '@/components/SongCard.vue'
import WaveVisualizer3D from '@/components/WaveVisualizer3D.vue'

const router = useRouter()
const device = useDeviceStore()

const songs = ref([])
const loaded = ref(false)

const showVisualizer = computed(() => device.flags.enable3D)
const enablePhysics = computed(() => device.flags.enablePhysics)
const enableAnimations = computed(() => device.flags.enableAnimations)

onMounted(async () => {
  // Fetch capabilities nếu chưa load
  if (!device.loaded) {
    await device.fetchCapabilities()
  }

  // Fetch danh sách bài hát
  try {
    const res = await fetch('/api/songs')
    if (res.ok) {
      songs.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching songs:', err)
  } finally {
    loaded.value = true
  }
})
</script>

<template>
  <div class="home-wrapper" :class="{ 'has-animations': enableAnimations }">

    <!-- ==================== HERO BANNER ==================== -->
    <section class="hero-banner">
      <!-- 3D Visualizer Background (chỉ render trên thiết bị mạnh) -->
      <div v-if="showVisualizer" class="hero-3d-bg">
        <WaveVisualizer3D :enablePhysics="enablePhysics" />
      </div>

      <!-- Gradient overlay để text dễ đọc -->
      <div class="hero-overlay"></div>

      <!-- Nội dung Hero -->
      <div class="hero-content">
        <div class="hero-badge">
          <i class="bi bi-stars"></i> Music Streaming Platform
        </div>
        <h1 class="hero-title">
          Trải Nghiệm Âm Nhạc
          <br />
          <span class="text-gradient">Đỉnh Cao</span>
        </h1>
        <p class="hero-subtitle">
          Khám phá, lưu trữ và thưởng thức bộ sưu tập âm nhạc của riêng bạn.
          <br class="hide-mobile" />
          Chất lượng cao — Hoàn toàn miễn phí.
        </p>
        <div class="hero-actions">
          <button class="btn-primary-glow" @click="router.push('/upload')">
            <i class="bi bi-cloud-arrow-up"></i> Tải Nhạc Lên
          </button>
          <a href="#library" class="btn-ghost">
            <i class="bi bi-collection-play"></i> Khám Phá
          </a>
        </div>

        <!-- Stats mini -->
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{ songs.length }}</span>
            <span class="stat-label">Bài hát</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">MP3</span>
            <span class="stat-label">Chất lượng</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">∞</span>
            <span class="stat-label">Miễn phí</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== LIBRARY SECTION ==================== -->
    <main id="library" class="music-section">
      <div class="section-header">
        <div class="section-tag">
          <i class="bi bi-soundwave"></i>
          <span>Thư viện</span>
        </div>
        <h2 class="section-title">Bài Hát Mới Nhất</h2>
        <div class="section-line"></div>
      </div>

      <!-- Loading state -->
      <div v-if="!loaded" class="loading-grid">
        <div v-for="n in 6" :key="n" class="skeleton-card"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="songs.length === 0" class="empty-state">
        <i class="bi bi-music-note-list"></i>
        <h3>Chưa có bài hát nào</h3>
        <p>Hãy là người đầu tiên tải nhạc lên!</p>
        <button class="btn-primary-glow" @click="router.push('/upload')">
          <i class="bi bi-plus-lg"></i> Tải lên ngay
        </button>
      </div>

      <!-- Songs grid -->
      <div v-else class="grid-layout">
        <div
          v-for="(song, index) in songs"
          :key="song.id_songs"
          class="grid-item"
          :style="enableAnimations ? { animationDelay: `${index * 60}ms` } : {}"
        >
          <SongCard :song="song" />
        </div>
      </div>
    </main>

    <!-- ==================== FOOTER SECTION ==================== -->
    <footer class="home-footer">
      <p>Jimsu &copy; 2025 — Made with <i class="bi bi-heart-fill"></i> by QuocAnh</p>
    </footer>
  </div>
</template>

<style scoped>
/* ===================== HERO BANNER ===================== */
.hero-banner {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0a1e 0%, #1a1145 40%, #0c1222 100%);
}

.hero-3d-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.7;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(ellipse at center bottom, transparent 30%, rgba(15, 10, 30, 0.7) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px 24px;
  max-width: 720px;
}

/* Badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 100px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

/* Title */
.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  line-height: 1.15;
  color: #f1f5f9;
  margin: 0 0 20px;
  letter-spacing: -1px;
}

.text-gradient {
  background: linear-gradient(135deg, #818cf8, #c084fc, #22d3ee);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Subtitle */
.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.15rem);
  color: #94a3b8;
  line-height: 1.7;
  margin: 0 0 32px;
}

.hide-mobile {
  display: none;
}
@media (min-width: 640px) {
  .hide-mobile { display: inline; }
}

/* Buttons */
.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.btn-primary-glow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
}

.btn-primary-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
}

.btn-primary-glow:active {
  transform: translateY(0);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1),
              background 0.25s cubic-bezier(0.25, 1, 0.5, 1),
              border-color 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.btn-ghost:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(148, 163, 184, 0.5);
}

/* Stats */
.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(100, 116, 139, 0.3);
}

/* ===================== ANIMATIONS (chỉ khi enabled) ===================== */
.has-animations .hero-badge {
  animation: fadeSlideUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) both;
}

.has-animations .hero-title {
  animation: fadeSlideUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.1s both;
}

.has-animations .hero-subtitle {
  animation: fadeSlideUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.2s both;
}

.has-animations .hero-actions {
  animation: fadeSlideUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.3s both;
}

.has-animations .hero-stats {
  animation: fadeSlideUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.4s both;
}

.has-animations .grid-item {
  animation: fadeSlideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) both;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===================== MUSIC SECTION ===================== */
.music-section {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 100px;
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.section-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 12px;
}

.section-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #6366f1, #c084fc);
  border-radius: 2px;
  margin: 0 auto;
}

/* Grid */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.grid-item {
  transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.grid-item:hover {
  transform: translateY(-4px);
}

/* Loading skeleton */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.skeleton-card {
  height: 100px;
  border-radius: 16px;
  background: linear-gradient(90deg,
    rgba(30, 27, 75, 0.5) 25%,
    rgba(49, 46, 129, 0.5) 50%,
    rgba(30, 27, 75, 0.5) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state i {
  font-size: 3rem;
  color: #4338ca;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #e2e8f0;
  font-size: 1.3rem;
  margin: 0 0 8px;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 24px;
}

/* ===================== FOOTER ===================== */
.home-footer {
  text-align: center;
  padding: 32px 24px;
  border-top: 1px solid rgba(100, 116, 139, 0.15);
  color: #475569;
  font-size: 0.85rem;
}

.home-footer .bi-heart-fill {
  color: #ef4444;
}

/* ===================== RESPONSIVE ===================== */
@media (max-width: 640px) {
  .hero-banner {
    min-height: 80vh;
  }

  .hero-stats {
    gap: 16px;
  }

  .stat-number {
    font-size: 1.2rem;
  }

  .grid-layout {
    grid-template-columns: 1fr;
  }

  .music-section {
    padding: 48px 16px;
  }
}
</style>
