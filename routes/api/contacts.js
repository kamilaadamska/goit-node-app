const express = require("express");
const router = express.Router();

const {
  getHandler,
  getByIdHandler,
  postHandler,
  deleteHandler,
  putHandler,
  patchHandler,
} = require("../../controller/contacts");

router.get("/", getHandler);

router.get("/:id", getByIdHandler);

router.post("/", postHandler);

router.delete("/:id", deleteHandler);

router.put("/:id", putHandler);

router.patch("/:id/favorite", patchHandler);

module.exports = router;
