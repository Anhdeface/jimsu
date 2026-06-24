<script setup>
/*
  WaveVisualizer3D — Jimsu by QuocAnh
  3D Cava-style audio visualizer dùng Three.js
  - Lưới các cột sóng âm 3D chuyển động theo hàm toán học
  - Hỗ trợ kéo xoay góc nhìn (OrbitControls) trên Desktop
  - Hiệu ứng vật lý (spring) khi hover chuột vào cột
  - Tối ưu 120fps: chỉ animate transform, dùng requestAnimationFrame
*/

import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const props = defineProps({
  enablePhysics: { type: Boolean, default: true }
})

const canvasRef = ref(null)

// --- Three.js core ---
let renderer, scene, camera, controls
let bars = []
let animationId = null
let clock = new THREE.Clock()
let mouse = new THREE.Vector2(9999, 9999)
let raycaster = new THREE.Raycaster()

// Cấu hình lưới sóng
const GRID_X = 24
const GRID_Z = 12
const BAR_GAP = 0.45
const BAR_SIZE = 0.3
const MAX_HEIGHT = 3.5

// Spring physics state cho mỗi bar
let barStates = []

function initScene() {
  const canvas = canvasRef.value
  if (!canvas) return

  const width = canvas.parentElement.clientWidth
  const height = canvas.parentElement.clientHeight

  // Renderer — tối ưu cho 120fps
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,  // Tắt AA để tiết kiệm GPU
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Cap pixel ratio
  renderer.setClearColor(0x000000, 0)

  // Scene
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(6, 8, 12)
  camera.lookAt(0, 0, 0)

  // OrbitControls — cho phép kéo xoay
  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enableZoom = false        // Khóa zoom
  controls.enablePan = false         // Khóa pan
  controls.minPolarAngle = 0.3       // Giới hạn góc nhìn
  controls.maxPolarAngle = Math.PI / 2.2
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.4

  // Ánh sáng
  const ambientLight = new THREE.AmbientLight(0x6366f1, 0.6)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xc084fc, 1.2)
  dirLight.position.set(5, 10, 7)
  scene.add(dirLight)

  const pointLight = new THREE.PointLight(0x22d3ee, 0.8, 20)
  pointLight.position.set(-4, 5, -3)
  scene.add(pointLight)

  // Tạo lưới các cột sóng
  const barGeometry = new THREE.BoxGeometry(BAR_SIZE, 1, BAR_SIZE)
  // Dịch pivot xuống đáy để scale Y từ đáy lên
  barGeometry.translate(0, 0.5, 0)

  const colorPalette = [
    new THREE.Color(0x6366f1), // Indigo
    new THREE.Color(0x8b5cf6), // Violet
    new THREE.Color(0xc084fc), // Purple
    new THREE.Color(0x22d3ee), // Cyan
    new THREE.Color(0x06b6d4), // Teal
  ]

  for (let ix = 0; ix < GRID_X; ix++) {
    for (let iz = 0; iz < GRID_Z; iz++) {
      const color = colorPalette[(ix + iz) % colorPalette.length]
      const material = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        shininess: 80
      })

      const mesh = new THREE.Mesh(barGeometry, material)
      const x = (ix - GRID_X / 2) * BAR_GAP
      const z = (iz - GRID_Z / 2) * BAR_GAP

      mesh.position.set(x, 0, z)
      mesh.scale.y = 0.1

      scene.add(mesh)
      bars.push(mesh)

      barStates.push({
        targetHeight: 0.1,
        currentHeight: 0.1,
        velocity: 0,
        hovered: false
      })
    }
  }

  // Floor grid (trang trí)
  const gridHelper = new THREE.GridHelper(14, 28, 0x1e1b4b, 0x1e1b4b)
  gridHelper.position.y = -0.05
  gridHelper.material.opacity = 0.15
  gridHelper.material.transparent = true
  scene.add(gridHelper)
}

