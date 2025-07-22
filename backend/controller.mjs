import pool from "./db.mjs";
import {access} from "fs/promises"
import {constants} from "fs"
/* 

Controller Jimsu by QuocAnh

Date  : 21/06/2025


*/

// ---- function extension ---------

export async function checkFile(path) {
    try {
        await access(path,constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
    
}

export function toSlug(text) {
  return text
    .normalize('NFD')                      
    .replace(/[\u0300-\u036f]/g, '')       
    .replace(/đ/g, 'd')                    
    .replace(/Đ/g, 'd')
    .replace(/\s+/g, '')                  
    .toLowerCase();                        
}

// ---------- user -----------------
export async function getAllUsers() {
    const [rows] = await pool.query('SELECT * FROM user');
    return rows;
}

export async function createUser(username,password) {
    const [rows] = await pool.query('INSERT INTO `user` (`username`, `password`) VALUES (?, ?)', [username, password]);
    if (rows.affectedRows > 0) {
        return true;
    }
    else {
        return false;
    }
}
export async function loginUser(user,pass) {
    const [rows] = await pool.query('SELECT * FROM user WHERE username = ? AND password = ?',[user,pass]);
    if (rows.length > 0){
        return true;
    }
    else {
        return false;
    }
    
}

export async function getUserById(id) {
    const [rows] = await pool.query('SELECT * FROM user WHERE id = ?',[id]);
    return rows[0].username;
    
}

export async function DeleteUserById(id){
    const [rows] = await pool.query('DELETE FROM user WHERE id = ?',[id]);
    if (rows.affectedRows > 0){
        return true;
    }
    else {
        return false;
    }
}

export async function getIdByUser(username) {
    const [rows] = await pool.query('SELECT * FROM user WHERE username = ?',[username]);
    if (rows.length > 0){
        return rows[0].id;
    }
    else {
        return 0;
    }
}
// --------- songs ---------
export async function createSong(song,path_img,path_file,author,poster) {
    const id_songs = BigInt(`${process.hrtime.bigint()}${Math.floor(Math.random()*1000)}`);
    const song_eng = toSlug(song);
    // if (!checkFile(path_file) && !checkFile(path_img)){
    //     return false;
    // }
    const [result] = await pool.query('INSERT INTO songs (name_song,song_eng,path_img,path_file,author,poster,id_songs) VALUES (?,?,?,?,?,?,?)',[song,song_eng,path_img,path_file,author,poster,id_songs]);
    if (result.affectedRows > 0){
        return true;
    }
    else {
        return false;
    }
}
export async function getAllSong() {
    const [rows] = await pool.query('SELECT * FROM songs');
    return rows;
    
}
export async function getIdSong(name_song) {
    const [result] = await pool.query('SELECT * FROM songs WHERE name_song = ?',[name_song]);
    if(result.length > 0){
        return result[0].id_songs;
    }
    else {
        return 0;
    }
}
export async function getSongbySongEng(name_song) {
    const [result] = await pool.query('SELECT * FROM songs WHERE song_eng = ?',[name_song]);
    if(result.length > 0){
        return result[0];
    }
    else {
        return 0;
    }
}
export async function getSongbyId(id) {
    const [result] = await pool.query('SELECT * FROM songs WHERE id_songs = ?',[id]);
    if (result.length > 0){
        return result[0];
    }
    else {
        return 0;
    }   
}
export async function DeleteSong(id) {
    const [result] = await pool.query('DELETE FROM songs WHERE id_songs = ?',[id]);
    if (result.affectedRows > 0){
        return true;
    }
    else {
        return false;
    }
}

// --------- history heard ----------
export async function createHeard(id_user,id_songs) {
    const now = new Date();
    const [result] = await pool.query('INSERT INTO history_heard (id_songs,id_user,time_heard) VALUES (?,?,?)',[id_songs,id_user,now]);
    if (result.affectedRows > 0){
        return true;
    }
    else {
        return false;
    }
}
export async function getHistory(id_user) {
    const [result] = await pool.query('SELECT * FROM history_heard WHERE id_user = ? LIMIT 20 ',[id_user]);
    if (result.length > 0){
        return result;
    }
    else {
        return [];
    }
    
}