/*
  Song Controller — Jimsu by QuocAnh
  Xử lý logic liên quan đến bài hát: CRUD, lịch sử nghe
*/

import pool from "../db.mjs";

// ---- Utility functions ---------

export function toSlug(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .replace(/\s+/g, '')
        .toLowerCase();
}

// --------- Songs CRUD ---------

export async function createSong(song, path_img, path_file, author, poster) {
    const id_songs = BigInt(`${process.hrtime.bigint()}${Math.floor(Math.random() * 1000)}`);
    const song_eng = toSlug(song);

    const [result] = await pool.query(
        'INSERT INTO songs (name_song, song_eng, path_img, path_file, author, poster, id_songs) VALUES (?,?,?,?,?,?,?)',
        [song, song_eng, path_img, path_file, author, poster, id_songs]
    );
    return result.affectedRows > 0;
}

export async function getAllSongs() {
    const [rows] = await pool.query('SELECT * FROM songs');
    return rows;
}

export async function getSongBySlug(slug) {
    const [result] = await pool.query('SELECT * FROM songs WHERE song_eng = ?', [slug]);
    if (result.length > 0) return result[0];
    return null;
}

export async function getSongById(id) {
    const [result] = await pool.query('SELECT * FROM songs WHERE id_songs = ?', [id]);
    if (result.length > 0) return result[0];
    return null;
}

export async function deleteSong(id) {
    const [result] = await pool.query('DELETE FROM songs WHERE id_songs = ?', [id]);
    return result.affectedRows > 0;
}

// --------- History Heard ----------

export async function createHeard(id_user, id_songs) {
    const now = new Date();
    const [result] = await pool.query(
        'INSERT INTO history_heard (id_songs, id_user, time_heard) VALUES (?,?,?)',
        [id_songs, id_user, now]
    );
    return result.affectedRows > 0;
}

export async function getHistory(id_user) {
    const [result] = await pool.query(
        `SELECT h.*, s.name_song, s.song_eng, s.path_img, s.author
         FROM history_heard h
         JOIN songs s ON h.id_songs = s.id_songs
         WHERE h.id_user = ?
         ORDER BY h.time_heard DESC
         LIMIT 20`,
        [id_user]
    );
    return result;
}
