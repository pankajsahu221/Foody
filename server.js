const express = require("express");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const route = require("./routes/route");

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.static("public"));

// set template engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/resources/views"));

// routes
app.use("/", route);

app.listen(PORT, () => {
  console.log(`listening in ${PORT}`);
});
