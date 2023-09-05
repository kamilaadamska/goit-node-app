const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../../models/schemas/user");

const {
  signupHandler,
  loginHandler,
  logoutHandler,
  currentHandler,
} = require("../../controller/users");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err || !user.token) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }

    req.user = user;

    next();
  })(req, res, next);
};

router.post("/signup", signupHandler);

router.post("/login", loginHandler);

router.get("/logout", auth, logoutHandler);

router.get("/current", auth, currentHandler);

module.exports = router;
