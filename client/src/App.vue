<script setup>
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import WelcomePopup from '@/components/WelcomePopup.vue'

const route = useRoute()
</script>

<template>
  <!-- Ẩn Navbar ở trang About vì trang About có layout riêng đặc biệt -->
  <Navbar v-if="route.path !== '/about'" />
  <WelcomePopup />
  <router-view />
</template>
