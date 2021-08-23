const express = require("express");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoStore = require("connect-mongo");
const route = require("./routes/route");

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8000;

// to use bodyparser
app.use(express.json());
app.use(express.urlencoded());

// default public path
app.use(express.static("public"));

// MONGODB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } //24 hours
  })
);

app.use(flash());

// set gobal var for session
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// set template engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/resources/views"));

// routes
app.use("/", route);

app.listen(PORT, () => {
  console.log(`listening in ${PORT}`);
});
