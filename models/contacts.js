const fs = require("fs").promises;
const path = require("path");

const pathToContacts = path.resolve("models", "contacts.json");

const readContacts = async () => {
  try {
    const data = await fs.readFile(pathToContacts, { encoding: "utf8" });
    const contacts = JSON.parse(data);

    return contacts;
  } catch (err) {
    console.log("There was an error reading the contact list:", err);
  }
};

const saveContacts = async (contacts) => {
  try {
    const contactsJSON = JSON.stringify(contacts);
    await fs.writeFile(pathToContacts, contactsJSON, { encoding: "utf8" });
    console.log(`Changes have been saved.`);
  } catch (err) {
    console.log(`Changes have not been saved:`, err);
  }
};

const listContacts = async () => {
  try {
    const data = await fs.readFile(pathToContacts, { encoding: "utf8" });
    const contacts = JSON.parse(data);

    return contacts;
  } catch (err) {
    console.log("There was an error reading the contact list:", err);
  }
};

const getContactById = async (id) => {
  try {
    const contacts = await listContacts();
    const searchedContact = contacts.filter((contact) => contact.id === id);

    return searchedContact;
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

const removeContact = async (id) => {
  try {
    const contacts = await readContacts();
    const index = contacts.findIndex((contact) => contact.id === id);
    if (index === -1) {
      console.log("Contact not found. Please try with another id.");
      return;
    }
    contacts.splice(index, 1);
    console.log("Contact removed successfully.");
    saveContacts(contacts);
  } catch (err) {
    console.log("An error occurred while deleting the contact:", err);
  }
};

const updateContact = async (contactId, body) => {};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
