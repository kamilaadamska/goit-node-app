const express = require("express");
const { nanoid } = require("nanoid");
const router = express.Router();

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
} = require("../../models/contacts");

router.get("/", async (_, res, __) => {
  const contacts = await listContacts();
  contacts.length === 0
    ? res.status(404).json({
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
    : res.status(404).json({
        status: "error",
        code: 404,
        message: "Not found",
      });
});

router.post("/", async (req, res, __) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Missing required name, email or phone field.",
    });
  }
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  addContact(newContact);
  res.status(201).json({ status: "success", code: 201, data: newContact });
});

router.delete("/:id", async (req, res, __) => {
  const { id } = req.params;
  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === id);
  if (index === -1) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "Not found",
    });
  }
  removeContact(index);
  res.json({
    status: "success",
    code: 200,
    message: "Contact deleted",
  });
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

module.exports = router;
