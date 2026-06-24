/*
  Auth Routes — Jimsu by QuocAnh
  POST /api/auth/login
  POST /api/auth/register
  POST /api/auth/logout
  GET  /api/auth/me
*/

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import * as auth from '../controllers/authController.mjs';
import { requireAuth } from '../middleware/auth.mjs';

const router = Router();
const JWT_SECRET = 'quocanhmethuyduongvailon';

router.post('/login', async (req, res) => {
    const { user, pass, rememberMe } = req.body;

    const userErr = auth.validateUsername(user);
    const passErr = auth.validatePassword(pass);
    if (userErr) return res.status(400).json({ success: false, message: userErr });
    if (passErr) return res.status(400).json({ success: false, message: passErr });

    const result = await auth.loginUser(user, pass);
    if (result) {
        const expiresIn = rememberMe ? '30d' : '1d';
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        
        const token = jwt.sign({ userId: result.id }, JWT_SECRET, { expiresIn });
        res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax', maxAge });
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
    
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true });
});

// Đăng xuất
router.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ success: true });
});

// Lấy thông tin user hiện tại (check JWT)
router.get('/me', requireAuth, async (req, res) => {
    const user = await auth.getUserById(req.userId);
    if (!user) {
        return res.status(404).json({ error: 'User không tồn tại' });
    }
    const hasPass2 = await auth.hasPass2(req.userId);
    res.json({ ...user, hasPass2 });
});

// Thiết lập hoặc đổi mật khẩu cấp 2
router.post('/pass2', requireAuth, async (req, res) => {
    const { pass1, pass2 } = req.body;
    
    if (!pass2 || pass2.length < 6 || pass2.length > 35) {
        return res.status(400).json({ success: false, message: 'Mật khẩu cấp 2 phải từ 6-35 ký tự' });
    }

    const hasP2 = await auth.hasPass2(req.userId);
    if (hasP2) {
        if (!pass1) {
            return res.status(400).json({ success: false, message: 'Cần nhập mật khẩu cấp 1 để đổi mật khẩu cấp 2' });
        }
        const isPass1Valid = await auth.checkPass1(req.userId, pass1);
        if (!isPass1Valid) {
            return res.status(401).json({ success: false, message: 'Mật khẩu cấp 1 không đúng' });
        }
    }
    
    const success = await auth.setPass2(req.userId, pass2);
    if (success) {
        res.json({ success: true, message: 'Đã cập nhật mật khẩu cấp 2 thành công' });
    } else {
        res.status(500).json({ success: false, message: 'Lỗi khi lưu mật khẩu' });
    }
});

export default router;
