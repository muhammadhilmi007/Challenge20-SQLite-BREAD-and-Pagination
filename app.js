import express from "express";
import UserController from "./controllers/UserController.js";
import path from "path";
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join("public")));

// Routes GET/POST
app.get("/", UserController.browse); // ** Tampilkan Daftar User
app.get("/add", UserController.add); // Tampilkan Form Tambah User
app.post("/add", UserController.add); // Prose Tambah User
app.get("/edit/:id", UserController.edit); // Tampilkan Form edit user
app.post("/edit/:id", UserController.edit); // Proses Edit User
app.get("/delete/:id", UserController.delete); // Hapus User

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
