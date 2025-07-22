        // Loại VIP: 'do', 'xanh', 'vang', hoặc '' (không vip)
        const vipType = 'vang'; // Thay đổi giá trị này để test: 'do', 'xanh', 'vang', ''

        function setVipBadge(type) {
            const badgeFooter = document.getElementById('vipBadgeFooter');
            const name = document.getElementById('accountName');
            // Xóa các class cũ
            badgeFooter.classList.remove('vip-do', 'vip-xanh', 'vip-vang', 'hidden');
            name.classList.remove('vip-name-vang', 'vip-name-do', 'vip-name-xanh', 'text-danger', 'text-primary', 'text-warning');
            // Đổi màu tên theo loại VIP
            if (type === 'do') {
                name.classList.add('vip-name-do');
                badgeFooter.classList.add('vip-do');
                badgeFooter.textContent = 'VIP';
            } else if (type === 'xanh') {
                name.classList.add('vip-name-xanh');
                badgeFooter.classList.add('vip-xanh');
                badgeFooter.textContent = 'VIP';
            } else if (type === 'vang') {
                name.classList.add('vip-name-vang');
                badgeFooter.classList.add('vip-vang');
                badgeFooter.textContent = 'VIP';
            } else {
                badgeFooter.classList.add('hidden');
            }
        }

        setVipBadge(vipType);

        // Hiển thị thời gian hiện tại theo giờ Việt Nam và ngày thứ
        function updateVNTime() {
            const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
            const now = new Date();
            // Giờ Việt Nam (UTC+7)
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const vn = new Date(utc + 7 * 3600000);
            const day = days[vn.getDay()];
            const date = vn.toLocaleDateString('vi-VN');
            const time = vn.toLocaleTimeString('vi-VN');
            document.getElementById('vnTime').textContent = `${day}, ${date} - ${time}`;
        }
        updateVNTime();
        setInterval(updateVNTime, 1000);

        // Hiệu ứng tuyết rơi nhẹ nhàng, không che form
        const snowColors = ['#fff', '#e0e7ff', '#f8fafc'];
        const snowContainer = document.getElementById('snowContainer');
        function createSnowflake() {
            const snowflake = document.createElement('span');
            snowflake.className = 'snowflake';
            snowflake.textContent = '❄';
            // Kích thước và màu ngẫu nhiên
            const size = Math.random() * 12 + 12; // 12px - 24px
            snowflake.style.fontSize = size + 'px';
            snowflake.style.left = Math.random() * 100 + 'vw';
            snowflake.style.color = snowColors[Math.floor(Math.random() * snowColors.length)];
            snowflake.style.opacity = Math.random() * 0.5 + 0.5;
            // Thời gian rơi ngẫu nhiên
            const duration = Math.random() * 3 + 4; // 4s - 7s
            snowflake.style.animationDuration = duration + 's';
            // Lắc nhẹ khi rơi
            snowflake.style.transform = `translateX(${Math.random() * 20 - 10}px)`;
            snowContainer.appendChild(snowflake);

            // Xóa khi rơi xong
            snowflake.addEventListener('animationend', () => {
                snowflake.remove();
            });
        }
        setInterval(createSnowflake, 170); // Tạo tuyết mới mỗi 250ms