/*
  Auth Routes — Jimsu by QuocAnh
  POST /api/auth/login
  POST /api/auth/register
  POST /api/auth/logout
  GET  /api/auth/me
*/

import { Router } from 'express';
import * as auth from '../controllers/authController.mjs';
import { requireAuth } from '../middleware/auth.mjs';

const router = Router();

// Đăng nhập
router.post('/login', async (req, res) => {
    const { user, pass } = req.body;

    const userErr = auth.validateUsername(user);
    const passErr = auth.validatePassword(pass);
    if (userErr) return res.status(400).json({ success: false, message: userErr });
    if (passErr) return res.status(400).json({ success: false, message: passErr });

    const result = await auth.loginUser(user, pass);
    if (result) {
        req.session.userId = result.id;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
});

// Đăng ký
router.post('/register', async (req, res) => {
    const { user, pass } = req.body;

    const userErr = auth.validateUsername(user);
    const passErr = auth.validatePassword(pass);
    if (userErr) return res.status(400).json({ success: false, message: userErr });
    if (passErr) return res.status(400).json({ success: false, message: passErr });

    // Kiểm tra username đã tồn tại
    const exists = await auth.checkUserExists(user);
    if (exists) {
        return res.status(409).json({ success: false, message: 'Tên tài khoản đã tồn tại' });
    }

    await auth.createUser(user, pass);
    const userId = await auth.getIdByUser(user);
    req.session.userId = userId;
    res.json({ success: true });
});

// Đăng xuất
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ success: true });
});

// Lấy thông tin user hiện tại (check session)
router.get('/me', requireAuth, async (req, res) => {
    const user = await auth.getUserById(req.session.userId);
    if (!user) {
        return res.status(404).json({ error: 'User không tồn tại' });
    }
    res.json(user);
});

export default router;
