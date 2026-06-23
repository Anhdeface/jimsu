<script setup>
</script>

<template>
  <div class="about-fullscreen">
    <div class="content">
      <h1 class="glitch" data-text="Jimsu">Jimsu</h1>
      <p class="subtitle">Personal Music Streaming Project</p>
      
      <div class="details">
        <p>Phát triển bởi <strong>Quốc Anh</strong></p>
        <p>Refactored to Vue 3 SPA + Node REST API.</p>
        <div class="links">
          <a href="https://github.com/anhdeface" target="_blank"><i class="bi bi-github"></i> GitHub</a>
          <a href="https://t.me/isinato" target="_blank"><i class="bi bi-telegram"></i> Telegram</a>
        </div>
      </div>

      <router-link to="/" class="btn-back mt-4">Quay lại trang chủ</router-link>
    </div>
  </div>
</template>

<style scoped>
.about-fullscreen {
  height: 100vh;
  width: 100vw;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2000;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 1.5s ease-out;
}

.subtitle {
  font-size: 1.2rem;
  color: #aaa;
  margin-top: 10px;
  letter-spacing: 2px;
}

.details {
  margin-top: 30px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.links {
  margin-top: 20px;
  display: flex;
  gap: 20px;
  justify-content: center;
}

.links a {
  color: #fff;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s;
}

.links a:hover {
  color: #0d6efd;
}

.btn-back {
  display: inline-block;
  margin-top: 40px;
  padding: 10px 20px;
  border: 1px solid #fff;
  color: #fff;
  text-decoration: none;
  border-radius: 30px;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #fff;
  color: #000;
}

/* Glitch Effect */
.glitch {
  position: relative;
  font-size: 5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 5px;
  text-transform: uppercase;
}

.glitch::before, .glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}

.glitch::before {
  left: 2px;
  text-shadow: -2px 0 red;
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -2px 0 blue;
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim 2.5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% { clip: rect(10px, 9999px, 30px, 0); }
  20% { clip: rect(50px, 9999px, 80px, 0); }
  40% { clip: rect(30px, 9999px, 50px, 0); }
  60% { clip: rect(80px, 9999px, 110px, 0); }
  80% { clip: rect(10px, 9999px, 20px, 0); }
  100% { clip: rect(60px, 9999px, 90px, 0); }
}

@keyframes glitch-anim-2 {
  0% { clip: rect(65px, 9999px, 100px, 0); }
  20% { clip: rect(15px, 9999px, 40px, 0); }
  40% { clip: rect(45px, 9999px, 75px, 0); }
  60% { clip: rect(10px, 9999px, 30px, 0); }
  80% { clip: rect(80px, 9999px, 110px, 0); }
  100% { clip: rect(25px, 9999px, 55px, 0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
