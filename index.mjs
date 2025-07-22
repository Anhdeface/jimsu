/* 
Dev by QuocAnh

github.com/anhdeface
facebook.com/tcpryz
t.me/isinato

Home Jimsu By QuocAnh.
*/


import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';
import multer from 'multer';
import * as ctl from "./backend/controller.mjs";
import session from 'express-session';

// ----------CONFIG -----------
const app = express();
const port = 3000;
const __filename  = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static('public')); //public 'public' folder
app.use(express.static('uploads')) // public 'uploads' folder
app.use(express.json()); // parse json
app.use(session({
    secret : 'quocanhmethuyduongvailon',
    resave : false,
    saveUninitialized : true,
    cookie : {maxAge : 3600000}
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .mp3, .jpg,...
    const timestamp = Date.now();

    let prefix = 'file';
    if (file.fieldname === 'audio') prefix = 'audio';
    if (file.fieldname === 'cover') prefix = 'cover';

    const filename = `${prefix}_${timestamp}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({storage});

// --------ROUTE--------------
// Home
app.get('/',async (req,res) => {
    res.set('Cache-Control', 'public, max-age=120');
    res.removeHeader('ETag');
    const result = await ctl.getAllSong();
    res.render('home',{result : result});
});
// Login
app.get('/login',(req,res)=>{
    if (req.session.userId){
        res.redirect('/');
    }
    else {
        res.render('login'); 
    }
});
// Logout
app.get('/logout',(req,res)=>{
    if (req.session.userId){
        req.session.destroy();
        res.clearCookie('connect.sid');
        res.redirect('/login');
    }
    else {
        res.redirect('/');
    }
});
// Register
app.get('/register',(req,res)=>{
    if (req.session.userId){
        res.redirect('/');
    }
    else {
        res.render('register'); 
    }
});
// Account
app.get('/account',async (req,res)=>{
    // res.set('Cache-Control', 'public, max-age=30');
    if (req.session.userId){
         res.set('Cache-Control', 'no-store');
        const username = await ctl.getUserById(req.session.userId);
        const result = await ctl.getHistory(req.session.userId);
        res.render('account',{
            username : username,
            res : result
        });
    }
    else {
        res.redirect('/login');
    }
});
// About
app.get('/about',(req,res)=>{
    res.render('index');
});
// Listen
app.get('/listen/:song_eng',async (req,res)=>{
    res.set('Cache-Control', 'public, max-age=3600');
    res.removeHeader('ETag');
    const song_eng = req.params.song_eng;
    const result = await ctl.getSongbySongEng(song_eng);
    if(req.session.userId){
        await ctl.createHeard(req.session.userId,result.id_songs);
    }
    if(Object.keys(result).length === 0){
        res.redirect('/');
    }
    else {
        res.render('listen',{
            result : result
        });
    }

});
// Upload
app.get('/upload',(req,res)=>{
    if(req.session.userId){
        res.render('upload');
    }
    else {
        res.redirect('/');
    }
});
// Route Upload
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;

  
  if (!filename.match(/^[\w\-_]+\.(mp3|jpg|png)$/)) {
    return res.status(400);
  }

  const filePath = path.join('uploads', filename);
  if (!fs.existsSync(filePath)) {
    res.status(404);
  }

  res.sendFile(path.resolve(filePath));
});


// -------- API ----------
app.post('/api/login',async (req,res)=>{
    const {user,pass} = req.body;
    if(await ctl.loginUser(user,pass)){
        req.session.userId = await ctl.getIdByUser(user);
        res.json({success : true});
    }
    else {
        res.json({success : false});
    }
});
app.post('/api/register',async (req,res)=>{
    const {user,pass} = req.body;
    await ctl.createUser(user,pass)
    req.session.userId = await ctl.getIdByUser(user);
    res.json({success : true});
});


app.post('/api/upload', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  const { title, author } = req.body;
  const audio = req.files['audio']?.[0];
  const cover = req.files['cover']?.[0];
  const poster = await ctl.getUserById(req.session.userId);
  const result = await ctl.createSong(title,cover.filename,audio.filename,author,poster);
  if(result){
    res.json({success : true});
  }
  else {
    res.json({success : false});
  }
  
});

// -------------RUN-----------------
app.listen(port,()=>{console.log("app run success in http://localhost:3000")});
