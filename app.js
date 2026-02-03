import express from "express";
import bodyParser from "body-parser";
import path from "path";
const app = express();
import conn from "./connect.js";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import dotenv from "dotenv";
dotenv.config();
//*---------------------------------------------------------------------------------------------------
//*---------------------------------------------------------------------------------------------------
const saltRounds = 10; // Number of salt rounds for bcrypt

//# Start Node js backend server .
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//? -----------------------> Session middleware .<----------------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);
//? -----------------------> Passport middleware .<----------------
app.use(passport.initialize());
app.use(passport.session());

//#---------------------------------------------------------------------------------------------------
//#---------------------------------------------------------------------------------------------------
//^ Routes . Handle requests . <-----------------------------------------

app.get("/", async (req, res) => {
  res.render("index.ejs", {});
});

app.get("/login", async (req, res) => {
  res.render("login.ejs");
});

app.get("/register", async (req, res) => {
  res.render("register.ejs", { message: req.query.message });
});

app.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  console.log(req.body);
  try {
    if (
      firstName === "" ||
      lastName === "" ||
      email === "" ||
      password === ""
    ) {
      res.redirect("/register?message=empty");
    } else {
      const checkUser = await conn.query(
        `SELECT * FROM users WHERE email = $1`,
        [email],
      );
      if (checkUser.rows.length > 0) {
        res.redirect("/register?message=exists");
      } else {
        //#--------------> Password Hashing <------------
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.log(err);
            res.redirect("/register");
          } else {
            const result = await conn.query(
              "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
              [firstName, lastName, email, hash],
            );
            res.redirect("/register?message=success");
          }
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
});
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const loginPassword = req.body.password;

  try {
    if (email === "" || loginPassword === "") {
      res.redirect("/login?message=empty");
    } else {
      const result = await conn.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length > 0) {
        bcrypt.compare(loginPassword,result.rows[0].password,(err, result) => {
            if (err) {
              console.log(err);
              res.redirect("/login");
            } else {
              if (result) {
                res.redirect("/main");
              } else {
                res.redirect("/login");
              }
            }
          },
        );
      }
      else{
        res.redirect("/login?message=notfound");
      }
    }
  } catch (error) {
    console.log(error);
    res.redirect("/login");
  }
});

//^ -----------------    Main Store Page <-------------------------------
app.get("/main", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  } else {
    const result = await conn.query(
      `select * from products inner join categories using (cat_id) ORDER BY cat_id ASC`,
    );
    let products = [];
    products = result.rows;
    //let Group products by category
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
  }
}); //end of main route

app.get("/cart", async (req, res) => {
  res.render("cart.ejs", {});
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
