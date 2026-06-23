<script setup>
import { onMounted, onUnmounted } from 'vue'

const snowColors = ['#fff', '#e0e7ff', '#f8fafc']
let intervalId

function createSnowflake() {
  const container = document.getElementById('snowContainer')
  if (!container) return

  const snowflake = document.createElement('span')
  snowflake.className = 'snowflake'
  snowflake.textContent = '❄'

  const size = Math.random() * 12 + 12
  snowflake.style.fontSize = size + 'px'
  snowflake.style.left = Math.random() * 100 + 'vw'
  snowflake.style.color = snowColors[Math.floor(Math.random() * snowColors.length)]
  snowflake.style.opacity = Math.random() * 0.5 + 0.5

  const duration = Math.random() * 3 + 4
  snowflake.style.animationDuration = duration + 's'
  snowflake.style.transform = `translateX(${Math.random() * 20 - 10}px)`

  container.appendChild(snowflake)

  snowflake.addEventListener('animationend', () => {
    snowflake.remove()
  })
}

onMounted(() => {
  intervalId = setInterval(createSnowflake, 170)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div class="snowflake-container" id="snowContainer"></div>
</template>

<style>
.snowflake-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}
.snowflake {
  position: absolute;
  top: -20px;
  user-select: none;
  animation-name: fall;
  animation-timing-function: linear;
}
@keyframes fall {
  0% { transform: translateY(-20px); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(105vh); opacity: 0; }
}
</style>
