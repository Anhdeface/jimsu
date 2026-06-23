<script setup>
import { ref, onUnmounted } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import Swal from 'sweetalert2'

const emit = defineEmits(['cropped'])

const isModalOpen = ref(false)
const imageSrc = ref('')
const cropperImg = ref(null)
let cropperInstance = null

function open(file) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target.result
    isModalOpen.value = true
    
    // Đợi DOM update image src rồi khởi tạo Cropper
    setTimeout(() => {
      // Kiểm tra nếu ảnh đã vuông thì có thể bỏ qua crop, nhưng để user confirm vẫn tốt
      const img = new Image()
      img.onload = () => {
        if (img.naturalWidth === img.naturalHeight) {
          // Bỏ qua crop tự động nếu muốn, ở đây ta vẫn hiện lên cho chắc
        }
        initCropper()
      }
      img.src = e.target.result
    }, 100)
  }
  reader.readAsDataURL(file)
}

function initCropper() {
  if (cropperInstance) cropperInstance.destroy()
  if (cropperImg.value) {
    cropperInstance = new Cropper(cropperImg.value, {
      aspectRatio: 1,
      viewMode: 1,
      autoCropArea: 1,
    })
  }
}

function close() {
  isModalOpen.value = false
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
}

function crop() {
  if (cropperInstance) {
    cropperInstance.getCroppedCanvas().toBlob((blob) => {
      emit('cropped', blob)
      close()
      Swal.fire({
        icon: 'success',
        title: 'Đã cắt ảnh',
        timer: 1000,
        showConfirmButton: false
      })
    }, 'image/jpeg')
  }
}

defineExpose({ open })

onUnmounted(() => {
  if (cropperInstance) cropperInstance.destroy()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isModalOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Cắt ảnh vuông</h5>
          <button class="close-btn" @click="close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="img-container">
            <img ref="cropperImg" :src="imageSrc" alt="Crop preview" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close">Hủy</button>
          <button class="btn btn-primary" @click="crop">Cắt & Dùng ảnh này</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.img-container {
  max-height: 400px;
  overflow: hidden;
}

.img-container img {
  max-width: 100%;
  display: block;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background: #e2e6ea;
  color: #333;
}

.btn-primary {
  background: #0d6efd;
  color: white;
}
</style>
