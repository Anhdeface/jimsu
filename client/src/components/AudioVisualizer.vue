<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  audioElement: {
    type: HTMLAudioElement,
    required: false
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  colorStart: {
    type: String,
    default: '#ee0979'
  },
  colorEnd: {
    type: String,
    default: '#ff6a00'
  }
})

const canvasRef = ref(null)
let audioCtx = null
let analyser = null
let srcNode = null
let dataArray = null
let animationId = null
let smoothBars = []

function getBarCount() {
  if (window.innerWidth < 480) return 32
  if (window.innerWidth < 900) return 48
  return 96
}

function resizeCanvas() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  canvas.width = canvas.offsetWidth * dpr
  canvas.height = canvas.offsetHeight * dpr
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)
}

function setupAudioContext() {
  if (!audioCtx && props.audioElement) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    audioCtx = new AudioContext()
    srcNode = audioCtx.createMediaElementSource(props.audioElement)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    srcNode.connect(analyser)
    analyser.connect(audioCtx.destination)
  }
}

function drawVisualizer() {
  if (!canvasRef.value || !analyser) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  
  analyser.getByteFrequencyData(dataArray)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const barCount = getBarCount()
  const binSize = Math.floor(dataArray.length / barCount)
  const barWidth = Math.max((canvas.offsetWidth / barCount) * 0.9, 1)

  if (smoothBars.length !== barCount) {
    smoothBars = Array(barCount).fill(0)
  }

  let x = 0
  for (let i = 0; i < barCount; i++) {
    let sum = 0
    for (let j = 0; j < binSize; j++) {
      sum += dataArray[i * binSize + j]
    }
    let value = sum / binSize
    smoothBars[i] += (value - smoothBars[i]) * 0.35

    const barHeight = (smoothBars[i] / 255) * canvas.offsetHeight
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight)
    gradient.addColorStop(0, props.colorStart)
    gradient.addColorStop(1, props.colorEnd)
    
    ctx.fillStyle = gradient
    ctx.fillRect(x, canvas.offsetHeight - barHeight, barWidth, barHeight)
    x += barWidth + 1
  }
  
  if (props.isPlaying) {
    animationId = requestAnimationFrame(drawVisualizer)
  }
}

watch(() => props.isPlaying, (newVal) => {
  if (newVal) {
    setupAudioContext()
    if (audioCtx?.state === 'suspended') {
      audioCtx.resume()
    }
    resizeCanvas()
    drawVisualizer()
  } else {
    if (animationId) cancelAnimationFrame(animationId)
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
  }
})

onMounted(() => {
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animationId) cancelAnimationFrame(animationId)
  if (audioCtx) {
    audioCtx.close()
  }
})
</script>

<template>
  <div class="visualizer-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.visualizer-container {
  width: 100%;
  height: 100px;
  margin: 20px 0;
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
