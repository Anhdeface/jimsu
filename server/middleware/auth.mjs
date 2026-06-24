/*
  Auth Middleware — Jimsu by QuocAnh
  Kiểm tra JWT từ cookie trước khi cho phép truy cập API cần đăng nhập
*/

import jwt from 'jsonwebtoken';
const JWT_SECRET = 'quocanhmethuyduongvailon';

export function requireAuth(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}
