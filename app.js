const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const app = express();
//! Live reload to refresh the page when a file changes .
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "views"));
liveReloadServer.watch(path.join(__dirname, "public"));

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});
app.use(connectLiveReload());
//*---------------------------------------------------------------------------------------------------
//*---------------------------------------------------------------------------------------------------

//# Start Node js backend server .
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//#---------------------------------------------------------------------------------------------------
//#---------------------------------------------------------------------------------------------------
//^ Routes . Handle requests . <-----------------------------------------

app.get("/", async (req, res) => {
  res.render("index.ejs", {});
});

app.get("/login", async (req, res) => {
  res.render("login.ejs", {});
});

app.get("/register", async (req, res) => {
  res.render("register.ejs", {});
});

app.post("/register", async (req, res) => {
  const reg = req.body.login;
  console.log(reg);
  if (reg === "Login") {
    res.render("login.ejs", {});
  }
});
app.post("/login", async (req, res) => {
  const reg = req.body.register;
  console.log(reg);
  if (reg === "Register") {
    res.render("register.ejs", {});
  }
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
