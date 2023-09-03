const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../models/schemas/user");

const secret = "secret word";

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(7).required(),
});

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

const loginHandler = async (req, res, _) => {
  const { email, password } = req.body;

  const validation = schema.validate(req.body);

  if (validation.error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: validation.error.message,
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.validPassword(password)) {
      throw new Error();
    }

    const payload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    user.token = token;
    await user.save();

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Login successful",
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: "unauthorized",
      code: 401,
      message: `Incorrect login or password, ${err.message}`,
      data: "Bad request",
    });
  }
};

module.exports = {
  signupHandler,
  loginHandler,
};
