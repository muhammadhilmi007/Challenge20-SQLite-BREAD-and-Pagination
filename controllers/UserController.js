import { render } from "ejs";
import Data from "../models/User.js";

class UserController {
  static browse(req, res) {
    const page = parseInt(req.query.page) || 1; // ambil nomor page dari query string
    const operation = req.query.operation || "OR"; // ambil operasi logika dari query string
    const filter = { // Buat Object Filter untuk cari berdasarkan parameter
      name: req.query.search,
      height: req.query.height,
      weight: req.query.weight,
      startDate: req.query.startdate,
      endDate: req.query.enddate,
      isMarried: // Konversi nilai string menjadi angka
        req.query.married === "true"
          ? 1
          : req.query.married === "false"
          ? 0
          : undefined
    };
    //console.log(filter);

    Data.getAll(page, 5, filter, operation, (err, data, totalPages) => { // ** Tampilkan Daftar User
      
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.render("index", { // ** Tampilkan Daftar User
        data,
        page,
        filter,
        operation,
        totalPages,
        query: req.query // untuk mempertahankan parameter pencarian
      });
    });
  }

  static add(req, res) {
    if (req.method === "GET") {
      res.render("add");
    } else { // ** POST
      Data.add(req.body, (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.redirect("/");
      });
    }
  }

  static edit(req, res) {
    if (req.method === "GET") {
      Data.getById(req.params.id, (err, data) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.render("edit", { data });
      });
    } else { // ** POST
      Data.update(req.params.id, req.body, (err) => {
        console.log(req.body);

        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.redirect("/");
      });
    }
  }

  static delete(req, res) {
    Data.delete(req.params.id, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.redirect("/");
    });
  }
}

export default UserController;
