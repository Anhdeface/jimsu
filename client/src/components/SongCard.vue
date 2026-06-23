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
      <img :src="coverUrl" alt="Cover" class="song-img" />
      <div class="song-info">
        <h5 class="song-title">{{ song.name_song }}</h5>
        <div class="song-meta">
          <i class="bi bi-person-badge"></i> {{ song.author }}
        </div>
        <div class="song-meta">
          <i class="bi bi-person-circle"></i> {{ song.poster }}
        </div>
        <div class="song-meta small">
          <i class="bi bi-caret-right-fill"></i> ID: {{ song.id_songs }}
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
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.song-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.song-card-inner {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 12px;
  gap: 16px;
  height: 100%;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.song-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.song-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.song-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0d6efd;
}

.song-meta {
  font-size: 0.85rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 6px;
}

.song-meta.small {
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>
