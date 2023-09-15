const Joi = require("joi");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
const User = require("../models/schemas/user");
const { transporter, mailOptions } = require("../config/config-nodemailer");
require("dotenv").config();

const secret = process.env.SECRET;

const { updateUserSub, getUserByVerificToken } = require("../models/users");

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
    newUser.verificationToken = nanoid();

    await newUser.save();

    const link = `/users/verify/${newUser.verificationToken}`;

    transporter
      .sendMail(mailOptions(email, link))
      .then((info) => console.log(info))
      .catch((err) => console.log(err));

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

    if (!user || !user.validPassword(password) || !user.verify) {
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
      message: `Incorrect login or password or user is not verified, ${err.message}`,
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

const storeAvatar = path.join(process.cwd(), "public/avatars");

const patchAvHandler = async (req, res, next) => {
  const { path: tmpPatchName, originalname } = req.file;
  const { user } = req;

  const lastDotIndex = originalname.lastIndexOf(".");
  const fileExtension =
    lastDotIndex === -1 ? "" : originalname.substring(lastDotIndex + 1);

  const newName = `avatar-${user._id}.${fileExtension}`;
  const newFilePath = path.join(storeAvatar, newName);

  try {
    const avatar = await Jimp.read(tmpPatchName);
    avatar.resize(250, 250);
    await avatar.writeAsync(tmpPatchName);

    await fs.rename(tmpPatchName, newFilePath);

    user.avatarURL = `/avatars/${newName}`;
    await user.save();

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

const verificationHandler = async (req, res, _) => {
  const { verificationToken } = req.params;

  try {
    const user = await getUserByVerificToken(verificationToken);

    if (!user) {
      throw new Error();
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    return res.json({
      status: "success",
      code: 200,
      message: `Verification successful! Please log in!`,
    });
  } catch (err) {
    return res.status(404).json({
      status: "Error - Not Found",
      code: 404,
      data: "User not found",
      message: err.message,
    });
  }
};

const isVerifyHandler = async (req, res, _) => {
  const { email } = req.body;

  const schema = Joi.string().email().required();
  const validation = schema.validate(email);

  if (
    Object.keys(req.body).length > 1 ||
    Object.keys(req.body)[0] !== "email"
  ) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `${
        Object.keys(req.body).length > 1
          ? "only field email is required"
          : "missing required field email"
      }`,
    });
  }

  if (validation.error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `Please provide correct email`,
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error();
    }

    if (user.verify) {
      return res.status(400).json({
        status: "Bad request",
        code: 400,
        message: "Verification has already been passed",
      });
    }

    const link = `/users/verify/${user.verificationToken}`;

    transporter
      .sendMail(mailOptions(email, link))
      .then((info) => console.log(info))
      .catch((err) => console.log(err));

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Email with a verification link has been sent",
    });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      code: 404,
      data: "user not found",
      message: err.message,
    });
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  logoutHandler,
  currentHandler,
  patchSubHandler,
  patchAvHandler,
  storeAvatar,
  verificationHandler,
  isVerifyHandler,
};