function getWaveHeight(ix, iz, time) {
  // Thuật toán giả lập Spectrum Analyzer (Cava) nhấp nhô mạnh và ngẫu nhiên hơn
  const x = ix / GRID_X;
  const z = iz / GRID_Z;

  // Tạo các "nhịp đập" (beats) ngẫu nhiên theo thời gian
  const beat = Math.pow(Math.abs(Math.sin(time * 3 + x * 5)), 4);
  const fastBeat = Math.pow(Math.abs(Math.cos(time * 6 + z * 4)), 8);
  const slowWave = Math.sin(x * Math.PI * 2 + time * 1.5) * Math.cos(z * Math.PI * 2 + time);

  // Kết hợp: nhảy đột ngột + sóng nền
  const combined = (beat * 1.5 + fastBeat * 2.0 + slowWave * 0.5) / 3.0;

  return Math.max(0.1, combined * MAX_HEIGHT * 1.2);
}

function animate() {
  animationId = requestAnimationFrame(animate)

  const time = clock.getElapsedTime()
  const dt = Math.min(clock.getDelta(), 0.05) // Cap delta để tránh spike

  // Raycast cho hiệu ứng hover (chỉ khi bật physics)
  if (props.enablePhysics) {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(bars)

    // Reset hover
    for (let i = 0; i < barStates.length; i++) {
      barStates[i].hovered = false
    }

    if (intersects.length > 0) {
      const idx = bars.indexOf(intersects[0].object)
      if (idx !== -1) {
        // Hover vào thanh này + các thanh lân cận
        const ix = Math.floor(idx / GRID_Z)
        const iz = idx % GRID_Z
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            const nix = ix + dx
            const niz = iz + dz
            if (nix >= 0 && nix < GRID_X && niz >= 0 && niz < GRID_Z) {
              const nidx = nix * GRID_Z + niz
              const dist = Math.sqrt(dx * dx + dz * dz)
              if (dist <= 2.5) {
                barStates[nidx].hovered = true
              }
            }
          }
        }
      }
    }
  }

  // Cập nhật chiều cao các cột với spring physics
  for (let ix = 0; ix < GRID_X; ix++) {
    for (let iz = 0; iz < GRID_Z; iz++) {
      const idx = ix * GRID_Z + iz
      const state = barStates[idx]

      let target = getWaveHeight(ix, iz, time)

      // Nếu đang hover => đẩy lên cao hơn (spring)
      if (state.hovered) {
        target = Math.min(MAX_HEIGHT, target + 2.0)
      }

      state.targetHeight = target

      if (props.enablePhysics) {
        // Spring physics: F = -k*(x - target) - damping*v
        const spring = 12
        const damping = 6
        const force = spring * (state.targetHeight - state.currentHeight) - damping * state.velocity
        state.velocity += force * dt
        state.currentHeight += state.velocity * dt
      } else {
        // Lerp đơn giản (cho performance mode)
        state.currentHeight += (state.targetHeight - state.currentHeight) * 0.08
      }

      bars[idx].scale.y = Math.max(0.02, state.currentHeight)

      // Thay đổi opacity theo chiều cao
      bars[idx].material.opacity = 0.5 + (state.currentHeight / MAX_HEIGHT) * 0.5
    }
  }

  controls.update()
  renderer.render(scene, camera)
}

function onMouseMove(e) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
}

function onMouseLeave() {
  mouse.set(9999, 9999)
}

function onResize() {
  if (!canvasRef.value || !renderer || !camera) return
  const width = canvasRef.value.parentElement.clientWidth
  const height = canvasRef.value.parentElement.clientHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

onMounted(() => {
  initScene()
  animate()

  if (props.enablePhysics) {
    canvasRef.value?.addEventListener('mousemove', onMouseMove)
    canvasRef.value?.addEventListener('mouseleave', onMouseLeave)
  }

  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  // Dọn dẹp memory — QUAN TRỌNG để tránh leak
  if (animationId) cancelAnimationFrame(animationId)

  canvasRef.value?.removeEventListener('mousemove', onMouseMove)
  canvasRef.value?.removeEventListener('mouseleave', onMouseLeave)
  window.removeEventListener('resize', onResize)

  // Dispose Three.js objects
  bars.forEach(mesh => {
    mesh.geometry.dispose()
    mesh.material.dispose()
  })
  bars = []
  barStates = []

  if (controls) controls.dispose()
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
  }

  scene = null
  camera = null
  renderer = null
  controls = null
})
</script>

<template>
  <canvas ref="canvasRef" class="wave-canvas"></canvas>
</template>

<style scoped>
.wave-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
</style>
