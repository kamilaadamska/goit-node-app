const Joi = require("joi");

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../models/contacts");

const getHandler = async (_, res, __) => {
  try {
    const contacts = await listContacts();

    if (contacts.length === 0) {
      throw new Error();
    }

    return res.json({
      status: "success",
      code: 200,
      data: contacts,
    });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      code: 404,
      data: "Contacts list is empty. Please add your first one using the POST method.",
      message: err.message,
    });
  }
};

const getByIdHandler = async (req, res, _) => {
  const { id } = req.params;
  try {
    const searchedContact = await getContactById(id);

    if (!searchedContact) {
      throw new Error();
    }

    return res.json({ status: "success", code: 200, data: searchedContact });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      code: 404,
      data: "not found",
      message: err.message,
    });
  }
};

const postHandler = async (req, res, next) => {
  const { name, email, phone } = req.body;

  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(7).max(15).required(),
  });

  const validation = schema.validate(req.body);

  if (validation.error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `missing required field or there is something wrong in your data: ${validation.error}`,
    });
  }

  try {
    const newContact = await addContact({ name, email, phone });

    return res
      .status(201)
      .json({ status: "success", code: 201, data: newContact });
  } catch (err) {
    console.log("An error occurred while adding the contact:", err);
    next(err);
  }
};

const deleteHandler = async (req, res, __) => {
  const { id } = req.params;
  try {
    const result = await removeContact(id);

    if (!result) {
      throw new Error();
    }

    return res.json({
      status: "success",
      code: 200,
      message: "contact deleted",
    });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      code: 404,
      data: "contact not found",
      message: err.message,
    });
  }
};

const putHandler = async (req, res, _) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  const schema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    phone: Joi.string().min(7).max(15),
  }).required();

  const validation = schema.validate(req.body);

  if (validation.error || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `there is something wrong in your data: ${
        validation.error ? validation.error : "missing fields"
      }`,
    });
  }

  try {
    const updatedContact = await updateContact(id, { name, email, phone });

    if (!updatedContact) {
      throw new Error();
    }

    return res.json({ status: "success", code: 200, data: updatedContact });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      code: 404,
      data: "contact not found",
      message: err.message,
    });
  }
};

const patchHandler = async (req, res, _) => {
  const { id } = req.params;
  const { favorite } = req.body;

  const schema = Joi.boolean().required();
  const validation = schema.validate(favorite);

  if (
    Object.keys(req.body).length > 1 ||
    Object.keys(req.body)[0] !== "favorite"
  ) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `${
        Object.keys(req.body).length > 1
          ? "only field favorite is required"
          : "there is missing field favorite"
      }`,
    });
  }

  if (validation.error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `favorite must be boolean`,
    });
  }

  try {
    const result = await updateStatusContact(id, { favorite });

    if (!result) {
      throw new Error();
    }

    return res.json({ status: "success", code: 200, data: result });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      code: 404,
      data: "contact not found",
      message: err.message,
    });
  }
};

module.exports = {
  getHandler,
  getByIdHandler,
  postHandler,
  deleteHandler,
  putHandler,
  patchHandler,
};
