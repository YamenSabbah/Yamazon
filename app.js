import express from "express";
import bodyParser from "body-parser";
import path from "path";
import conn from "./connect.js";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import dotenv from "dotenv";
import ensureAuthenticated from "./auth.js"; // Ensure Authenticated
dotenv.config();
//*---------------------------------------------------------------------------------------------------
//*---------------------------------------------------------------------------------------------------
const app = express();
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

app.get("/", async (req, res) => {
  res.render("index.ejs", {});
});
//^ -----------------    Main Store Page <-------------------------------
app.get(
  "/main",
  /* ensureAuthenticated, */ async (req, res) => {
    // console.log(req.user);
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
    // const userBalance = await conn.query(
    //   `select balance from users where user_id = $1`,
    //   [req.user.user_id],
    // );
    // Convert map to array
    const categories = Object.values(categoriesMap);
    res.render("main.ejs", {
      balance: /*userBalance.rows[0].balance,*/ 5000,
      categories: categories,
    });
  },
); //end of main route
//^ -----------------    Cart Page <-------------------------------
app.get("/cart", async (req, res) => {
  res.render("cart.ejs", {});
});
app.get("/addToCart", ensureAuthenticated, async (req, res) => {
  const productId = req.query.productId;
  const result = await conn.query(`select * from products where prod_id = $1`, [
    productId,
  ]);
  const product = result.rows[0];
  const userBalance = await conn.query(
    `select balance from users where user_id = $1`,
    [req.user.user_id],
  );
  if (userBalance.rows[0].balance < product.price) {
    res.redirect("/main?message=notenough");
  } else {
    const result = await conn.query(
      "insert into cart (user_id, prod_id, quantity) values ($1, $2, 1) ON CONFLICT (user_id, prod_id) DO UPDATE SET quantity = cart.quantity + 1",
      [req.user.user_id, productId],
    );
  }
});
//& -----------------    Logout Page <-------------------------------

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
//& -----------------    Login Page <-------------------------------

app.get("/login", async (req, res) => {
  res.render("login.ejs");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/login?message=notfound",
  }),
);
//& -----------------    Register Page <-------------------------------

app.get("/register", async (req, res) => {
  res.render("register.ejs", { message: req.query.message });
});

app.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    if (
      firstName === "" ||
      lastName === "" ||
      email === "" ||
      password === ""
    ) {
      res.redirect("/register?message=empty");
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!emailRegex.test(email)) {
        return res.redirect("/register?message=invalid");
      }

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
              "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
              [firstName, lastName, email, hash],
            );
            const user = result.rows[0];
            req.login(user, (err) => {
              if (err) {
                console.log(err);
                res.redirect("/register?message=error");
              } else {
                res.redirect("/register?message=success");
              }
            });
          }
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
});

//&  -----------------    Passport Local Strategy <-------------------------------
passport.use(
  new Strategy({ usernameField: "email" }, async function verify(
    email,
    password,
    cb,
  ) {
    try {
      const result = await conn.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        await bcrypt.compare(password, user.password, (err, valid) => {
          if (err) {
            console.log("Error comparing password", err);
            return cb(err);
          } else {
            if (valid) {
              // User is authenticated
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb(null, false);
      }
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  }),
);
passport.serializeUser((user, cb) => {
  cb(null, user.user_id);
});
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await conn.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);
    cb(null, user.rows[0]);
  } catch (err) {
    cb(err);
  }
});
const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
