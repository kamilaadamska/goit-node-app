const express = require("express");

const router = express.Router();

const { signupHandler, loginHandler } = require("../../controller/users");
const auth = require("../../config/config-passport");

router.post("/signup", signupHandler);

router.post("/login", loginHandler);

router.get("/list", auth, (req, res, _) => {
  const { username } = req.user;
  res.json({
    status: "success",
    code: 200,
    data: {
      message: `Authorization was successful: ${username}`,
    },
  });
});

module.exports = router;
