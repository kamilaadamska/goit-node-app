const Joi = require("joi");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");
const User = require("../models/schemas/user");
require("dotenv").config();

const secret = process.env.SECRET;

const { updateUserSub } = require("../models/users");

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

    const url = gravatar.url(email, {
      s: "250",
      d: "robohash",
    });

    newUser.avatarURL = url;

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

    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Login successful",
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
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

const logoutHandler = async (req, res, _) => {
  const { user } = req;

  try {
    user.token = null;
    await user.save();

    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({
      status: "unauthorized",
      code: 401,
      message: `Incorrect login or password, ${err.message}`,
      data: "Bad request",
    });
  }
};

const currentHandler = (req, res, _) => {
  const { email, subscription, avatarURL } = req.user;

  return res.json({
    status: "success",
    code: 200,
    data: {
      message: `Authorization was successful!`,
      email,
      subscription,
      avatarURL,
    },
  });
};

const patchSubHandler = async (req, res, _) => {
  const { subscription } = req.body;
  const { _id } = req.user;

  const schema = Joi.string().required();
  const validation = schema.validate(subscription);

  if (validation.error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `missing field subscription or subscription must be string`,
    });
  } else if (Object.keys(req.body).length > 1) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "only field subscription is required",
    });
  } else if (
    !(
      subscription === "starter" ||
      subscription === "pro" ||
      subscription === "business"
    )
  ) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message:
        "subscription field must have a value 'starter', 'pro' or 'business'",
    });
  }

  try {
    const result = await updateUserSub(_id, { subscription });

    if (!result) {
      throw new Error();
    }

    return res.json({ status: "success", code: 200, data: result });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      code: 404,
      data: "user not found",
      message: err.message,
    });
  }
};

const patchAvHandler = async (req, res, next) => {
  const { path: tmpPatchName, originalname } = req.file;
  const { user } = req;

  const lastDotIndex = originalname.lastIndexOf(".");
  const fileExtension =
    lastDotIndex === -1 ? "" : originalname.substring(lastDotIndex + 1);

  const newName = `avatar-${user._id}.${fileExtension}`;
  const storeAvatar = path.join(process.cwd(), "public/avatars");
  const newFilePath = path.join(storeAvatar, newName);

  try {
    const avatar = await Jimp.read(tmpPatchName);
    avatar.resize(250, 250);
    await avatar.writeAsync(tmpPatchName);

    await fs.rename(tmpPatchName, newFilePath);

    user.avatarURL = `/avatars/${newName}`;
    user.save();

    return res.json({
      status: "success",
      code: 200,
      avatarURL: user.avatarURL,
    });
  } catch (err) {
    await fs.unlink(tmpPatchName);
    return next(err);
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  logoutHandler,
  currentHandler,
  patchSubHandler,
  patchAvHandler,
};
