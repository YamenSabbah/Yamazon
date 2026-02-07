import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import initializePassport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import indexRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const port = 4000;

// Initialize Passport logic
initializePassport();

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", indexRoutes);
app.use("/", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
