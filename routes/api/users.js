const express = require("express");
const passport = require("passport");
const router = express.Router();

const { signupHandler, loginHandler } = require("../../controller/users");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
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

router.get("/current", auth, (req, res, _) => {
  const { email, subscription } = req.user;

  res.json({
    status: "success",
    code: 200,
    data: {
      message: `Authorization was successful!`,
      email,
      subscription,
    },
  });
});

module.exports = router;
