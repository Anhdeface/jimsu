<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import ImageCropper from '@/components/ImageCropper.vue'

const router = useRouter()

const nameSong = ref('')
const author = ref('')
const fileInput = ref(null)
const imageInput = ref(null)

const selectedAudio = ref(null)
const selectedImageBlob = ref(null)

const cropperRef = ref(null)

function onAudioChange(e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0]
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      Swal.fire('Lỗi', 'File nhạc quá lớn. Tối đa 20MB.', 'error')
      fileInput.value.value = ''
      selectedAudio.value = null
      return
    }
    selectedAudio.value = file
  }
}

function onImageChange(e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0]
    // Mở modal cắt ảnh
    cropperRef.value.open(file)
  }
}

function handleCroppedImage(blob) {
  selectedImageBlob.value = blob
}

async function upload() {
  if (!nameSong.value || !author.value || !selectedAudio.value || !selectedImageBlob.value) {
    Swal.fire('Thiếu thông tin', 'Vui lòng điền đủ thông tin, chọn nhạc và ảnh bìa.', 'warning')
    return
  }

  const formData = new FormData()
  formData.append('title', nameSong.value)
  formData.append('author', author.value)
  formData.append('audio', selectedAudio.value)
  formData.append('cover', selectedImageBlob.value, 'cover.jpg')

  Swal.fire({
    title: 'Đang tải lên...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  })

  try {
    const res = await fetch('/api/songs', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    
    const data = await res.json()
    if (res.ok && data.success) {
      Swal.fire('Thành công', 'Upload bài hát thành công!', 'success').then(() => {
        router.push('/')
      })
    } else {
      Swal.fire('Thất bại', data.message || 'Có lỗi xảy ra', 'error')
    }
  } catch (err) {
    Swal.fire('Lỗi', 'Không thể kết nối tới server', 'error')
  }
}
</script>

<template>
  <div class="page-wrapper upload-wrapper">
    <div class="container">
      <div class="upload-card card">
        <h3 class="mb-4 text-center"><i class="bi bi-cloud-upload"></i> Đăng tải bài hát</h3>
        
        <form @submit.prevent="upload">
          <div class="mb-3">
            <label class="form-label">Tên bài hát</label>
            <input type="text" v-model="nameSong" class="form-control" required placeholder="Nhập tên bài hát..." />
          </div>

          <div class="mb-3">
            <label class="form-label">Tác giả</label>
            <input type="text" v-model="author" class="form-control" required placeholder="Nhập tên tác giả..." />
          </div>

          <div class="mb-3">
            <label class="form-label">File Audio (.mp3, .m4a)</label>
            <input type="file" ref="fileInput" @change="onAudioChange" class="form-control" accept="audio/mpeg, audio/x-m4a, audio/mp3" required />
          </div>

          <div class="mb-4">
            <label class="form-label">Ảnh Bìa (sẽ được tự động cắt vuông)</label>
            <input type="file" ref="imageInput" @change="onImageChange" class="form-control" accept="image/*" required />
            <div v-if="selectedImageBlob" class="mt-2 text-success small">
              <i class="bi bi-check-circle-fill"></i> Đã xử lý ảnh bìa
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100">
            <i class="bi bi-upload"></i> Đăng Tải
          </button>
        </form>
      </div>
    </div>
    
    <ImageCropper ref="cropperRef" @cropped="handleCroppedImage" />
  </div>
</template>

<style scoped>
.upload-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
}

.upload-card {
  max-width: 500px;
  margin: 0 auto;
  padding: 30px;
  border-radius: 12px;
}

.form-label {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }
.text-center { text-align: center; }
.text-success { color: #198754; }
.small { font-size: 0.85rem; }
.w-100 { width: 100%; }
</style>
