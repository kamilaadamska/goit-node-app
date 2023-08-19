const fs = require("fs").promises;
const path = require("path");

const pathToContacts = path.resolve("models", "contacts.json");

const saveContacts = async (contacts) => {
  try {
    const contactsJSON = JSON.stringify(contacts);
    await fs.writeFile(pathToContacts, contactsJSON, { encoding: "utf8" });
  } catch (err) {
    console.log(`Changes have not been saved:`, err);
  }
};

const listContacts = async () => {
  try {
    const data = await fs.readFile(pathToContacts, { encoding: "utf8" });
    return JSON.parse(data);
  } catch (err) {
    console.log("There was an error reading the contact list:", err);
  }
};

const getContactById = async (id) => {
  try {
    const contacts = await listContacts();
    return contacts.find((contact) => contact.id === id);
  } catch (err) {
    console.log("An error occurred while searching for the contact:", err);
  }
};

const addContact = async (newContact) => {
  try {
    const contacts = await listContacts();
    contacts.push(newContact);
    saveContacts(contacts);
  } catch (err) {
    console.log("An error occurred while adding the contact:", err);
  }
};

const removeContact = async (index) => {
  try {
    const contacts = await listContacts();
    contacts.splice(index, 1);
    saveContacts(contacts);
  } catch (err) {
    console.log("An error occurred while deleting the contact:", err);
  }
};

const updateContact = async (id, updatedContact) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === id);

  contacts[index] = updatedContact;
  saveContacts(contacts);
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
