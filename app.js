// Import modul yang diperlukan
import express from "express"; // Framework web untuk Node.js
import UserController from "./controllers/UserController.js"; // Controller untuk menangani logika user
import path from "path"; // Modul untuk menangani path file/direktori
const app = express(); // Membuat aplikasi Express

// Konfigurasi aplikasi
app.set("view engine", "ejs"); // Menggunakan EJS sebagai template engine
app.use(express.urlencoded({ extended: true })); // Middleware untuk parsing body request
app.use(express.static(path.join("public"))); // Mengatur folder public untuk file statis

// Mendefinisikan routes/endpoint aplikasi
// Route untuk halaman utama - menampilkan daftar user
app.get("/", UserController.browse); 

// Routes untuk menambah user baru
app.get("/add", UserController.add); // Menampilkan form tambah
app.post("/add", UserController.add); // Memproses data form tambah

// Routes untuk mengedit user
app.get("/edit/:id", UserController.edit); // Menampilkan form edit dengan data user
app.post("/edit/:id", UserController.edit); // Memproses perubahan data user

// Route untuk menghapus user
app.get("/delete/:id", UserController.delete);

// Menjalankan server pada port 3000
app.listen(3000, () => {
  console.log(`Server running on port 3000`); // Pesan ketika server berhasil berjalan
});
