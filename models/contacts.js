const Contact = require("./schemas/contact");

const listContacts = async () => {
  return Contact.find();
};

const getContactById = async (id) => {
  return Contact.findOne({ _id: id });
};

const addContact = async ({ name, email, phone }) => {
  return Contact.create({ name, email, phone });
};

const removeContact = async (id) => {
  return Contact.findByIdAndRemove({ _id: id });
};

const updateContact = async (id, fields) => {
  return Contact.findByIdAndUpdate(
    { _id: id },
    { $set: fields },
    { new: true }
  );
};

const updateStatusContact = async (id, body) => {
  return Contact.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
