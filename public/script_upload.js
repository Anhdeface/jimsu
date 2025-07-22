async function upload() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const audioInput = document.getElementById("audio");
  const coverInput = document.getElementById("cover");

  if (!title || !author) {
    Swal.fire({
      icon: 'warning',
      title: 'Thiếu thông tin',
      text: 'Vui lòng nhập đầy đủ tiêu đề và tác giả.'
    });
    return;
  }

  if (!audioInput.files.length || !coverInput.files.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Thiếu file',
      text: 'Vui lòng chọn file audio và ảnh bìa.'
    });
    return;
  }

  const audio = audioInput.files[0];
  let cover = coverInput.files[0];

  // Nếu đã crop thì dùng ảnh đã crop
  if (croppedCoverBlob) {
    cover = new File([croppedCoverBlob], cover.name, { type: croppedCoverBlob.type });
  }

  if (audio.size > 80 * 1024 * 1024) {
    Swal.fire({
      icon: 'error',
      title: 'File quá lớn',
      text: 'File mp3 vượt quá 80MB'
    });
    return;
  }

  if (cover.size > 10 * 1024 * 1024) {
    Swal.fire({
      icon: 'error',
      title: 'Ảnh quá lớn',
      text: 'Ảnh vượt quá 10MB'
    });
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("author", author);
  formData.append("audio", audio);
  formData.append("cover", cover);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Tải lên thành công'
      }).then(() => {
              window.location.href = '/';
          });
      
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: data.message || "Tải lên thất bại"
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: 'Có lỗi xảy ra khi tải lên'
    });
  }
}

let croppedCoverBlob = null; // Lưu ảnh đã crop

document.addEventListener('DOMContentLoaded', function () {
  const titleInput = document.getElementById('title');
  const authorInput = document.getElementById('author');
  const uploadBtn = document.querySelector('button[onclick="upload()"]');
  const coverInput = document.getElementById('cover');
  let cropper;
  const cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
  const cropImage = document.getElementById('cropImage');
  const cropBtn = document.getElementById('cropBtn');

  function checkInputs() {
    if (titleInput.value.trim() && authorInput.value.trim()) {
      uploadBtn.disabled = false;
    } else {
      uploadBtn.disabled = true;
    }
  }

  titleInput.addEventListener('input', checkInputs);
  authorInput.addEventListener('input', checkInputs);

  coverInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      cropImage.src = ev.target.result;
      cropImage.onload = function () {
        // Nếu ảnh đã vuông thì không cần crop
        if (cropImage.naturalWidth === cropImage.naturalHeight) {
          croppedCoverBlob = null; // Dùng file gốc
        } else {
          cropModal.show();
          if (cropper) cropper.destroy();
          cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1,
          });
        }
      };
    };
    reader.readAsDataURL(file);
  });

  cropBtn.addEventListener('click', function () {
    if (cropper) {
      cropper.getCroppedCanvas().toBlob(function (blob) {
        croppedCoverBlob = blob;
        cropper.destroy();
        cropModal.hide();
        Swal.fire({
          icon: 'success',
          title: 'Đã cắt ảnh',
          timer: 1000,
          showConfirmButton: false
        });
      }, 'image/jpeg');
    }
  });

  // Khởi tạo trạng thái ban đầu
  checkInputs();
});
