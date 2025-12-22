const session = require("express-session");

module.exports = session({
  name: "sid",
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,   // harus false kalau pakai HTTP
    sameSite: "lax", // supaya cookie diterima di LAN
    maxAge: 1000 * 60 * 60
  }
});
