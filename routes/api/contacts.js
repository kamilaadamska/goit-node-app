const express = require("express");

const router = express.Router();

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");

router.get("/", async (_, res, next) => {
  try {
    const contacts = await listContacts();

    res.json({
      status: "success",
      code: 200,
      data: contacts,
    });
  } catch (err) {
    console.log("There was an error reading the contact list:", err);
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const searchedContact = await getContactById(id);

    res.json({ status: "success", code: 200, data: searchedContact });
  } catch (err) {
    console.log("An error occurred while searching for the contact:", err);
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `there are missing fields`,
    });
  }

  try {
    const result = await addContact({ name, email, phone });
    res.status(201).json({ status: "success", code: 201, data: result });
  } catch (err) {
    console.log("An error occurred while adding the contact:", err);
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await removeContact(id);

    res.json({
      status: "success",
      code: 200,
      message: "contact deleted",
    });
  } catch (err) {
    console.log("An error occurred while deleting the contact:", err);
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    const result = await updateContact(id, { name, email, phone });

    res.json({ status: "success", code: 200, data: result });
  } catch (err) {
    console.log("An error occurred while updating the contact:", err);
    next(err);
  }
});

router.patch("/:id/favorite", async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `there is missing field favorite`,
    });
  }

  try {
    const result = await updateStatusContact(id, { favorite });

    res.json({ status: "success", code: 200, data: result });
  } catch (err) {
    console.log("An error occurred while updating the contact:", err);
    next(err);
  }
});

module.exports = router;
