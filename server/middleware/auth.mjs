/*
  Auth Middleware — Jimsu by QuocAnh
  Kiểm tra session trước khi cho phép truy cập API cần đăng nhập
*/

export function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
    }
    next();
}
