const express = require("express");
const router = express.Router();

const { auth } = require("../../service/auth");

const {
  signupHandler,
  loginHandler,
  logoutHandler,
  currentHandler,
  patchHandler,
} = require("../../controller/users");

router.post("/signup", signupHandler);

router.post("/login", loginHandler);

router.get("/logout", auth, logoutHandler);

router.get("/current", auth, currentHandler);

router.patch("/", auth, patchHandler);

module.exports = router;
