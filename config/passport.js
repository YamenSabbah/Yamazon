import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import db from "./db.js";

const initializePassport = () => {
  passport.use(
    new Strategy({ usernameField: "email" }, async function verify(
      email,
      password,
      cb,
    ) {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          await bcrypt.compare(password, user.password, (err, valid) => {
            if (err) {
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
        return cb(err);
      }
    }),
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.user_id);
  });

  passport.deserializeUser(async (id, cb) => {
    try {
      const user = await db.query("SELECT * FROM users WHERE user_id = $1", [
        id,
      ]);
      cb(null, user.rows[0]);
    } catch (err) {
      cb(err);
    }
  });
};

export default initializePassport;
