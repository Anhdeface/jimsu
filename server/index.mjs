/* 
Dev by QuocAnh

github.com/anhdeface
facebook.com/tcpryz
t.me/isinato

Jimsu API Server v2.0
*/

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import authRoutes from './routes/auth.mjs';
import songRoutes from './routes/songs.mjs';
import systemRoutes from './routes/system.mjs';

// ---------- CONFIG -----------
const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// CORS — cho phép Vue dev server (port 5173) gọi API
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Logger
app.use(morgan('dev'));

// Parse JSON body
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Serve uploaded files (nhạc + ảnh bìa)
app.use('/uploads', express.static(uploadsDir));

// ---------- API ROUTES -----------
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/system', systemRoutes);

// ---------- PRODUCTION: Serve Vue build -----------
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// SPA fallback — mọi route không match API sẽ trả về index.html
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
});

// ---------- RUN -----------
app.listen(port, () => {
    console.log(`Jimsu API running at http://localhost:${port}`);
});
