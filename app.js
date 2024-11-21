import express from "express";
import UserController from "./controllers/UserController.js";
import path from "path";
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join("public")));

// Routes GET/POST
app.get("/", UserController.browse);
app.get("/add", UserController.add);
app.post("/add", UserController.add);
app.get("/edit/:id", UserController.edit);
app.post("/edit/:id", UserController.edit);
app.get("/delete/:id", UserController.delete);

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
