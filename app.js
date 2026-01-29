import express from "express";
import bodyParser from "body-parser";
import path from "path";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
import conn from "./connect.js";
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
let products = [];
conn.query("select * from products inner join categories using (cat_id) ORDER BY cat_id ASC", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    products = res.rows;
  }
});

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

app.get("/main", async (req, res) => {
  // Group products by category
  const categoriesMap = {};

  products.forEach((product) => {
    const catId = product.cat_id;
    if (!categoriesMap[catId]) {
      categoriesMap[catId] = {
        name: product.cat_name, // Make sure your DB has category names
        products: [],
      };
    }
    categoriesMap[catId].products.push({
      id: product.prod_id,
      name: product.prod_name,
      price: product.price,
      image: product.imageurl,
      quantity: product.quantity,
    });
  });

  // Convert map to array
  const categories = Object.values(categoriesMap);
  res.render("main.ejs", {
    balance: 5000,
    categories: categories,
  });
});


app.get("/cart", async (req, res) => {
  res.render("cart.ejs", {});
});

app.post("/register", async (req, res) => {
  const reg = req.body.login;
  console.log(reg);
});
app.post("/login", async (req, res) => {
  const reg = req.body.register;
  console.log(reg);
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
