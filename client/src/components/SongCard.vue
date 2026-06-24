<script setup>
import { computed } from 'vue'

const props = defineProps({
  song: {
    type: Object,
    required: true
  }
})

// Fix upload path if it doesn't start with /uploads/
const coverUrl = computed(() => {
  if (props.song.path_img.startsWith('/')) return props.song.path_img
  return `/uploads/${props.song.path_img}`
})
</script>

<template>
  <router-link :to="`/listen/${song.song_eng}`" class="song-card">
    <div class="song-card-inner">
      <div class="song-img-wrapper">
        <img :src="coverUrl" alt="Cover" class="song-img" loading="lazy" />
        <div class="play-overlay">
          <i class="bi bi-play-fill"></i>
        </div>
      </div>
      <div class="song-info">
        <h5 class="song-title">{{ song.name_song }}</h5>
        <div class="song-meta">
          <i class="bi bi-person-badge"></i> {{ song.author }}
        </div>
        <div class="song-meta secondary">
          <i class="bi bi-person-circle"></i> {{ song.poster }}
        </div>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.song-card {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.song-card-inner {
  display: flex;
  background: rgba(30, 27, 75, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 16px;
  padding: 14px;
  gap: 16px;
  height: 100%;
  box-sizing: border-box;
  transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1),
              border-color 0.25s cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.song-card:hover .song-card-inner {
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
}

/* Image */
.song-img-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
}

.song-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.song-card:hover .song-img {
  transform: scale(1.08);
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.play-overlay i {
  font-size: 1.8rem;
  color: #fff;
}

.song-card:hover .play-overlay {
  opacity: 1;
}

/* Info */
.song-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 0; /* Cho phép text truncate */
}

.song-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta {
  font-size: 0.82rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta.secondary {
  color: #64748b;
  font-size: 0.78rem;
}

/* Performance mode: tắt blur cho máy yếu */
:global(.performance-mode) .song-card-inner,
:global(.tier-low) .song-card-inner {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: rgba(30, 27, 75, 0.7);
}
</style>
