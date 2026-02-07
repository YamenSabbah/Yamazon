import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import db from "../config/db.js";

const router = express.Router();
const saltRounds = 10;

//& -----------------    Login Page <-------------------------------
router.get("/login", async (req, res) => {
  res.render("login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/login?message=notfound",
  }),
);

//& -----------------    Register Page <-------------------------------
router.get("/register", async (req, res) => {
  res.render("register.ejs", { message: req.query.message });
});

router.post("/register", async (req, res) => {
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

      const checkUser = await db.query(`SELECT * FROM users WHERE email = $1`, [
        email,
      ]);
      if (checkUser.rows.length > 0) {
        res.redirect("/register?message=exists");
      } else {
        //#--------------> Password Hashing <------------
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.log(err);
            res.redirect("/register");
          } else {
            const result = await db.query(
              "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
              [firstName, lastName, email, hash],
            );
            const user = result.rows[0];
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

//& -----------------    Logout Page <-------------------------------
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

export default router;
