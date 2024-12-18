// Import modul sqlite3 untuk mengelola database SQLite
import sqlite3 from "sqlite3";
// Membuat koneksi ke database data.db
const db = new sqlite3.Database("./database/data.db");

// Class Data untuk mengelola operasi CRUD pada tabel data
class Data {
  // Method getAll untuk mengambil data dengan fitur filter dan pagination
  static getAll(page = 1, limit = 5, filter = {}, operation = "OR", callback) {
    // Query dasar tanpa WHERE
    let countQuery = "SELECT COUNT(*) as total FROM data";
    let query = "SELECT * FROM data";
    const params = []; // Array untuk parameter query utama
    const countParams = []; // Array untuk parameter query count
    const conditions = []; // Array untuk menyimpan kondisi WHERE

    // Filter berdasarkan nama (menggunakan LIKE untuk pencarian partial)
    // Jika ada filter nama yang diberikan
    if (filter.name) {
      // Menambahkan kondisi pencarian nama menggunakan LIKE untuk pencarian partial
      // Tanda % di awal dan akhir memungkinkan pencarian substring di manapun dalam nama
      conditions.push("name LIKE ?"); // Menambahkan kondisi ke array conditions
      params.push(`%${filter.name}%`); // Menambahkan parameter nama ke array params untuk query utama
      countParams.push(`%${filter.name}%`); // Menambahkan parameter nama ke array countParams untuk query count
    }

    // Filter berdasarkan tinggi (exact match)
    if (filter.height) {
      conditions.push("height = ?");
      params.push(filter.height);
      countParams.push(filter.height);
    }

    // Filter berdasarkan berat (exact match) 
    if (filter.weight) {
      conditions.push("weight = ?");
      params.push(filter.weight);
      countParams.push(filter.weight);
    }

    // Filter berdasarkan tanggal lahir (BETWEEN, >= atau <=)
    if (filter.startDate || filter.endDate) {
      let dateCondition = "birthdate";
      if (filter.startDate && filter.endDate) {
        dateCondition += " BETWEEN ? AND ?";
        params.push(filter.startDate, filter.endDate);
        countParams.push(filter.startDate, filter.endDate);
      } else if (filter.startDate) {
        dateCondition += " >= ?";
        params.push(filter.startDate);
        countParams.push(filter.startDate);
      } else if (filter.endDate) {
        dateCondition += " <= ?";
        params.push(filter.endDate);
        countParams.push(filter.endDate);
      }
      conditions.push(dateCondition);
    }

    // Filter berdasarkan status pernikahan (1/0)
    if (filter.isMarried !== undefined) {
      conditions.push("married = ?");
      const marriedValue = filter.isMarried === "true" || filter.isMarried === 1 ? 1 : 0;
      params.push(marriedValue);
      countParams.push(marriedValue);
    }

    // Menambahkan WHERE clause jika ada kondisi
    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(` ${operation} `)}`;
      query += whereClause;
      countQuery += whereClause;
    }
    // select * from data where name like %a% AND married = 1
    //console.log(query);

    // Menghitung total data yang sesuai filter
    // err dan result adalah parameter callback yang diberikan oleh method db.get()
    // err: object error jika query gagal
    // result: hasil query yang berisi total data
    // countQuery adalah query untuk menghitung total data yang sesuai filter
    // countParams adalah parameter untuk query count
    // db.get() mengembalikan satu baris hasil query dalam bentuk object
    // result berisi {total: jumlah_data} dari query "SELECT COUNT(*) as total FROM data"
    db.get(countQuery, countParams, (err, result) => {
      if (err) {
        return callback(err);
      }

      // Mengambil nilai total dari hasil query count
      // result.total berisi jumlah total data yang sesuai dengan filter
      // Nilai ini digunakan untuk menghitung jumlah halaman (pagination)
      const total = result.total;
      // Menghitung total halaman berdasarkan limit per halaman
      const totalPages = Math.ceil(total / limit); // Math.ceil() untuk membulatkan ke atas

      // Menambahkan pagination ke query utama
      // Menambahkan LIMIT dan OFFSET ke query untuk pagination
      // LIMIT ?: Membatasi jumlah data yang diambil sesuai parameter limit
      // OFFSET ?: Menentukan data mulai dari mana yang diambil
      // (page-1)*limit: Menghitung offset berdasarkan nomor halaman
      // Contoh: 
      // - Halaman 1: OFFSET = (1-1)*5 = 0 -> mulai dari data ke-1
      // - Halaman 2: OFFSET = (2-1)*5 = 5 -> mulai dari data ke-6
      query += " LIMIT ? OFFSET ?";
      params.push(limit, (page - 1) * limit);

      // Mengambil data sesuai filter dan pagination
      // Mengeksekusi query untuk mengambil data dari database
      // db.all() digunakan untuk mengambil semua baris hasil query
      // query: string SQL query yang sudah dibuat sebelumnya
      // params: array parameter untuk query (untuk filter dan pagination)
      // callback function menerima 2 parameter:
      // - err: object error jika query gagal
      // - rows: array berisi hasil query dalam bentuk object
      console.log(query);
      
      db.all(query, params, (err, rows) => {
        
        // Jika terjadi error, panggil callback dengan error
        if (err) {
          return callback(err);
        }
        // Jika berhasil, panggil callback dengan:
        // - null sebagai error (tidak ada error)
        // - rows sebagai data hasil query
        // - totalPages untuk informasi jumlah halaman
        callback(null, rows, totalPages);
      });
    });
  }

  // Method add untuk menambah data baru
  static add(data, callback) {
    const query =
      "INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)";
    // Konversi nilai married dari string ke integer
    const marriedValue = data.married === "true" ? 1 : 0;
    return db.run(
      query,
      [data.name, data.height, data.weight, data.birthdate, marriedValue],
      callback
    );
  }

  // Method update untuk mengubah data yang ada
  static update(id, data, callback) {
    const query =
      "UPDATE data SET name =?, height =?, weight =?, birthdate =?, married =? WHERE id =?";
    const marriedValue = data.married === "true" ? 1 : 0;
    return db.run(
      query,
      [data.name, data.height, data.weight, data.birthdate, marriedValue, id],
      callback
    );
  }

  // Method delete untuk menghapus data
  static delete(id, callback) {
    const query = "DELETE FROM data WHERE id = ?";
    return db.run(query, [id], callback);
  }

  // Method getById untuk mengambil satu data berdasarkan ID
  static getById(id, callback) {
    const query = "SELECT * FROM data WHERE id = ?";
    return db.get(query, [id], callback);
  }
}

// Export class Data untuk digunakan di file lain
export default Data;
