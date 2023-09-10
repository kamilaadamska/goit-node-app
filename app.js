const express = require("express");
const logger = require("morgan");
const cors = require("cors");

require("dotenv").config();
require("./config/config-passport");

const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/users");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const { auth } = require("./service/auth");

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/contacts", auth, contactsRouter);
app.use("/api/users", usersRouter);

app.use((_, res) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message:
      "Use api on routes: /api/contacts, api/contacts/:id, api/contacts/:id/favorite, api/users/signup or api/users/login",
    data: "Not found",
  });
});

app.use((err, _, res, __) => {
  res.status(500).json({
    status: "fail",
    code: 500,
    message: err.message,
    data: "Internal Server Error",
  });
});

module.exports = app;
