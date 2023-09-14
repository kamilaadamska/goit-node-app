const User = require("./schemas/user");

const updateUserSub = async (id, body) => {
  return User.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true });
};

const getUserByVerificToken = async (token) => {
  return User.findOne({ verificationToken: token });
};

module.exports = { updateUserSub, getUserByVerificToken };
