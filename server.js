import express from "express";
import ejs from "ejs";
import expressLayout from "express-ejs-layouts";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 8000;

// set template engine
// app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/resources/views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(PORT, () => {
  console.log(`listening in ${PORT}`);
});
