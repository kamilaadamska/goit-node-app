const express = require("express");
const router = express.Router();

const { auth } = require("../../service/auth");

const {
  getHandler,
  getByIdHandler,
  postHandler,
  deleteHandler,
  putHandler,
  patchHandler,
} = require("../../controller/contacts");

router.get("/", auth, getHandler);

router.get("/:id", auth, getByIdHandler);

router.post("/", auth, postHandler);

router.delete("/:id", auth, deleteHandler);

router.put("/:id", auth, putHandler);

router.patch("/:id/favorite", auth, patchHandler);

module.exports = router;
