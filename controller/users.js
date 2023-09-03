const Joi = require("joi");
const User = require("../models/schemas/user");

const signupHandler = async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(7).required(),
  });

  const validation = schema.validate(req.body);

  if (validation.error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: validation.error.message,
    });
  }

  try {
    const newUser = new User({ email });
    newUser.setPassword(password);
    await newUser.save();

    return res.status(201).json({
      status: "success",
      code: 201,
      message: "Registration successful",
      data: newUser,
    });
  } catch (err) {
    console.log("An error occurred while adding the user:", err);
    next(err);
  }
};

module.exports = {
  signupHandler,
};
