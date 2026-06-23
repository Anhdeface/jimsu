/*
  Auth Controller — Jimsu by QuocAnh
  Xử lý logic liên quan đến user: đăng ký, đăng nhập, lấy thông tin
*/

import pool from "../db.mjs";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// --------- Validation ---------

export function validateUsername(username) {
    if (!username || typeof username !== 'string') return 'Tên tài khoản không được để trống';
    if (username.length < 3 || username.length > 20) return 'Tên tài khoản phải từ 3-20 ký tự';
    if (!/^[\w]+$/.test(username)) return 'Tên tài khoản chỉ được chứa chữ cái, số và dấu _';
    return null;
}

export function validatePassword(password) {
    if (!password || typeof password !== 'string') return 'Mật khẩu không được để trống';
    if (password.length < 6 || password.length > 35) return 'Mật khẩu phải từ 6-35 ký tự';
    return null;
}

// --------- User CRUD ---------

export async function createUser(username, password) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [rows] = await pool.query(
        'INSERT INTO `user` (`username`, `password`) VALUES (?, ?)',
        [username, hashed]
    );
    return rows.affectedRows > 0;
}

export async function loginUser(username, password) {
    const [rows] = await pool.query(
        'SELECT * FROM user WHERE username = ?',
        [username]
    );
    if (rows.length === 0) return null;

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
}

export async function getUserById(id) {
    const [rows] = await pool.query('SELECT id, username FROM user WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0];
}

export async function getIdByUser(username) {
    const [rows] = await pool.query('SELECT id FROM user WHERE username = ?', [username]);
    if (rows.length > 0) return rows[0].id;
    return null;
}

export async function checkUserExists(username) {
    const [rows] = await pool.query('SELECT id FROM user WHERE username = ?', [username]);
    return rows.length > 0;
}
