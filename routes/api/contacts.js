const express = require("express");

const router = express.Router();

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
} = require("../../models/contacts");

router.get("/", async (_, res, __) => {
  const contacts = await listContacts();
  contacts.length === 0
    ? res.json({
        status: "error",
        code: 404,
        message:
          "Contacts list is empty. Please add your first one using the POST method.",
      })
    : res.json({
        status: "success",
        code: 200,
        data: contacts,
      });
});

router.get("/:id", async (req, res, __) => {
  const { id } = req.params;
  const [searchedContact] = await getContactById(id);
  searchedContact
    ? res.json({ status: "success", code: 200, data: searchedContact })
    : res.json({
        status: "error",
        code: 404,
        message: "Not found",
      });
});

router.post("/", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.delete("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

module.exports = router;
