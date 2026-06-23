<script setup>
import { ref, onMounted } from 'vue'
import SongCard from '@/components/SongCard.vue'

const songs = ref([])

onMounted(async () => {
  try {
    const res = await fetch('/api/songs')
    if (res.ok) {
      songs.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching songs:', err)
  }
})
</script>

<template>
  <div class="page-wrapper">
    <div class="container" style="margin-top: 20px;">
      <div class="grid-layout">
        <div v-for="song in songs" :key="song.id_songs" class="grid-item">
          <SongCard :song="song" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-layout {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 576px) {
  .grid-layout {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .grid-layout {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
