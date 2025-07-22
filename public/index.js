 // particles.js giữ nguyên
    particlesJS("particles-js", {
      "particles": {
        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" } },
        "opacity": { "value": 0.5, "random": false },
        "size": { "value": 3, "random": true },
        "line_linked": {
          "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1
        },
        "move": {
          "enable": true, "speed": 4, "direction": "none",
          "random": false, "straight": false, "out_mode": "out"
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": { "enable": true, "mode": "repulse" },
          "onclick": { "enable": true, "mode": "push" },
          "resize": true
        },
        "modes": {
          "repulse": { "distance": 100, "duration": 0.4 },
          "push": { "particles_nb": 4 }
        }
      },
      "retina_detect": true
    });
    // Lá rơi
    function createLeaf() {
      const leaf = document.createElement("div");
      leaf.classList.add("leaf");
      leaf.innerHTML = '<i class="bi bi-leaf-fill"></i>';
      leaf.style.left = Math.random() * 100 + "%";
      const duration = Math.random() * 5 + 5;
      const delay = Math.random() * -20;
      leaf.style.animationDuration = duration + "s";
      leaf.style.animationDelay = delay + "s";
      const scale = Math.random() * 0.5 + 0.75;
      leaf.style.transform = "scale(" + scale + ")";
      document.getElementById("leaves").appendChild(leaf);
    }
    for (let i = 0; i < 20; i++) createLeaf();
    // Tuyết rơi
    function createSnowflake() {
      const snow = document.createElement("span");
      snow.className = "snowflake";
      snow.innerHTML = "&#10052;";
      snow.style.left = Math.random() * 100 + "vw";
      snow.style.fontSize = (Math.random() * 12 + 12) + "px";
      snow.style.animationDuration = (Math.random() * 3 + 4) + "s";
      snow.style.animationDelay = (Math.random() * -8) + "s";
      document.getElementById("snow").appendChild(snow);
    }
    for (let i = 0; i < 40; i++) createSnowflake();
    // Chuyển màu nền gradient 2 phía trái/phải độc lập và hòa quyện mượt mà
    let hueLeft = 0;
    let hueRight = 180;
    function animateGradientBackground() {
      // Tạo 2 màu với hue khác nhau, giảm lightness xuống 35% cho dịu mắt
      const colorLeft = `hsl(${hueLeft}, 80%, 35%)`;
      const colorRight = `hsl(${hueRight}, 80%, 35%)`;
      document.body.style.background = `linear-gradient(90deg, ${colorLeft} 0%, ${colorRight} 100%)`;
      hueLeft = (hueLeft + 0.4) % 360;
      hueRight = (hueRight + 0.7) % 360;
      requestAnimationFrame(animateGradientBackground);
    }
    animateGradientBackground();
    // Parallax cho nội dung
    document.addEventListener('mousemove', function(e) {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      document.querySelector('.content').style.transform = `translate(${x}px, ${y}px)`;
    });
    // Hiển thị giờ Việt Nam tinh tế
    function updateVNClock() {
      const now = new Date();
      // Lấy giờ Việt Nam (GMT+7)
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const vn = new Date(utc + 7 * 3600000);
      // Định dạng: Thứ, ngày/tháng/năm - HH:mm:ss
      const days = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
      const d = days[vn.getDay()];
      const dd = String(vn.getDate()).padStart(2, '0');
      const mm = String(vn.getMonth() + 1).padStart(2, '0');
      const yyyy = vn.getFullYear();
      const hh = String(vn.getHours()).padStart(2, '0');
      const min = String(vn.getMinutes()).padStart(2, '0');
      const ss = String(vn.getSeconds()).padStart(2, '0');
      document.getElementById('clock-vn').textContent =
        `${d}, ${dd}/${mm}/${yyyy} – ${hh}:${min}:${ss}`;
    }
    setInterval(updateVNClock, 1000);
    updateVNClock();