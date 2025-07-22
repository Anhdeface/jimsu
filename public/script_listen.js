const playPauseBtn = document.getElementById('playPauseBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const playIcon = document.getElementById('playIcon');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');

    function formatTime(sec) {
      sec = Math.floor(sec);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    playPauseBtn.addEventListener('click', function() {
      if (audioPlayer.paused) {
        audioPlayer.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
      } else {
        audioPlayer.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
      }
    });

    audioPlayer.addEventListener('ended', function() {
      playIcon.classList.remove('fa-pause');
      playIcon.classList.add('fa-play');
      progressBar.style.width = '0%';
      currentTimeEl.textContent = '0:00';
    });

    audioPlayer.addEventListener('timeupdate', function() {
      const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.style.width = percent + '%';
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    });

    audioPlayer.addEventListener('loadedmetadata', function() {
      durationEl.textContent = formatTime(audioPlayer.duration);
    });

    // Seek on progress bar click
    const progressBarDiv = document.querySelector('.progress-bar');
    progressBarDiv.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      audioPlayer.currentTime = percent * audioPlayer.duration;
    });

    // --- Thêm tính năng kéo tua nhạc ---
    let isSeeking = false;

    progressBarDiv.addEventListener('mousedown', function(e) {
      isSeeking = true;
      seekTo(e);
    });

    document.addEventListener('mousemove', function(e) {
      if (isSeeking) {
        seekTo(e);
      }
    });

    document.addEventListener('mouseup', function(e) {
      if (isSeeking) {
        seekTo(e);
        isSeeking = false;
      }
    });

    // Hỗ trợ kéo tua trên mobile (touch)
    progressBarDiv.addEventListener('touchstart', function(e) {
      isSeeking = true;
      seekTo(e.touches[0]);
    });
    document.addEventListener('touchmove', function(e) {
      if (isSeeking && e.touches[0]) {
        seekTo(e.touches[0]);
      }
    });
    document.addEventListener('touchend', function(e) {
      if (isSeeking) {
        isSeeking = false;
      }
    });

    function seekTo(e) {
      const rect = progressBarDiv.getBoundingClientRect();
      const x = (e.clientX || e.pageX) - rect.left;
      let percent = x / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      audioPlayer.currentTime = percent * audioPlayer.duration;
    }

    // --- Beat Visualizer tối ưu số lượng bar ---
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    let audioCtx, analyser, src, dataArray, animationId;
    let smoothBars = [];

    function getBarCount() {
      // PC: nhiều bar, mobile: ít bar, nhưng luôn >= 64 cho PC
      if (window.innerWidth < 480) return 32;
      if (window.innerWidth < 900) return 48;
      return 96;
    }

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function setupAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        src = audioCtx.createMediaElementSource(audioPlayer);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048; // tăng chi tiết beat
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
    }

    function drawVisualizer() {
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = getBarCount();
      const binSize = Math.floor(dataArray.length / barCount);
      const barWidth = Math.max((canvas.offsetWidth / barCount) * 0.9, 1);

      if (smoothBars.length !== barCount) {
        smoothBars = Array(barCount).fill(0);
      }

      let x = 0;
      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < binSize; j++) {
          sum += dataArray[i * binSize + j];
        }
        let value = sum / binSize;
        smoothBars[i] += (value - smoothBars[i]) * 0.35;

        const barHeight = (smoothBars[i] / 255) * canvas.offsetHeight;
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight);
        gradient.addColorStop(0, "#ee0979");
        gradient.addColorStop(1, "#ff6a00");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.offsetHeight - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      animationId = requestAnimationFrame(drawVisualizer);
    }

    audioPlayer.addEventListener('play', () => {
      setupAudioContext();
      audioCtx.resume();
      resizeCanvas();
      drawVisualizer();
    });

    audioPlayer.addEventListener('pause', () => {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    audioPlayer.addEventListener('ended', () => {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    window.addEventListener('resize', () => {
      resizeCanvas();
      smoothBars = [];
      if (!audioPlayer.paused && analyser) {
        drawVisualizer();
      }
    });