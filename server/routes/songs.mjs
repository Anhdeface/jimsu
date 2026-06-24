/*
  Song Routes — Jimsu by QuocAnh
  GET  /api/songs          — Danh sách tất cả bài hát
  GET  /api/songs/:slug    — Chi tiết 1 bài hát theo slug
  POST /api/songs          — Upload bài hát mới (cần đăng nhập)
  POST /api/songs/:slug/listen — Ghi nhận lượt nghe (cần đăng nhập)
  GET  /api/history        — Lịch sử nghe nhạc (cần đăng nhập)
*/

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as song from '../controllers/songController.mjs';
import * as auth from '../controllers/authController.mjs';
import { requireAuth } from '../middleware/auth.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();

        let prefix = 'file';
        if (file.fieldname === 'audio') prefix = 'audio';
        if (file.fieldname === 'cover') prefix = 'cover';

        cb(null, `${prefix}_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 80 * 1024 * 1024 // 80MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'audio') {
            if (file.mimetype === 'audio/mpeg' || file.originalname.endsWith('.mp3')) {
                cb(null, true);
            } else {
                cb(new Error('Chỉ chấp nhận file MP3'));
            }
        } else if (file.fieldname === 'cover') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Chỉ chấp nhận file ảnh'));
            }
        } else {
            cb(null, true);
        }
    }
});

const router = Router();

// Danh sách tất cả bài hát
router.get('/', async (req, res) => {
    const songs = await song.getAllSongs();
    res.json(songs);
});

// Chi tiết 1 bài hát theo slug
router.get('/:slug', async (req, res) => {
    const result = await song.getSongBySlug(req.params.slug);
    if (!result) {
        return res.status(404).json({ error: 'Bài hát không tồn tại' });
    }
    res.json(result);
});

// Upload bài hát mới
router.post('/', requireAuth, upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    const { title, author } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Thiếu tên bài hát' });
    }
    if (!author || !author.trim()) {
        return res.status(400).json({ success: false, message: 'Thiếu tên tác giả' });
    }

    const audio = req.files['audio']?.[0];
    const cover = req.files['cover']?.[0];

    if (!audio || !cover) {
        return res.status(400).json({ success: false, message: 'Thiếu file audio hoặc ảnh bìa' });
    }

    const user = await auth.getUserById(req.userId);
    const poster = user ? user.username : 'unknown';

    const result = await song.createSong(title.trim(), cover.filename, audio.filename, author.trim(), poster);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Lỗi khi lưu bài hát' });
    }
});

// Ghi nhận lượt nghe
router.post('/:slug/listen', requireAuth, async (req, res) => {
    const result = await song.getSongBySlug(req.params.slug);
    if (!result) {
        return res.status(404).json({ error: 'Bài hát không tồn tại' });
    }
    await song.createHeard(req.userId, result.id_songs);
    res.json({ success: true });
});

// Lịch sử nghe nhạc
router.get('/history/me', requireAuth, async (req, res) => {
    const history = await song.getHistory(req.userId);
    res.json(history);
});

// Nhạc đã tải lên
router.get('/my-uploads', requireAuth, async (req, res) => {
    const user = await auth.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });
    
    const uploads = await song.getSongsByPoster(user.username);
    res.json(uploads);
});

// Xoá bài hát
router.delete('/:id', requireAuth, async (req, res) => {
    const { pass2 } = req.body;
    
    const hasP2 = await auth.hasPass2(req.userId);
    if (!hasP2) return res.status(403).json({ success: false, message: 'Chưa cài mật khẩu cấp 2. Vui lòng vào Cài đặt để thiết lập.' });
    if (!pass2) return res.status(400).json({ success: false, message: 'Cần nhập mật khẩu cấp 2 để xoá' });
    
    const isPass2Valid = await auth.checkPass2(req.userId, pass2);
    if (!isPass2Valid) return res.status(401).json({ success: false, message: 'Mật khẩu cấp 2 không đúng' });

    const targetSong = await song.getSongById(req.params.id);
    if (!targetSong) return res.status(404).json({ success: false, message: 'Bài hát không tồn tại' });

    const user = await auth.getUserById(req.userId);
    if (targetSong.poster !== user.username) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá bài hát này' });
    }

    const success = await song.deleteSong(req.params.id);
    if (success) {
        try {
            if (targetSong.path_img) fs.unlinkSync(path.join(uploadsDir, targetSong.path_img));
            if (targetSong.path_file) fs.unlinkSync(path.join(uploadsDir, targetSong.path_file));
        } catch (e) {
            console.error('Không thể xoá file vật lý', e);
        }
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Lỗi khi xoá bài hát' });
    }
});

export default router;
