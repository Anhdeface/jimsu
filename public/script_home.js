 // Ẩn navbar khi cuộn xuống, hiện khi cuộn lên
    let lastScrollTop = 0;
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', function() {
      let st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop && st > 80) {
        // Cuộn xuống
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.transition = 'transform 0.4s';
      } else {
        // Cuộn lên
        navbar.style.transform = 'translateY(0)';
        navbar.style.transition = 'transform 0.4s';
      }
      lastScrollTop = st <= 0 ? 0 : st;
    }, false);