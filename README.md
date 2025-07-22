# 🎵 Jimsu — Simple Music Upload & Streaming App

**Jimsu** is a lightweight web application built with **Node.js** and **Express**, designed to let users upload and stream music files directly from their browser. Perfect for those looking to explore basic web audio handling and server-side file management.

---

## 🚀 Features

- 🎧 Upload and stream `.mp3` files effortlessly
- 🎨 Smooth page transitions and front-end animations
- 📂 Support for uploading cover images with music files
- 📄 Server-side rendering powered by EJS
- 📁 Clean, organized code structure using the MVC pattern

---

## 🗂️ Project Structure

```bash
.
├── backend/                # Server-side logic
│   ├── controller.mjs      # Core application logic
│   ├── db.mjs              # Database handling (if applicable)
│   └── test.mjs            # Test scripts
├── demo/                   # Demo-related static content
│   ├── account/            # Account page assets
│   └── index/              # Index page assets
├── index.mjs               # Application entry point
├── package.json            # Project metadata and dependencies
├── public/                 # Static assets (CSS, JS, images)
│   ├── img/                # Image assets
│   ├── index.css           # Stylesheet for the index page
│   ├── *.css               # Stylesheets for other pages
│   ├── *.js                # Frontend scripts for each route
│   ├── music/              # Preloaded sample music files
├── uploads/                # Uploaded music files and cover images
└── views/                  # EJS view templates
    ├── index.ejs           # Homepage template
    ├── login.ejs           # Login page template
    ├── upload.ejs          # Upload page template
    └── etc.                # Additional templates
```

---

## 🛠️ Built With

- [Node.js](https://nodejs.org/) — JavaScript runtime environment
- [Express.js](https://expressjs.com/) — Web framework for Node.js
- [Multer](https://github.com/expressjs/multer) — Middleware for handling file uploads
- [EJS](https://ejs.co/) — Embedded JavaScript templating engine
- [Basic CSS/JS Effects](https://www.jsdelivr.com/) — Optional front-end animations

---

## 📦 Installation

Follow these steps to get Jimsu up and running:

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Anhdeface/jimsu.git
   ```

2. **Navigate into the project folder:**
   ```bash
   cd jimsu
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   node index.js
   ```

5. **Access the app:**
   Open your browser and visit `http://localhost:3000` (or the configured port).

---

## 🎧 Usage

### Uploading Music
- Go to the upload page.
- Select an `.mp3` file and an optional cover image.
- Click "Upload" to save the files to the server.

### Streaming Music
- Visit the music list page.
- Click on a track to stream it directly in your browser.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Developed by QuocAnh**

- **Contacts:**
  - [Facebook](https://facebook.com/tcpryz)
  - [Telegram](https://t.me/isinato)

---

Thank you for checking out Jimsu! Reach out if you have any questions or need assistance.
