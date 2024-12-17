// Import modul yang diperlukan
import { render } from "ejs"; // Untuk merender view
import Data from "../models/User.js"; // Import model Data untuk operasi database

// Class UserController untuk menangani logika bisnis
class UserController {
  // Method browse untuk menampilkan daftar data dengan fitur filter dan pagination
  static browse(req, res) {
    // 1. req.query.page dari URL selalu bertipe string
    // 2. Untuk operasi matematika di pagination (seperti OFFSET) perlu tipe number
    // 3. Jika tidak dikonversi, operasi matematika dengan string bisa menghasilkan hasil yang tidak diinginkan
    //console.log(req.query.page);
    const page = parseInt(req.query.page) || 1; // Mengambil nomor halaman dari URL, default 1 jika tidak ada
    const operation = req.query.operation || "OR"; // Mengambil jenis operasi filter (OR/AND), default OR
    
    // Membuat objek filter dari parameter URL
    const filter = {
      name: req.query.search, // Filter berdasarkan nama
      height: req.query.height, // Filter berdasarkan tinggi
      weight: req.query.weight, // Filter berdasarkan berat
      startDate: req.query.startdate, // Filter berdasarkan tanggal mulai
      endDate: req.query.enddate, // Filter berdasarkan tanggal akhir
      isMarried: // Filter berdasarkan status pernikahan (dikonversi ke angka)
        // 1. Data dari form (req.query) berbentuk string "true"/"false"
        // 2. Di database SQLite, status pernikahan disimpan sebagai integer (1/0)
        // 3. Perlu dikonversi agar sesuai dengan tipe data di database
        req.query.married === "true" ? 1 : req.query.married === "false" ? 0 : undefined
    };

    // Memanggil method getAll dari model Data untuk mengambil data
    Data.getAll(page, 5, filter, operation, (err, data, totalPages) => {
      if (err) {
        res.status(500).send('Error: ' + err.message); // Jika error, kirim response error sebagai plain text
        return;
      }
      // Render view index dengan data yang diperlukan
      res.render("index", {
        data, // Data hasil query
        page, // Halaman saat ini
        filter, // Filter yang digunakan
        operation, // Operasi filter (AND/OR)
        totalPages, // Total halaman
        query: req.query // req.query berisi parameter URL (seperti page, search, dll) yang digunakan untuk mempertahankan state filter saat halaman di-refresh
      });
    });
  }

  // Method add untuk menambah data baru
  static add(req, res) {
    if (req.method === "GET") {
      res.render("add"); // Jika GET, tampilkan form tambah
    } else { // Jika POST, proses penambahan data
      Data.add(req.body, (err) => {
        if (err) {
          res.status(500).send('Error: ' + err.message);
          return;
        }
        res.redirect("/"); // Redirect ke halaman utama setelah berhasil
      });
    }
  }

  // Method edit untuk mengubah data
  static edit(req, res) {
    if (req.method === "GET") {
      // Ambil data berdasarkan ID untuk ditampilkan di form
      // req.params.id berisi ID user yang dikirim melalui URL /edit/:id
      // Contoh: /edit/5 maka req.params.id berisi "5"
      Data.getById(req.params.id, (err, data) => {
        if (err) {
          res.status(500).send('Error: ' + err.message);
          return;
        }
        // Konversi nilai married untuk ditampilkan di form
        data.married = data.married === 1 ? "true" : data.married === 0 ? "false" : undefined;
        res.render("edit", { data });
        //console.log(data);
      });
    } else { // Jika POST, proses update data
      Data.update(req.params.id, req.body, (err) => {
        console.log(req.body);
        if (err) {
          res.status(500).send('Error: ' + err.message);
          return;
        }
        res.redirect("/"); // Redirect ke halaman utama setelah berhasil
      });
    }
  }

  // Method delete untuk menghapus data
  static delete(req, res) {
    Data.delete(req.params.id, (err) => {
      if (err) {
        res.status(500).send('Error: ' + err.message);
        return;
      }
      res.redirect("/"); // Redirect ke halaman utama setelah berhasil
    });
  }
}

// Export class UserController untuk digunakan di file lain
export default UserController;
