/*
  System Routes — Jimsu by QuocAnh
  GET /api/system/capabilities — Phân tích thiết bị để quyết định mức hiệu ứng
*/

import { Router } from 'express';

const router = Router();

// Danh sách các pattern UA của thiết bị yếu / mobile
const LOW_END_PATTERNS = [
    /Android.*Mobile/i,
    /iPhone/i,
    /iPod/i,
    /Opera Mini/i,
    /IEMobile/i,
    /Windows Phone/i,
    /BB10/i,
    /BlackBerry/i,
    /KAIOS/i
];

// Trình duyệt cũ không hỗ trợ tốt WebGL / CSS effects
const LEGACY_BROWSERS = [
    /MSIE/i,
    /Trident/i,
    /Edge\/1[0-8]/i
];

router.get('/capabilities', (req, res) => {
    const ua = req.headers['user-agent'] || '';

    // Client Hints (nếu trình duyệt gửi)
    const deviceMemory = parseFloat(req.headers['device-memory']) || null;
    const hardwareConcurrency = parseInt(req.headers['device-memory']) || null; // sẽ dùng Sec-CH nếu có
    const prefersReducedMotion = req.headers['sec-ch-prefers-reduced-motion'] === 'reduce';

    // --- Chấm điểm ---
    let score = 70; // Điểm mặc định (trung bình)

    // Mobile / thiết bị yếu => trừ điểm nặng
    const isMobile = LOW_END_PATTERNS.some(p => p.test(ua));
    if (isMobile) score -= 40;

    // Tablet (iPad, Android tablet) => trừ nhẹ
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    if (isTablet) score -= 15;

    // Trình duyệt cũ
    const isLegacy = LEGACY_BROWSERS.some(p => p.test(ua));
    if (isLegacy) score -= 30;

    // Device-Memory header (Chrome gửi)
    if (deviceMemory !== null) {
        if (deviceMemory >= 8) score += 20;
        else if (deviceMemory >= 4) score += 5;
        else if (deviceMemory <= 2) score -= 20;
    }

    // User tắt animation ở hệ thống
    if (prefersReducedMotion) score -= 50;

    // Clamp [0, 100]
    score = Math.max(0, Math.min(100, score));

    // Quyết định tier
    const tier = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

    res.json({
        tier,          // 'high' | 'medium' | 'low'
        score,
        flags: {
            enable3D: tier === 'high',
            enableBlur: tier !== 'low',
            enableAnimations: tier !== 'low' && !prefersReducedMotion,
            enablePhysics: tier === 'high',
            prefersReducedMotion
        },
        detected: {
            isMobile,
            isTablet,
            isLegacy,
            deviceMemory,
            userAgent: ua.substring(0, 120)
        }
    });
});

export default router;
