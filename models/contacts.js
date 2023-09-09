const Contact = require("./schemas/contact");

const listContacts = async (userId) => {
  return Contact.find({ owner: userId });
};

const getContactById = async (contactId, userId) => {
  return Contact.findOne({ _id: contactId, owner: userId });
};

const addContact = async (name, email, phone, userId) => {
  return Contact.create({ name, email, phone, owner: userId });
};

const removeContact = async (contactId, userId) => {
  return Contact.findOneAndRemove({ _id: contactId, owner: userId });
};

const updateContact = async (contactId, userId, fields) => {
  return Contact.findOneAndUpdate(
    { _id: contactId, owner: userId },
    { $set: fields },
    { new: true }
  );
};

const updateStatusContact = async (contactId, userId, body) => {
  return Contact.findOneAndUpdate(
    { _id: contactId, owner: userId },
    { $set: body },
    { new: true }
  );
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
