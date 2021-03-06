const express = require("express");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const Emitter = require("events");
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

// Event emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

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

// passport config
const passportinit = require("./passport.js");
passportinit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// set gobal var for session
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// set template engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/resources/views"));

// routes
app.use("/", route);

const server = app.listen(PORT, () => {
  console.log(`listening in ${PORT}`);
});

// Socket connection
const io = require("socket.io")(server);

io.on("connection", socket => {
  socket.on("join", roomName => {
    socket.join(roomName);
  });
});

eventEmitter.on("orderUpdated", data => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmitter.on("orderPlaced", data => {
  io.to("adminRoom").emit("orderPlaced", data);
});
