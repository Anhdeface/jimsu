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

    const user = await auth.getUserById(req.session.userId);
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
    await song.createHeard(req.session.userId, result.id_songs);
    res.json({ success: true });
});

// Lịch sử nghe nhạc
router.get('/history/me', requireAuth, async (req, res) => {
    const history = await song.getHistory(req.session.userId);
    res.json(history);
});

export default router;
